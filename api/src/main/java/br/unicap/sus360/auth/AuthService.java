package br.unicap.sus360.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.unicap.sus360.auth.AuthDtos.CadastroRequest;
import br.unicap.sus360.auth.AuthDtos.LoginRequest;
import br.unicap.sus360.auth.AuthDtos.Sessao;
import br.unicap.sus360.auth.AuthDtos.Usuario;
import br.unicap.sus360.auth.UsuarioRepository.UsuarioComSenha;
import br.unicap.sus360.config.AppProperties;
import br.unicap.sus360.erro.Erros.ConflitoException;
import br.unicap.sus360.erro.Erros.NaoAutorizadoException;
import br.unicap.sus360.erro.Erros.ValidacaoException;

@Service
public class AuthService {

    /** Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails têm conta. */
    static final String CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";

    private final UsuarioRepository usuarios;
    private final PasswordEncoder senhas;
    private final JwtEncoder jwt;
    private final LimiteTentativas limite;
    private final AppProperties props;
    /** Hash de referência para gastar o mesmo tempo quando o e-mail não existe. */
    private final String hashFalso;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder senhas, JwtEncoder jwt,
            LimiteTentativas limite, AppProperties props) {
        this.usuarios = usuarios;
        this.senhas = senhas;
        this.jwt = jwt;
        this.limite = limite;
        this.props = props;
        this.hashFalso = senhas.encode("senha-que-ninguem-usa");
    }

    @Transactional
    public Sessao cadastrar(CadastroRequest req) {
        String email = normalizarEmail(req.email());
        if (req.senha().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ValidacaoException("senha", "A senha é longa demais. Use até 72 caracteres sem acento.");
        }
        if (usuarios.buscarPorEmail(email).isPresent()) {
            throw new ConflitoException("email", "Este e-mail já está cadastrado. Faça login.");
        }
        try {
            long id = usuarios.inserir(req.nome().trim(), email, senhas.encode(req.senha()));
            return emitir(new Usuario(id, req.nome().trim(), email));
        } catch (DuplicateKeyException e) {
            // dois cadastros simultâneos com o mesmo e-mail
            throw new ConflitoException("email", "Este e-mail já está cadastrado. Faça login.");
        }
    }

    public Sessao entrar(LoginRequest req) {
        String email = normalizarEmail(req.email());
        limite.verificar(email);

        Optional<UsuarioComSenha> encontrado = usuarios.buscarPorEmail(email);
        boolean senhaOk = senhaConfere(req.senha(), encontrado.map(UsuarioComSenha::senhaHash).orElse(hashFalso));

        if (encontrado.isEmpty() || !senhaOk) {
            limite.registrarFalha(email);
            throw new NaoAutorizadoException(CREDENCIAIS_INVALIDAS);
        }
        limite.registrarSucesso(email);
        return emitir(encontrado.get().usuario());
    }

    /** Usuário do token; 401 se a conta não existir mais. */
    public Usuario usuario(long id) {
        return usuarios.buscarPorId(id)
                .orElseThrow(() -> new NaoAutorizadoException("Sua sessão expirou. Entre novamente."));
    }

    private boolean senhaConfere(String senha, String hash) {
        // BCrypt só considera 72 bytes; senhas maiores nunca foram aceitas no cadastro
        if (senha.getBytes(StandardCharsets.UTF_8).length > 72) {
            senhas.matches("x", hash);
            return false;
        }
        return senhas.matches(senha, hash);
    }

    private Sessao emitir(Usuario usuario) {
        Instant agora = Instant.now();
        Instant expira = agora.plus(props.jwt().expiracao());
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(SegurancaConfig.EMISSOR)
                .subject(String.valueOf(usuario.id()))
                .issuedAt(agora)
                .expiresAt(expira)
                .claim("nome", usuario.nome())
                .build();
        String token = jwt.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return new Sessao(token, expira, usuario);
    }

    static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
