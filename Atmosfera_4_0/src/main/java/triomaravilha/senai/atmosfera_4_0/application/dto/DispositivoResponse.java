package triomaravilha.senai.atmosfera_4_0.application.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.DispositivoMapper;
import triomaravilha.senai.atmosfera_4_0.infra.model.DispositivoModel;

public record DispositivoResponse (
    Long id,
    String nomeDispositivo,
    String localizacao,
    String tipoDispositivo,
    Integer gatewayPai
){

    public static DispositivoResponse fromModel(DispositivoModel model) {
        return DispositivoMapper.mapper(model);
    }
}
