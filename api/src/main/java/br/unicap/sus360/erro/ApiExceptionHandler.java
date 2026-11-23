package br.unicap.sus360.erro;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.fasterxml.jackson.databind.exc.MismatchedInputException;

import br.unicap.sus360.erro.Erros.CampoErro;
import br.unicap.sus360.erro.Erros.ConflitoException;
import br.unicap.sus360.erro.Erros.ErroResposta;
import br.unicap.sus360.erro.Erros.MuitasTentativasException;
import br.unicap.sus360.erro.Erros.NaoAutorizadoException;
import br.unicap.sus360.erro.Erros.NaoEncontradoException;
import br.unicap.sus360.erro.Erros.ValidacaoException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);
    private static final String MSG_CAMPOS = "Verifique os campos informados.";

    @ExceptionHandler(NaoEncontradoException.class)
    ResponseEntity<ErroResposta> naoEncontrado(NaoEncontradoException e) {
        return resposta(HttpStatus.NOT_FOUND, ErroResposta.de(e.getMessage()));
    }

    @ExceptionHandler(NaoAutorizadoException.class)
    ResponseEntity<ErroResposta> naoAutorizado(NaoAutorizadoException e) {
        return resposta(HttpStatus.UNAUTHORIZED, ErroResposta.de(e.getMessage()));
    }

    @ExceptionHandler(ConflitoException.class)
    ResponseEntity<ErroResposta> conflito(ConflitoException e) {
        return resposta(HttpStatus.CONFLICT,
                new ErroResposta(e.getMessage(), List.of(new CampoErro(e.getCampo(), e.getMessage()))));
    }

    @ExceptionHandler(MuitasTentativasException.class)
    ResponseEntity<ErroResposta> muitasTentativas(MuitasTentativasException e) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(e.getSegundosParaLiberar()))
                .body(ErroResposta.de(e.getMessage()));
    }

    @ExceptionHandler(ValidacaoException.class)
    ResponseEntity<ErroResposta> validacao(ValidacaoException e) {
        return resposta(HttpStatus.BAD_REQUEST, new ErroResposta(e.getMessage(), e.getCampos()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErroResposta> beanValidation(MethodArgumentNotValidException e) {
        // um erro por campo (o primeiro encontrado)
        Map<String, String> porCampo = new LinkedHashMap<>();
        for (FieldError f : e.getBindingResult().getFieldErrors()) {
            porCampo.putIfAbsent(f.getField(), f.getDefaultMessage());
        }
        List<CampoErro> campos = porCampo.entrySet().stream()
                .map(c -> new CampoErro(c.getKey(), c.getValue()))
                .toList();
        return resposta(HttpStatus.BAD_REQUEST, new ErroResposta(MSG_CAMPOS, campos));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ErroResposta> corpoInvalido(HttpMessageNotReadableException e) {
        if (e.getCause() instanceof MismatchedInputException mie && !mie.getPath().isEmpty()) {
            String campo = mie.getPath().get(mie.getPath().size() - 1).getFieldName();
            if (campo != null) {
                return resposta(HttpStatus.BAD_REQUEST,
                        new ErroResposta(MSG_CAMPOS, List.of(new CampoErro(campo, "Valor inválido."))));
            }
        }
        return resposta(HttpStatus.BAD_REQUEST, ErroResposta.de("Corpo da requisição inválido."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ResponseEntity<ErroResposta> parametroInvalido(MethodArgumentTypeMismatchException e) {
        return resposta(HttpStatus.BAD_REQUEST, ErroResposta.de("Parâmetro inválido: " + e.getName() + "."));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ErroResposta> rotaInexistente(NoResourceFoundException e) {
        return resposta(HttpStatus.NOT_FOUND, ErroResposta.de("Recurso não encontrado."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ErroResposta> metodoNaoPermitido(HttpRequestMethodNotSupportedException e) {
        return resposta(HttpStatus.METHOD_NOT_ALLOWED, ErroResposta.de("Método não permitido."));
    }

    @ExceptionHandler(DataAccessException.class)
    ResponseEntity<ErroResposta> banco(DataAccessException e) {
        log.error("Erro de acesso ao banco", e);
        return resposta(HttpStatus.SERVICE_UNAVAILABLE,
                ErroResposta.de("Não foi possível acessar o banco de dados. Tente novamente em instantes."));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErroResposta> inesperado(Exception e) {
        log.error("Erro inesperado", e);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR, ErroResposta.de("Erro interno no servidor."));
    }

    private static ResponseEntity<ErroResposta> resposta(HttpStatus status, ErroResposta corpo) {
        return ResponseEntity.status(status).body(corpo);
    }
}
