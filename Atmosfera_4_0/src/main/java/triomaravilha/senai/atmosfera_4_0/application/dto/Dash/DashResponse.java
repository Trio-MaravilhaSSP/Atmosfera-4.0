package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.time.LocalDateTime;

public record DashResponse(
        Long id_registro,
        int dispositivo,
        Long sala,
        LocalDateTime data,
        Float temperatura,
        Float umidade,
        Integer sinal,
        Float altitude,
        Float luminosidade,
        Float pressao,
        Float velVento,
        Integer direcaoVento
) {
}
