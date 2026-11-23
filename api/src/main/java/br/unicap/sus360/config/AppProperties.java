package br.unicap.sus360.config;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.ZoneId;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Propriedades "app.*" do application.yml. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(List<String> corsOrigins, ZoneId fuso, Jwt jwt) {

    public AppProperties {
        corsOrigins = corsOrigins == null
                ? List.of()
                : corsOrigins.stream().map(String::trim).filter(s -> !s.isEmpty()).toList();
        fuso = fuso == null ? ZoneId.of("America/Recife") : fuso;
        if (jwt == null) {
            throw new IllegalStateException("Configure app.jwt (variável JWT_SECRET).");
        }
    }

    /**
     * @param segredo   chave HS256; precisa de pelo menos 32 bytes
     * @param expiracao validade do token de login
     */
    public record Jwt(String segredo, Duration expiracao) {

        public Jwt {
            if (segredo == null || segredo.getBytes(StandardCharsets.UTF_8).length < 32) {
                throw new IllegalStateException(
                        "JWT_SECRET precisa ter pelo menos 32 caracteres. Gere um valor aleatório e coloque no .env.");
            }
            expiracao = expiracao == null ? Duration.ofHours(24) : expiracao;
        }
    }
}
