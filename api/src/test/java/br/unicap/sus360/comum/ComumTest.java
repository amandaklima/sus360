package br.unicap.sus360.comum;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;

class ComumTest {

    @Test
    void normalizaAcentoEMaiuscula() {
        assertEquals("sao jose vacinacao", Texto.normalizar("  São José VACINAÇÃO "));
    }

    @Test
    void escapaCuringasDoLike() {
        assertEquals("%50\\% de\\_desconto%", Texto.padraoContem("50% de_desconto"));
    }

    @Test
    void totalDePaginasNuncaEhZero() {
        assertEquals(1, Pagina.de(List.of(), 1, 4, 0).totalPaginas());
        assertEquals(1, Pagina.de(List.of(), 1, 4, 4).totalPaginas());
        assertEquals(2, Pagina.de(List.of(), 1, 4, 5).totalPaginas());
    }
}
