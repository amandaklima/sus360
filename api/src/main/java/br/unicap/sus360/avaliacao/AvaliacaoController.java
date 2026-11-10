package br.unicap.sus360.avaliacao;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.unicap.sus360.auth.AuthController;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.AvaliacaoDetalhe;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.AvaliacaoResumo;
import br.unicap.sus360.avaliacao.AvaliacaoDtos.NovaAvaliacao;
import br.unicap.sus360.comum.Pagina;
import jakarta.validation.Valid;

@RestController
public class AvaliacaoController {

    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) {
        this.service = service;
    }

    /** GET /api/unidades/{id}/avaliacoes?nota=1..5&page=1&size=4 */
    @GetMapping("/api/unidades/{unidadeId}/avaliacoes")
    public Pagina<AvaliacaoResumo> listar(
            @PathVariable long unidadeId,
            @RequestParam(required = false) Integer nota,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "4") int size) {
        return service.listarPorUnidade(unidadeId, nota, page, size);
    }

    /** GET /api/avaliacoes/{id} */
    @GetMapping("/api/avaliacoes/{id}")
    public AvaliacaoDetalhe buscar(@PathVariable long id) {
        return service.buscar(id);
    }

    /** POST /api/avaliacoes (exige login) → 201 com a avaliação criada. */
    @PostMapping("/api/avaliacoes")
    public ResponseEntity<AvaliacaoDetalhe> criar(@Valid @RequestBody NovaAvaliacao nova,
            @AuthenticationPrincipal Jwt token) {
        AvaliacaoDetalhe criada = service.criar(nova, AuthController.idDo(token));
        return ResponseEntity.created(URI.create("/api/avaliacoes/" + criada.id())).body(criada);
    }
}
