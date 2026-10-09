package triomaravilha.senai.atmosfera_4_0.interface_.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.DispositivoMapper;
import triomaravilha.senai.atmosfera_4_0.infra.model.DispositivoModel;


public record DispositivoRequest (
        String nomeDispositivo,
        String localizacao,
        String tipoDispositivo,
        Integer gatewayPai
){

    public DispositivoModel toModel() {
        return DispositivoMapper.mapper(new DispositivoRequest(
                nomeDispositivo, localizacao, tipoDispositivo, gatewayPai
        ));
    }
}
