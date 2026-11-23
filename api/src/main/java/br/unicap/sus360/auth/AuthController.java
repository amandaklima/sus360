package br.unicap.sus360.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import br.unicap.sus360.auth.AuthDtos.CadastroRequest;
import br.unicap.sus360.auth.AuthDtos.LoginRequest;
import br.unicap.sus360.auth.AuthDtos.Sessao;
import br.unicap.sus360.auth.AuthDtos.Usuario;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    /** POST /api/auth/cadastro { nome, email, senha } → 201 { token, expiraEm, usuario } (já entra logado). */
    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public Sessao cadastrar(@Valid @RequestBody CadastroRequest req) {
        return auth.cadastrar(req);
    }

    /** POST /api/auth/login { email, senha } → { token, expiraEm, usuario } */
    @PostMapping("/login")
    public Sessao entrar(@Valid @RequestBody LoginRequest req) {
        return auth.entrar(req);
    }

    /** GET /api/auth/me (com token) → usuário logado. Serve para o front checar se a sessão vale. */
    @GetMapping("/me")
    public Usuario eu(@AuthenticationPrincipal Jwt token) {
        return auth.usuario(idDo(token));
    }

    public static long idDo(Jwt token) {
        return Long.parseLong(token.getSubject());
    }
}
