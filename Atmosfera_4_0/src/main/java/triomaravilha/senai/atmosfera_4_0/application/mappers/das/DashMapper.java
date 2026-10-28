package triomaravilha.senai.atmosfera_4_0.application.mappers;

import triomaravilha.senai.atmosfera_4_0.application.dto.Dash.DashResponse;
import triomaravilha.senai.atmosfera_4_0.domain.entity.DasData;

public interface DashMapper {

    public static DashResponse mapper(DasData dashResponse) {
        if (dashResponse == null) return null;

        return new DashResponse(
                dashResponse.id_Registro(),
                dashResponse.sala(),
                dashResponse.data(),
                dashResponse.temperatura(),
                dashResponse.umidade(),
                dashResponse.sinal(),
                dashResponse.altitude(),
                dashResponse.luminosidade(),
                dashResponse.pressao()
        );
    }


}
