package triomaravilha.senai.atmosfera_4_0.application.service.adapter;

import org.springframework.stereotype.Service;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryDispositivo;
import triomaravilha.senai.atmosfera_4_0.infra.jpa.DispositivoJpa;
import triomaravilha.senai.atmosfera_4_0.infra.model.DispositivoModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;

import java.util.List;
import java.util.Optional;

@Service
public class DispositivoAdapter implements RepositoryDispositivo {

    private final DispositivoJpa  dispositivoJpa;

    public DispositivoAdapter(DispositivoJpa dispositivoJpa) {
        this.dispositivoJpa = dispositivoJpa;
    }


    @Override
    public DispositivoResponse save(DispositivoRequest dispositivo) {
        return DispositivoResponse.fromModel(dispositivoJpa.save(dispositivo.toModel()));
    }

    @Override
    public DispositivoResponse findById(int id) {
        Optional<DispositivoModel> dispositivoModel = dispositivoJpa.findById(id);

        return dispositivoModel.map(DispositivoResponse::fromModel).get();
    }

    @Override
    public List<DispositivoResponse> findAll() {
        List <DispositivoModel> dispositivoModels = dispositivoJpa.findAll();

        return dispositivoModels.stream().map(DispositivoResponse::fromModel).toList();
    }

    @Override
    public void deleteById(int id) {
        dispositivoJpa.deleteById(id);
    }

}
