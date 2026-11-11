package br.unicap.sus360.comum;

import java.util.List;

/**
 * Página de resultados. {@code pagina} começa em 1 (igual ao front).
 * {@code totalPaginas} nunca é menor que 1, para o front exibir "1 de 1" quando a lista está vazia.
 */
public record Pagina<T>(List<T> conteudo, int pagina, int tamanho, long totalElementos, int totalPaginas) {

    public static <T> Pagina<T> de(List<T> conteudo, int pagina, int tamanho, long totalElementos) {
        int total = (int) Math.max(1, (totalElementos + tamanho - 1) / tamanho);
        return new Pagina<>(conteudo, pagina, tamanho, totalElementos, total);
    }
}
