package triomaravilha.senai.atmosfera_4_0.application.mappers;

import lombok.RequiredArgsConstructor;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.domain.entity.Dispositivo;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryDispositivo;
import triomaravilha.senai.atmosfera_4_0.infra.model.DispositivoModel;
import triomaravilha.senai.atmosfera_4_0.interface_.controller.DispositivoController;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;

import java.util.List;

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
