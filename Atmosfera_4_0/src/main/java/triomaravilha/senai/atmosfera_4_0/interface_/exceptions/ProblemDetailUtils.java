package triomaravilha.senai.atmosfera_4_0.interface_.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import java.net.URI;
import java.time.LocalDateTime;

public class ProblemDetailUtils {

    public static ProblemDetail buildProblem(
            HttpStatus status,
            String title,
            String detalhe,
            String path
    ){
        ProblemDetail problema = ProblemDetail.forStatus(status);
        problema.setTitle(title);
        problema.setDetail(detalhe);
        problema.setInstance(URI.create(path));
        problema.setProperty("timestamp", LocalDateTime.now());
        problema.setProperty("application", "Atmosfera4.0");
        return problema;
    }
}
