package triomaravilha.senai.atmosfera_4_0.domain.gateway;

import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;

import java.util.List;

public interface DispositivoGateway {
    DispositivoResponse save(DispositivoRequest dispositivo);
    DispositivoResponse findById(int id);
    List<DispositivoResponse> findAll();
    DispositivoResponse update(int id, DispositivoRequest dispositivo);
    void deleteById(int id);
}
