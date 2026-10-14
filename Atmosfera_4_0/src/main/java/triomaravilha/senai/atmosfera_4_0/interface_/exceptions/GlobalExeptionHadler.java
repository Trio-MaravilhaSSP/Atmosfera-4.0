package triomaravilha.senai.atmosfera_4_0.interface_.exceptions;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.NoSuchElementException;

import static triomaravilha.senai.atmosfera_4_0.interface_.exceptions.ProblemDetailUtils.buildProblem;

@RestControllerAdvice
public class GlobalExeptionHadler {


    @ExceptionHandler(
            NoSuchElementException.class
    )
    public ProblemDetail NoSuchElementException(
            NoSuchElementException ex,
            HttpServletRequest request
    ) {
        return buildProblem(
                HttpStatus.NOT_FOUND,
                "Id não encontrado",
                "Id não está presente na base de dados",
                request.getRequestURI()
        );
    }

    /*
    * Opcionais: NoResourceFoundException
    *           HttpMessageNotReadableException
    * */
}
