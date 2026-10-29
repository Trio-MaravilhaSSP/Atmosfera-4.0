package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record DashWifiResponse(
        Long id,
        int dispositivo,
        LocalDateTime dataHora,
        float luminosidade,
        int intensidadeWifi
) {
}
