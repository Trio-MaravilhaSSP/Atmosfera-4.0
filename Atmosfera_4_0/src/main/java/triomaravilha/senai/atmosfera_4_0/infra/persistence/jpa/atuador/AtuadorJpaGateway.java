package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.atuador;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.AtuadorMapper;
import triomaravilha.senai.atmosfera_4_0.application.service.adapter.DispositivoAdapter;
import triomaravilha.senai.atmosfera_4_0.domain.entity.Atuador;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.AtuadorGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.exceptions.NoIntegridadeReferencial;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo.DispositivoRespository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.AtuadorModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class AtuadorJpaGateway implements AtuadorGateway {

    private final AtuadorRepository repository;
    private final DispositivoRespository repositoryDispositivo;

    public AtuadorJpaGateway(AtuadorRepository repository, DispositivoRespository repositoryDispositivo) {
        this.repository = repository;
        this.repositoryDispositivo = repositoryDispositivo;
    }

    @Override
    public AtuadorResponse save(AtuadorRequest atuador) {

        if (!repositoryDispositivo.findById(atuador.toModel().getId_dispositivo_fk()).isPresent()) {
            throw new NoIntegridadeReferencial("Conexão de Atuador com Dispositivo");
        }

        return AtuadorMapper.mapper(repository.save(atuador.toModel()));
    }

    @Override
    public AtuadorResponse findyById(int id) {
        return AtuadorMapper.mapper(repository.findById(id).get());
    }

    @Override
    public AtuadorResponse update(int id, AtuadorRequest atuadorRequest) {
        AtuadorModel modelAntigo = repository.findById(id).get();

        modelAntigo.setId_dispositivo_fk(atuadorRequest.toModel().getId_dispositivo_fk());
        modelAntigo.setNome_atuador(atuadorRequest.toModel().getNome_atuador());
        modelAntigo.setStatus_atual(atuadorRequest.toModel().getStatus_atual());
        modelAntigo.setUltimo_comando(atuadorRequest.toModel().getUltimo_comando());


        return AtuadorMapper.mapper(repository.save(modelAntigo));
    }

    @Override
    public List<AtuadorResponse> findAll() {
        Iterable<AtuadorModel> atuadores = repository.findAll();

        List<AtuadorModel> atuadorList = StreamSupport.stream(atuadores.spliterator(), false)
                .collect(Collectors.toList());

        return atuadorList.stream().map(AtuadorMapper::mapper).toList();
    }

    @Override
    public void deleteId(int id) {
            AtuadorModel atuaador =  repository.findById(id).get();
            repository.delete(atuaador);
    }
}
