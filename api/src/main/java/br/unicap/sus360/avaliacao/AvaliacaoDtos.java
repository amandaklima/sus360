package br.unicap.sus360.avaliacao;

import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Formatos de entrada e saída das avaliações. Datas saem como "yyyy-MM-dd". */
public final class AvaliacaoDtos {

    private AvaliacaoDtos() {
    }

    /** Item da lista em GET /api/unidades/{id}/avaliacoes. */
    public record AvaliacaoResumo(long id, String autor, int nota, LocalDate data, String texto) {
    }

    /** Dados da unidade embutidos no detalhe da avaliação. */
    public record UnidadeAvaliada(long id, String nome, String tipo, String endereco, String horario, String telefone) {
    }

    /** GET /api/avaliacoes/{id} e resposta do POST. */
    public record AvaliacaoDetalhe(long id, String autor, int nota, LocalDate data, String texto,
            UnidadeAvaliada unidade) {
    }

    /**
     * Corpo do POST /api/avaliacoes (os nomes batem com os campos do formulário do front).
     * O autor não vem no corpo: é o nome da conta logada.
     */
    public record NovaAvaliacao(
            @NotNull(message = "Informe a data do atendimento.")
            LocalDate data,

            @NotNull(message = "Escolha a unidade.")
            Long unidadeId,

            @NotNull(message = "Escolha uma nota de 1 a 5 estrelas.")
            @Min(value = 1, message = "Escolha uma nota de 1 a 5 estrelas.")
            @Max(value = 5, message = "Escolha uma nota de 1 a 5 estrelas.")
            Integer nota,

            @NotBlank(message = "Escreva um comentário.")
            @Size(max = 500, message = "O comentário pode ter no máximo 500 caracteres.")
            String comentario) {
    }
}
