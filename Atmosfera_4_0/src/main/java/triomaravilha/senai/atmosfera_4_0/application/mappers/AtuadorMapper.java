package triomaravilha.senai.atmosfera_4_0.application.mappers;

import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.infra.model.AtuadorModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;

public interface AtuadorMapper {
    public static AtuadorResponse mapper(AtuadorModel model){
        if (model == null) return null;

        return new AtuadorResponse(
                model.getId_atuador(),
                model.getNome_atuador(),
                model.getId_dispositivo_fk(),
                model.getStatus_atual(),
                model.getUltimo_comando()
        );
    }

    public static AtuadorModel mapper(AtuadorRequest request){
        if (request == null) return null;

        return new AtuadorModel(
            request.dispositivo(),
            request.nomeAtuador(),
            request.status(),
            request.ultimoComando()
        );
    }

}
