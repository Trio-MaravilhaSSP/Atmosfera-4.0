package triomaravilha.senai.atmosfera_4_0.application.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.AtuadorMapper;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.AtuadorModel;

import java.time.LocalDateTime;

public record AtuadorResponse (
        int id,
        String nomeAtuador,
        Integer dispositivo,
        boolean status,
        LocalDateTime ultimoComando
    )
    {
    public static AtuadorResponse fromModel(AtuadorModel model) {
        return AtuadorMapper.mapper(model);
    }
}
