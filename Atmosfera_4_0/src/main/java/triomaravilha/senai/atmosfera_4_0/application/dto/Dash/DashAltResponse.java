package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record DashAltResponse(
        Long id,
        int dispositivo,
        LocalDateTime dataHora,
        Float pressao,
        Float altitude
) {
}