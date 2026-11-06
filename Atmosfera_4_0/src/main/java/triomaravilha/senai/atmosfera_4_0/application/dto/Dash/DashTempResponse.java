package triomaravilha.senai.atmosfera_4_0.application.dto.Dash;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record DashTempResponse (
        Long id,
        int dispositivo,
        LocalDateTime dataHora,
        Float temperatura,
        Float umidade
){
}
