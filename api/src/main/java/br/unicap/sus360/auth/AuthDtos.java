package br.unicap.sus360.auth;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record CadastroRequest(
            @NotBlank(message = "Informe seu nome.")
            @Size(max = 100, message = "O nome pode ter no máximo 100 caracteres.")
            String nome,

            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "Informe um e-mail válido.")
            @Size(max = 255, message = "E-mail muito longo.")
            String email,

            @NotBlank(message = "Crie uma senha.")
            @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres.")
            String senha) {

        public CadastroRequest {
            nome = aparar(nome);
            email = aparar(email);
        }
    }

    public record LoginRequest(
            @NotBlank(message = "Informe seu e-mail.")
            @Email(message = "Informe um e-mail válido.")
            String email,

            @NotBlank(message = "Informe sua senha.")
            String senha) {

        public LoginRequest {
            email = aparar(email);
        }
    }

    /**
     * Remove espaços nas pontas antes da validação: o autocompletar do celular costuma
     * colocar um espaço depois do e-mail, e isso fazia o login falhar como "e-mail inválido".
     * A senha não é alterada (espaço pode fazer parte dela).
     */
    private static String aparar(String texto) {
        return texto == null ? null : texto.strip();
    }

    public record Usuario(long id, String nome, String email) {
    }

    /** Resposta de login e cadastro. O front guarda o token e o envia em "Authorization: Bearer". */
    public record Sessao(String token, Instant expiraEm, Usuario usuario) {
    }
}
