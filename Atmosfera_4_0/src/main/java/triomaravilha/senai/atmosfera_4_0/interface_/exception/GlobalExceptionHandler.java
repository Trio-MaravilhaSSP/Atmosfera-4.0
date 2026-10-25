package triomaravilha.senai.atmosfera_4_0.interface_.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.exceptions.NoIntegridadeReferencial;

import java.util.NoSuchElementException;
import static triomaravilha.senai.atmosfera_4_0.interface_.exception.ProblemDetailsUtils.buildProblem;
@RestControllerAdvice
public class GlobalExceptionHandler {

    //NoSuchElementException
    @ExceptionHandler(
            NoSuchElementException.class
    )
    public ProblemDetail handleException(NoSuchElementException ex, HttpServletRequest request) {
        return buildProblem(
                HttpStatus.NOT_FOUND,
                "O ID não encontrado",
                "O ID buscado não existe no banco de dados",
                request.getRequestURI()
        );
    }

    //MethodArgumentTypeMismatchException
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        return buildProblem(
                HttpStatus.BAD_REQUEST,
                "Tipo de parâmetro inválido",
                String.format(
                        "O parâmetro '%s' deve ser do tipo '%s'. Valor recebido: '%s'",
                        ex.getName(),
                        ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "desconhecido",
                        ex.getValue()
                ),
                request.getRequestURI()
        );
    }

    //HttpMessageNotReadableException Sem nada pra mandar, Json Ruim
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "O corpo da requisição (JSON) está malformado ou os dados são incompatíveis."
        );
        problemDetail.setTitle("Requisição ilegível");
        return problemDetail;
    }

    // ... outros métodos de ExceptionHandler que você já possuir (deixe-os como estão)


    //DataIntegrityViolationException
    @ExceptionHandler(
            DataIntegrityViolationException.class
    )
    public ProblemDetail handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request
    ){
        return buildProblem(
                HttpStatus.CONFLICT,
                "Conflito de dados",
                "A operação viola uma restrição de integridadade dos dados",
                request.getRequestURI()
        );
    }

    //NoIntegridadeReferencial
    @ExceptionHandler(
            NoIntegridadeReferencial.class
    )
    public  ProblemDetail handleNoIntegridadeReferencial(NoIntegridadeReferencial ex, HttpServletRequest request){
        return buildProblem(
                HttpStatus.CONFLICT,
                "Erro de integridade referencial",
                "O id mensionada na ligaçãod de id e fk não existe",
                request.getRequestURI()
        );
    }

    //ConstraintViolationException
    @ExceptionHandler(
            ConstraintViolationException.class
    )
    public  ProblemDetail handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        return buildProblem(
                HttpStatus.BAD_REQUEST,
                "Dados fora do padrão",
                ex.getMessage()
                        .split("interpolatedMessage='")[1]
                        .split("', propertyPath=nome_atuador")[0],
                request.getRequestURI()
        );
    }



    @ExceptionHandler(InternalError.class)
    public ProblemDetail handleInternalError(InternalError ex, HttpServletRequest request) {
        return buildProblem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro interno do servidor",
                "Ocorreu um erro interno no servidor.",
                request.getRequestURI()
        );
    }
}
