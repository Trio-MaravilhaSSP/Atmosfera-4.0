package triomaravilha.senai.atmosfera_4_0.application.dto;

import java.time.LocalDateTime;

public record DashResponse(
        Long id_registro,
        Long sala,
        LocalDateTime data,
        float temperatura,
        float umidade,
        float sinal,
        float altitude,
        float luminosidade,
        float pressao
) {
}
