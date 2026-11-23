package br.unicap.sus360.unidade;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.unicap.sus360.erro.Erros.NaoEncontradoException;
import br.unicap.sus360.erro.Erros.ValidacaoException;

@RestController
@RequestMapping("/api/unidades")
public class UnidadeController {

    private final UnidadeRepository unidades;

    public UnidadeController(UnidadeRepository unidades) {
        this.unidades = unidades;
    }

    /**
     * GET /api/unidades?tipo=Hospital|UPA|Posto&servico=Vacinas|Exames|Atendimentos|Medicamentos&busca=texto
     */
    @GetMapping
    public List<Unidade> listar(
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String servico,
            @RequestParam(required = false) String busca) {
        return unidades.listar(
                canonico("tipo", tipo, Unidade.TIPOS),
                canonico("servico", servico, Unidade.CATEGORIAS),
                busca == null ? null : busca.trim());
    }

    /** GET /api/unidades/{id} */
    @GetMapping("/{id}")
    public Unidade buscar(@PathVariable long id) {
        return unidades.buscarPorId(id)
                .orElseThrow(() -> new NaoEncontradoException("Unidade não encontrada."));
    }

    /** Aceita o valor sem diferenciar maiúsculas e devolve a grafia oficial; rejeita valores desconhecidos. */
    private static String canonico(String parametro, String valor, List<String> permitidos) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return permitidos.stream()
                .filter(p -> p.equalsIgnoreCase(valor.trim()))
                .findFirst()
                .orElseThrow(() -> new ValidacaoException(parametro,
                        "Valor inválido. Use: " + String.join(", ", permitidos) + "."));
    }
}
