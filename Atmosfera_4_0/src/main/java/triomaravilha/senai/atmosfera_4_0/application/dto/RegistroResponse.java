package triomaravilha.senai.atmosfera_4_0.application.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.RegistroMapper;
import triomaravilha.senai.atmosfera_4_0.infra.model.RegistroModel;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record RegistroResponse (
    Long id,
    int dispositivo,
    Timestamp timestamp,
    LocalDateTime dataHora,
    float temperatura,
    float umidade,
    float pressao,
    float altitude,
    float luminosidade,
    float velVento,
    int direcaoVento,
    int intensidadeWifi
){

    public static RegistroResponse fromModel(RegistroModel registro) {
        return RegistroMapper.mapper(registro);
    }
}
