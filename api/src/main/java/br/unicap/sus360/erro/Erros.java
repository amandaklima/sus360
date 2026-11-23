package br.unicap.sus360.erro;

import java.util.List;

/** Tipos de erro devolvidos pela API. */
public final class Erros {

    private Erros() {
    }

    /** Erro de um campo do formulário. {@code campo} usa o mesmo nome do JSON enviado pelo front. */
    public record CampoErro(String campo, String mensagem) {
    }

    /** Corpo de erro esperado pelo front: { mensagem, campos: [{ campo, mensagem }] }. */
    public record ErroResposta(String mensagem, List<CampoErro> campos) {

        public static ErroResposta de(String mensagem) {
            return new ErroResposta(mensagem, List.of());
        }
    }

    /** Recurso inexistente → 404. */
    public static class NaoEncontradoException extends RuntimeException {

        public NaoEncontradoException(String mensagem) {
            super(mensagem);
        }
    }

    /** Login inválido, sessão expirada ou usuário inexistente → 401. */
    public static class NaoAutorizadoException extends RuntimeException {

        public NaoAutorizadoException(String mensagem) {
            super(mensagem);
        }
    }

    /** Recurso já existe (ex.: e-mail já cadastrado) → 409, com o campo em conflito. */
    public static class ConflitoException extends RuntimeException {

        private final String campo;

        public ConflitoException(String campo, String mensagem) {
            super(mensagem);
            this.campo = campo;
        }

        public String getCampo() {
            return campo;
        }
    }

    /** Excesso de tentativas de login → 429. */
    public static class MuitasTentativasException extends RuntimeException {

        private final long segundosParaLiberar;

        public MuitasTentativasException(long segundosParaLiberar) {
            super("Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
            this.segundosParaLiberar = segundosParaLiberar;
        }

        public long getSegundosParaLiberar() {
            return segundosParaLiberar;
        }
    }

    /** Regra de negócio violada em um ou mais campos → 400. */
    public static class ValidacaoException extends RuntimeException {

        private final transient List<CampoErro> campos;

        public ValidacaoException(List<CampoErro> campos) {
            super("Verifique os campos informados.");
            this.campos = List.copyOf(campos);
        }

        public ValidacaoException(String campo, String mensagem) {
            this(List.of(new CampoErro(campo, mensagem)));
        }

        public List<CampoErro> getCampos() {
            return campos;
        }
    }
}
