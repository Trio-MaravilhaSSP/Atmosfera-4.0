package triomaravilha.senai.atmosfera_4_0.application.mappers;

import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.DispositivoModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;

public interface DispositivoMapper {

    public static DispositivoResponse mapper(DispositivoModel model) {
        if (model == null) return null;

        return new DispositivoResponse(
                model.getId_dispositivo(),
                model.getNome_dispositivo(),
                model.getLocalizacao(),
                model.getTipo_dispositivo(),
                model.getGateway_pai_fk()

        );
    }

    public static DispositivoModel mapper(DispositivoRequest request) {
        if (request == null) return null;

        return new DispositivoModel(
                null,
                request.nomeDispositivo(),
                request.localizacao(),
                request.tipoDispositivo(),
                request.gatewayPai()
        );
    }

}
