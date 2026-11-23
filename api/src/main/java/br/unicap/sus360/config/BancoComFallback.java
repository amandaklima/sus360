package br.unicap.sus360.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

import org.apache.commons.logging.Log;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.boot.logging.DeferredLogFactory;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Escolhe o banco antes do Spring subir: tenta o PostgreSQL (Supabase) e, se ele não responder,
 * usa um banco H2 EM MEMÓRIA com as mesmas tabelas e os dados de demonstração.
 *
 * <p>Modo (variável {@code DB_MODO}):
 * <ul>
 *   <li>{@code auto} (padrão): tenta o Supabase; se não conectar, usa a memória;</li>
 *   <li>{@code postgres}: só Supabase, sem reserva (a API falha se ele estiver fora);</li>
 *   <li>{@code memoria}: sempre em memória, nem tenta o Supabase.</li>
 * </ul>
 *
 * <p>Ajustes opcionais: {@code DB_TIMEOUT} (segundos de espera por tentativa, padrão 20) e
 * {@code DB_TENTATIVAS} (quantas vezes tentar antes de desistir, padrão 2).
 *
 * <p>A escolha acontece uma vez, ao subir a API. Os dados do banco em memória somem quando ela reinicia.
 */
public class BancoComFallback implements EnvironmentPostProcessor, Ordered {

    private static final String FONTE = "bancoEscolhido";
    private static final int TEMPO_LIMITE_PADRAO = 20;
    private static final int TENTATIVAS_PADRAO = 2;

    private static final String URL_MEMORIA =
            "jdbc:h2:mem:sus360;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;"
                    + "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";

    private final Log log;

    public BancoComFallback(DeferredLogFactory logFactory) {
        this.log = logFactory.getLog(BancoComFallback.class);
    }

    /** Roda depois do carregamento do application.yml e do .env. */
    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment env, SpringApplication aplicacao) {
        String modo = env.getProperty("DB_MODO", "auto").trim().toLowerCase();
        String schema = env.getProperty("DB_SCHEMA", "sus360");
        Map<String, Object> props = new LinkedHashMap<>();

        boolean usarMemoria;
        switch (modo) {
            case "memoria", "memória", "h2" -> {
                log.warn("DB_MODO=memoria: usando banco H2 em memória (o Supabase não será usado).");
                usarMemoria = true;
            }
            case "postgres", "supabase" -> {
                log.info("DB_MODO=postgres: usando só o Supabase, sem banco de reserva.");
                usarMemoria = false;
            }
            default -> usarMemoria = !postgresResponde(env);
        }

        if (usarMemoria) {
            props.put("spring.datasource.url", URL_MEMORIA);
            props.put("spring.datasource.username", "sa");
            props.put("spring.datasource.password", "");
            props.put("spring.flyway.locations", "classpath:db/h2");
            props.put("spring.flyway.create-schemas", "false");
            // sem DB_PASSWORD/JWT_SECRET configurados, a API ainda precisa subir: chave temporária para os logins
            if (segredoJwt(env).length() < 32) {
                props.put("app.jwt.segredo", UUID.randomUUID() + "-" + UUID.randomUUID());
                log.warn("JWT_SECRET ausente: gerada uma chave temporária (os logins valem só até reiniciar a API).");
            }
            log.warn("""

                    ==================================================================
                     BANCO EM MEMÓRIA (H2) em uso — os dados somem ao reiniciar a API.
                     Para voltar ao Supabase, deixe-o disponível e reinicie a API.
                    ==================================================================""");
        } else {
            props.put("spring.datasource.hikari.schema", schema);
            props.put("spring.flyway.schemas", schema);
            props.put("spring.flyway.default-schema", schema);
            props.put("spring.flyway.create-schemas", "true");
            props.put("spring.flyway.locations", "classpath:db/migration");
        }

        env.getPropertySources().addFirst(new MapPropertySource(FONTE, props));
    }

    /** Abre (e fecha) uma conexão rápida com o PostgreSQL só para saber se ele está de pé. */
    private boolean postgresResponde(ConfigurableEnvironment env) {
        String url;
        String usuario;
        String senha;
        try {
            url = env.getProperty("spring.datasource.url", "");
            usuario = env.getProperty("spring.datasource.username", "");
            senha = env.getProperty("spring.datasource.password", "");
        } catch (IllegalArgumentException e) {
            log.warn("Configuração do banco incompleta; usando o banco em memória.");
            return false;
        }
        if (url.isBlank() || senha.isBlank()) {
            log.warn("DB_PASSWORD não informada: o Supabase não será usado, indo para o banco em memória.");
            return false;
        }

        int limite = inteiro(env, "DB_TIMEOUT", TEMPO_LIMITE_PADRAO);
        int tentativas = inteiro(env, "DB_TENTATIVAS", TENTATIVAS_PADRAO);

        Properties conexao = new Properties();
        conexao.setProperty("user", usuario);
        conexao.setProperty("password", senha);
        conexao.setProperty("loginTimeout", String.valueOf(limite));
        conexao.setProperty("connectTimeout", String.valueOf(limite));
        conexao.setProperty("socketTimeout", String.valueOf(limite));

        for (int n = 1; n <= tentativas; n++) {
            long inicio = System.currentTimeMillis();
            try (Connection c = DriverManager.getConnection(url, conexao); Statement s = c.createStatement()) {
                s.execute("select 1");
                log.info("Supabase (PostgreSQL) respondeu em " + (System.currentTimeMillis() - inicio)
                        + " ms: usando o banco real.");
                return true;
            } catch (SQLException e) {
                Throwable causa = e.getCause() != null ? e.getCause() : e;
                log.warn("Supabase: tentativa " + n + "/" + tentativas + " falhou após "
                        + (System.currentTimeMillis() - inicio) + " ms — "
                        + e.getMessage().lines().findFirst().orElse("sem detalhe")
                        + " [" + causa.getClass().getSimpleName() + ", SQLState " + e.getSQLState() + "]");
            }
        }
        log.warn("Não foi possível conectar no Supabase. Usando o banco em memória.");
        return false;
    }

    private static int inteiro(ConfigurableEnvironment env, String nome, int padrao) {
        try {
            int valor = Integer.parseInt(env.getProperty(nome, String.valueOf(padrao)).trim());
            return valor > 0 ? valor : padrao;
        } catch (IllegalArgumentException e) {
            return padrao;
        }
    }

    private static String segredoJwt(ConfigurableEnvironment env) {
        try {
            String segredo = env.getProperty("app.jwt.segredo", "");
            return segredo == null ? "" : segredo;
        } catch (IllegalArgumentException e) {
            return "";
        }
    }
}
