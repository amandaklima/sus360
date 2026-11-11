package br.unicap.sus360.comum;

import java.text.Normalizer;
import java.util.Locale;

public final class Texto {

    private Texto() {
    }

    /** Minúsculas e sem acento — mesma regra da função SQL normalizar(). */
    public static String normalizar(String texto) {
        if (texto == null) {
            return "";
        }
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return semAcento.toLowerCase(Locale.ROOT).trim();
    }

    /** Padrão de LIKE "%texto%", escapando os curingas digitados pelo usuário. */
    public static String padraoContem(String texto) {
        String escapado = normalizar(texto)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escapado + "%";
    }
}
