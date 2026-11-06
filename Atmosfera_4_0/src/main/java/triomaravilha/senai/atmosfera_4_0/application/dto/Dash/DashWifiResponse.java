package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.time.LocalDateTime;

public record DashWifiResponse(
        Long id,
        int dispositivo,
        LocalDateTime dataHora,
        Float luminosidade,
        Integer intensidadeWifi
) {
}