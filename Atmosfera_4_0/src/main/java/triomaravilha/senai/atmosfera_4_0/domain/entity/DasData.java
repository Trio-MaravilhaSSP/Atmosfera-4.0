package triomaravilha.senai.atmosfera_4_0.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DasData (
        Long id_Registro,
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
){
    public DasData{
        temperatura = arredondar(temperatura, 2);
        umidade = arredondar(umidade,0);
        sinal = arredondar(sinal, 0);
        altitude = arredondar(altitude,0);
        luminosidade = arredondar(luminosidade,0);
        pressao = arredondar(pressao,4);
        velVento = arredondar(velVento,1);
        direcaoVento = (int) arredondar(direcaoVento, 0);
    }

    private static float arredondar(float num, int casas){
        BigDecimal bd = new BigDecimal(num);
        bd = bd.setScale(casas, BigDecimal.ROUND_HALF_UP);

        return bd.floatValue();
    }

}
