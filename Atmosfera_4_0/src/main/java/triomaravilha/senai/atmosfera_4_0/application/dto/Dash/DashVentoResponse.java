package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record DashVentoResponse (
        Long id,
        int dispositivo,
        LocalDateTime dataHora,
        float velVento,
        int direcaoVento
){
}