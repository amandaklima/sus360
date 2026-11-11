package br.unicap.sus360.auth;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import br.unicap.sus360.erro.Erros.MuitasTentativasException;

class LimiteTentativasTest {

    /** Relógio que o teste pode adiantar. */
    static class RelogioAjustavel extends Clock {
        Instant agora = Instant.parse("2026-11-10T12:00:00Z");

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return agora;
        }
    }

    @Test
    void bloqueiaAposCincoFalhasELiberaDepoisDaJanela() {
        RelogioAjustavel relogio = new RelogioAjustavel();
        LimiteTentativas limite = new LimiteTentativas(relogio);

        for (int i = 0; i < LimiteTentativas.MAXIMO; i++) {
            assertDoesNotThrow(() -> limite.verificar("a@b.com"));
            limite.registrarFalha("a@b.com");
        }
        assertThrows(MuitasTentativasException.class, () -> limite.verificar("a@b.com"));
        assertDoesNotThrow(() -> limite.verificar("outro@b.com"));

        relogio.agora = relogio.agora.plus(LimiteTentativas.JANELA).plus(Duration.ofSeconds(1));
        assertDoesNotThrow(() -> limite.verificar("a@b.com"));
    }

    @Test
    void sucessoZeraAsFalhas() {
        LimiteTentativas limite = new LimiteTentativas(new RelogioAjustavel());
        for (int i = 0; i < LimiteTentativas.MAXIMO - 1; i++) {
            limite.registrarFalha("a@b.com");
        }
        limite.registrarSucesso("a@b.com");
        limite.registrarFalha("a@b.com");
        assertDoesNotThrow(() -> limite.verificar("a@b.com"));
    }
}
