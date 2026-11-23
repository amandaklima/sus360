package br.unicap.sus360.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import br.unicap.sus360.erro.Erros.MuitasTentativasException;

/**
 * Freia tentativas de adivinhar senha: após {@value #MAXIMO} erros seguidos para o mesmo e-mail
 * dentro da janela, novas tentativas são recusadas até a janela passar. Fica em memória
 * (zera ao reiniciar a API), o que basta para uma única instância.
 */
@Component
public class LimiteTentativas {

    static final int MAXIMO = 5;
    static final Duration JANELA = Duration.ofMinutes(15);

    private final Map<String, Deque<Instant>> falhas = new ConcurrentHashMap<>();
    private final Clock relogio;

    public LimiteTentativas() {
        this(Clock.systemUTC());
    }

    LimiteTentativas(Clock relogio) {
        this.relogio = relogio;
    }

    /** Lança {@link MuitasTentativasException} se o e-mail estiver bloqueado. */
    public void verificar(String email) {
        Deque<Instant> lista = falhas.get(email);
        if (lista == null) {
            return;
        }
        synchronized (lista) {
            limpar(lista);
            if (lista.size() >= MAXIMO) {
                long segundos = Duration.between(Instant.now(relogio), lista.peekFirst().plus(JANELA)).toSeconds();
                throw new MuitasTentativasException(Math.max(1, segundos));
            }
        }
    }

    public void registrarFalha(String email) {
        Deque<Instant> lista = falhas.computeIfAbsent(email, e -> new ArrayDeque<>());
        synchronized (lista) {
            limpar(lista);
            lista.addLast(Instant.now(relogio));
        }
    }

    public void registrarSucesso(String email) {
        falhas.remove(email);
    }

    private void limpar(Deque<Instant> lista) {
        Instant limite = Instant.now(relogio).minus(JANELA);
        while (!lista.isEmpty() && lista.peekFirst().isBefore(limite)) {
            lista.pollFirst();
        }
    }
}
