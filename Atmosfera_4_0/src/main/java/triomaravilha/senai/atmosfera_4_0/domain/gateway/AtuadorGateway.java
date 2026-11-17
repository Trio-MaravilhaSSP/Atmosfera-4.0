package triomaravilha.senai.atmosfera_4_0.domain.gateway;

import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;

import java.util.List;

public interface AtuadorGateway {
    AtuadorResponse save(AtuadorRequest atuador);
    AtuadorResponse findyById(int id);
    AtuadorResponse update(int id, AtuadorRequest atuadorRequest);
    List<AtuadorResponse> findAll();
    void deleteId(int id);
    //List<AtuadorResponse> findByName(String name);
}
