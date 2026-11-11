package br.unicap.sus360.auth;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.AuthenticationEntryPoint;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.jwk.source.ImmutableSecret;

import br.unicap.sus360.config.AppProperties;
import br.unicap.sus360.erro.Erros.ErroResposta;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Segurança da API: sem sessão no servidor; o front manda "Authorization: Bearer &lt;token&gt;".
 * Leitura (GET) é pública. Enviar avaliação e consultar a própria conta exigem login.
 */
@Configuration
public class SegurancaConfig {

    static final String EMISSOR = "sus360-api";

    @Bean
    SecurityFilterChain filtros(HttpSecurity http, ObjectMapper json) throws Exception {
        AuthenticationEntryPoint naoLogado = (req, res, ex) -> escrever(res, json, HttpStatus.UNAUTHORIZED,
                req.getHeader("Authorization") == null
                        ? "Faça login para continuar."
                        : "Sua sessão expirou. Entre novamente.");
        AccessDeniedHandler semPermissao = (req, res, ex) -> escrever(res, json, HttpStatus.FORBIDDEN,
                "Você não tem permissão para esta ação.");

        http
                .csrf(AbstractHttpConfigurer::disable) // token no cabeçalho, sem cookie → CSRF não se aplica
                .cors(Customizer.withDefaults())       // usa as origens do WebConfig
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/cadastro").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/**", "/actuator/health").permitAll()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o
                        .jwt(Customizer.withDefaults())
                        .authenticationEntryPoint(naoLogado)
                        .accessDeniedHandler(semPermissao))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(naoLogado)
                        .accessDeniedHandler(semPermissao));
        return http.build();
    }

    /**
     * Só lê o token onde o login importa. Nas leituras públicas (GET /api/..., exceto /api/auth/me)
     * o token é ignorado — senão um token vencido guardado no navegador bloquearia até a lista de unidades.
     */
    @Bean
    BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver padrao = new DefaultBearerTokenResolver();
        return req -> {
            boolean leituraPublica = HttpMethod.GET.matches(req.getMethod())
                    && !"/api/auth/me".equals(req.getRequestURI());
            return leituraPublica ? null : padrao.resolve(req);
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtEncoder jwtEncoder(AppProperties props) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(chave(props)));
    }

    @Bean
    JwtDecoder jwtDecoder(AppProperties props) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(chave(props))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(EMISSOR)); // inclui validade (exp)
        return decoder;
    }

    private static SecretKey chave(AppProperties props) {
        return new SecretKeySpec(props.jwt().segredo().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    private static void escrever(HttpServletResponse res, ObjectMapper json, HttpStatus status, String mensagem)
            throws java.io.IOException {
        res.setStatus(status.value());
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        json.writeValue(res.getOutputStream(), ErroResposta.de(mensagem));
    }
}
