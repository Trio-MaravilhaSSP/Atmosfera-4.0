package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.time.LocalDateTime;

public record DashResponse(
        Long id_registro,
        int dispositivo,
        Long sala,
        LocalDateTime data,
        float temperatura,
        float umidade,
        float sinal,
        float altitude,
        float luminosidade,
        float pressao,
        float velVento,
        int direcaoVento
) {
}
