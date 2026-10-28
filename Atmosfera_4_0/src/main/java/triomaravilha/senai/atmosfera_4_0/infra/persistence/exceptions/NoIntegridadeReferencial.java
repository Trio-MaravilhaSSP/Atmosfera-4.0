package triomaravilha.senai.atmosfera_4_0.infra.persistence.exceptions;

public class NoIntegridadeReferencial extends RuntimeException {
    public NoIntegridadeReferencial(String message) {
        super("Violação de integridade referência: " + message);
    }
}
