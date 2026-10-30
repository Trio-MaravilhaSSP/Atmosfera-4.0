package triomaravilha.senai.atmosfera_4_0.application.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.RegistroMapper;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record RegistroResponse (
    Long id,
    int dispositivo,
    Timestamp timestamp,
    LocalDateTime dataHora,
    Float temperatura,
    Float umidade,
    Float pressao,
    Float altitude,
    Float luminosidade,
    Float velVento,
    Integer direcaoVento,
    Integer intensidadeWifi
){

    public static RegistroResponse fromModel(RegistroModel registro) {
        return RegistroMapper.mapper(registro);
    }
}
