package br.unicap.sus360.unidade;

import java.util.List;

/**
 * Unidade de saúde como o front espera em GET /api/unidades.
 *
 * @param nota       média das avaliações (0 quando ainda não há avaliações)
 * @param avaliacoes quantidade de avaliações
 * @param servicos   nomes dos serviços oferecidos
 */
public record Unidade(
        long id,
        String nome,
        String tipo,
        String endereco,
        String bairro,
        String horario,
        String telefone,
        String foto,
        double nota,
        long avaliacoes,
        List<String> servicos) {

    /** Tipos aceitos (coluna unidade.tipo). */
    public static final List<String> TIPOS = List.of("Hospital", "UPA", "Posto");

    /** Categorias de serviço aceitas (coluna unidade_servico.categoria). */
    public static final List<String> CATEGORIAS = List.of("Vacinas", "Exames", "Atendimentos", "Medicamentos");
}
