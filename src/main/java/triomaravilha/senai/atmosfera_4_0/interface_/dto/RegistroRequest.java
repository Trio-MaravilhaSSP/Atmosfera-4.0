package triomaravilha.senai.atmosfera_4_0.interface_.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.RegistroMapper;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record RegistroRequest(
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
    public RegistroRequest{
        if (timestamp() == null) {
            timestamp = new Timestamp(System.currentTimeMillis());
        }
        if (dataHora() == null) {
            dataHora = LocalDateTime.now();
        }
    }

    public RegistroModel toModel() {
        return RegistroMapper.mapper(new RegistroRequest(
                dispositivo, timestamp,dataHora,temperatura,
                umidade, pressao, altitude, luminosidade,
                velVento, direcaoVento, intensidadeWifi));
    }
}
