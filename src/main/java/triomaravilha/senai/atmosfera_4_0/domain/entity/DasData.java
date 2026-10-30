package triomaravilha.senai.atmosfera_4_0.domain.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DasData (
        Long id_Registro,
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
){
    public DasData{

        if (temperatura == null) temperatura = new Float(0.0);
        if (umidade == null) umidade = new Float(0.0);
        if (sinal == null)  sinal = new Integer(0);
        if (altitude == null)  altitude = new Float(0.0);
        if (luminosidade == null)  luminosidade = new Float(0.0);
        if (pressao == null)  pressao = new Float(0.0);
        if (velVento == null)  velVento = new Float(0.0);
        if(direcaoVento == null) direcaoVento = new Integer(0);


        temperatura = arredondar(temperatura, 2);
        umidade = arredondar(umidade,0);
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
