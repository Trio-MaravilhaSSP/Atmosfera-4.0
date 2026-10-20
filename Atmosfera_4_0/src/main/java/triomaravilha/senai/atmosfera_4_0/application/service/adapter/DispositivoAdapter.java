package triomaravilha.senai.atmosfera_4_0.application.service.adapter;

import org.springframework.stereotype.Service;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.DispositivoGateway;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;

import java.util.List;

@Service
public class DispositivoAdapter {

    private final DispositivoGateway  dispositivoGateway;

    public DispositivoAdapter(DispositivoGateway dispositivoGateway) {
        this.dispositivoGateway = dispositivoGateway;
    }

    DispositivoResponse save(DispositivoRequest dispositivo) {
        return dispositivoGateway.save(dispositivo);
    }

    DispositivoResponse findById(int id) {
        return dispositivoGateway.findById(id);
    }

    List<DispositivoResponse> findAll(){
        return dispositivoGateway.findAll();
    }

    DispositivoResponse update(int id, DispositivoRequest dispositivo) {
        return dispositivoGateway.update(id, dispositivo);
    }

    void delete(int id) {
        dispositivoGateway.deleteById(id);
    }

}
