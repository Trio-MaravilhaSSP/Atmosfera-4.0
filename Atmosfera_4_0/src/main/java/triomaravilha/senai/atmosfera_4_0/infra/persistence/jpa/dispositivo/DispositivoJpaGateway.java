package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.DispositivoMapper;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.DispositivoGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.DispositivoModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class DispositivoJpaGateway implements DispositivoGateway {

    private final DispositivoRespository respository;

    public DispositivoJpaGateway(DispositivoRespository respository) {
        this.respository = respository;
    }


    @Override
    public DispositivoResponse save(DispositivoRequest dispositivo) {
        return DispositivoMapper.mapper(respository.save(dispositivo.toModel()));
    }

    @Override
    public DispositivoResponse findById(int id) {
        return DispositivoMapper.mapper(respository.findById(id).get());
    }

    @Override
    public List<DispositivoResponse> findAll() {
        Iterable<DispositivoModel> models = respository.findAll();

        List<DispositivoModel> dispositivo = StreamSupport.stream(models.spliterator(), false)
                .collect(Collectors.toList());
        return dispositivo.stream().map(DispositivoMapper::mapper).toList();
    }

    @Override
    public DispositivoResponse update(int id, DispositivoRequest dispositivo) {
        DispositivoModel dispositivoModel = dispositivo.toModel();

        dispositivoModel.setId_dispositivo((long)id);

        return DispositivoMapper.mapper(respository.save(dispositivoModel));
    }

    @Override
    public void deleteById(int id) {
        respository.deleteById(id);
    }
}
