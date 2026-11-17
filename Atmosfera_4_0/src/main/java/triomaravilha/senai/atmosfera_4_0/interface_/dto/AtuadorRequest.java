package triomaravilha.senai.atmosfera_4_0.interface_.dto;

import triomaravilha.senai.atmosfera_4_0.application.mappers.AtuadorMapper;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.AtuadorModel;
import java.time.LocalDateTime;

public record AtuadorRequest (
        String nomeAtuador,
        Integer dispositivo,
        boolean status,
        LocalDateTime ultimoComando
){
    public AtuadorModel toModel(){
        return AtuadorMapper.mapper(new AtuadorRequest(nomeAtuador, dispositivo, status, ultimoComando));
    }

}
