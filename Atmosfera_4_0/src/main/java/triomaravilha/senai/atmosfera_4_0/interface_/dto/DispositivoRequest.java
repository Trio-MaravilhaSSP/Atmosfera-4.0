package triomaravilha.senai.atmosfera_4_0.interface_.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.DispositivoMapper;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.DispositivoModel;


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
