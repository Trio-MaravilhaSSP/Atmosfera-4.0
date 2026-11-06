package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.time.LocalDateTime;

public record DashVentoResponse (
        Long id,
        int dispositivo,
        LocalDateTime dataHora,
        Float velVento,
        Integer direcaoVento
){
}