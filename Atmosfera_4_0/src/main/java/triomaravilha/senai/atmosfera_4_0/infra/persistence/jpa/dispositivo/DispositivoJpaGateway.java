package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.DispositivoMapper;
import triomaravilha.senai.atmosfera_4_0.domain.entity.Dispositivo;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.DispositivoGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.exceptions.NoIntegridadeReferencial;
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
        if (dispositivo.toModel().getGateway_pai_fk() != null && respository.findById(dispositivo.toModel().getGateway_pai_fk()).isPresent()) {
            throw new NoIntegridadeReferencial("Conexão do Dispositivo com Gateway");
        }
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
        DispositivoModel dispositivoModel = respository.findById(id).get();

        dispositivoModel.setNome_dispositivo(dispositivoModel.getNome_dispositivo());
        dispositivoModel.setLocalizacao(dispositivoModel.getLocalizacao());
        dispositivoModel.setTipo_dispositivo(dispositivoModel.getTipo_dispositivo());
        dispositivoModel.setGateway_pai_fk(dispositivo.toModel().getGateway_pai_fk());


        return DispositivoMapper.mapper(respository.save(dispositivoModel));
    }

    @Override
    public void deleteById(int id) {
        DispositivoModel dispositivoModel = respository.findById(id).get();

        respository.delete(dispositivoModel);
    }
}
