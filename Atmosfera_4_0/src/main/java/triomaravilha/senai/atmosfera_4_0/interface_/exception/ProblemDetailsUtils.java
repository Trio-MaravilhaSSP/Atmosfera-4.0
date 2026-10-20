package triomaravilha.senai.atmosfera_4_0.interface_.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.server.reactive.HttpHandler;

import java.net.URI;
import java.time.LocalDateTime;

public class ProblemDetailsUtils {
    public static ProblemDetail buildProblem(
        HttpStatus status,
        String title,
        String detail,
        String path
    ){
        ProblemDetail problema = ProblemDetail.forStatus(status);
        problema.setTitle(title);
        problema.setDetail(detail);
        problema.setInstance(URI.create(path));
        problema.setProperty("timestamp", LocalDateTime.now());
        problema.setProperty("application", "atmosfera_4_0");

        return problema;
    }
}
