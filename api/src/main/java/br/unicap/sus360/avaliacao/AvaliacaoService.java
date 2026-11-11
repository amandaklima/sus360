package br.unicap.sus360.avaliacao;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.unicap.sus360.auth.AuthDtos.Usuario;
import br.unicap.sus360.auth.AuthService;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.AvaliacaoDetalhe;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.AvaliacaoResumo;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.NovaAvaliacao;
import br.unicap.sus360.comum.Pagina;
import br.unicap.sus360.config.AppProperties;
import br.unicap.sus360.erro.Erros.CampoErro;
import br.unicap.sus360.erro.Erros.NaoEncontradoException;
import br.unicap.sus360.erro.Erros.ValidacaoException;
import br.unicap.sus360.unidade.UnidadeRepository;

@Service
public class AvaliacaoService {

    static final int TAMANHO_MAXIMO = 50;

    private final AvaliacaoRepository avaliacoes;
    private final UnidadeRepository unidades;
    private final AuthService auth;
    private final AppProperties props;
    private final Clock relogio;

    public AvaliacaoService(AvaliacaoRepository avaliacoes, UnidadeRepository unidades, AuthService auth,
            AppProperties props) {
        this.avaliacoes = avaliacoes;
        this.unidades = unidades;
        this.auth = auth;
        this.props = props;
        this.relogio = Clock.systemUTC();
    }

    @Transactional(readOnly = true)
    public Pagina<AvaliacaoResumo> listarPorUnidade(long unidadeId, Integer nota, int pagina, int tamanho) {
        if (nota != null && (nota < 1 || nota > 5)) {
            throw new ValidacaoException("nota", "A nota deve ser de 1 a 5.");
        }
        if (!unidades.existe(unidadeId)) {
            throw new NaoEncontradoException("Unidade não encontrada.");
        }
        int paginaOk = Math.max(1, pagina);
        int tamanhoOk = Math.clamp(tamanho, 1, TAMANHO_MAXIMO);

        long total = avaliacoes.contarPorUnidade(unidadeId, nota);
        List<AvaliacaoResumo> conteudo = avaliacoes.listarPorUnidade(
                unidadeId, nota, tamanhoOk, (long) (paginaOk - 1) * tamanhoOk);
        return Pagina.de(conteudo, paginaOk, tamanhoOk, total);
    }

    @Transactional(readOnly = true)
    public AvaliacaoDetalhe buscar(long id) {
        return avaliacoes.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Avaliação não encontrada."));
    }

    @Transactional
    public AvaliacaoDetalhe criar(NovaAvaliacao nova, long usuarioId) {
        Usuario autor = auth.usuario(usuarioId); // 401 se a conta não existir mais
        List<CampoErro> erros = new ArrayList<>();

        // O front calcula "hoje" em UTC; aceitamos a maior das duas datas para não barrar ninguém à noite.
        LocalDate hojeLocal = LocalDate.now(relogio.withZone(props.fuso()));
        LocalDate hojeUtc = LocalDate.now(relogio.withZone(ZoneOffset.UTC));
        LocalDate limite = hojeLocal.isAfter(hojeUtc) ? hojeLocal : hojeUtc;
        if (nova.data().isAfter(limite)) {
            erros.add(new CampoErro("data", "A data não pode ser no futuro."));
        }
        if (!unidades.existe(nova.unidadeId())) {
            erros.add(new CampoErro("unidadeId", "Unidade não encontrada."));
        }
        if (!erros.isEmpty()) {
            throw new ValidacaoException(erros);
        }

        long id = avaliacoes.inserir(
                nova.unidadeId(),
                autor.id(),
                autor.nome(),
                nova.nota(),
                nova.data(),
                nova.comentario().trim());
        return buscar(id);
    }
}
