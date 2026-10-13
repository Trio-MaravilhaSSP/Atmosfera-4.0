package triomaravilha.senai.atmosfera_4_0.application.mappers;

import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.infra.model.RegistroModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;

public interface RegistroMapper {

    public static RegistroResponse mapper(RegistroModel model){
        if (model == null) return null;

        return new RegistroResponse(
                model.getId(),
                model.getId_dispositivo_fk(),
                model.getTimestamp(),
                model.getData_hora(),
                model.getTemperatura(),
                model.getUmidade(),
                model.getPressao(),
                model.getAltitude(),
                model.getLuminosidade(),
                model.getVelocidade_vento(),
                model.getDirecao_vento(),
                model.getIntensidade_wifi()
        );
    }

    public static RegistroModel mapper(RegistroRequest request){
        return new RegistroModel(
                null,
                request.dispositivo(),
                request.timestamp(),
                request.dataHora(),
                request.temperatura(),
                request.umidade(),
                request.pressao(),
                request.altitude(),
                request.luminosidade(),
                request.velVento(),
                request.direcaoVento(),
                request.intensidadeWifi()
        );
    }
}
