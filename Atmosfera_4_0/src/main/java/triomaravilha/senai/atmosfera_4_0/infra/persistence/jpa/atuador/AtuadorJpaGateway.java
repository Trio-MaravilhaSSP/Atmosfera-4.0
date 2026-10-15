package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.atuador;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.AtuadorMapper;
import triomaravilha.senai.atmosfera_4_0.domain.entity.Atuador;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.AtuadorGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.AtuadorModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class AtuadorJpaGateway implements AtuadorGateway {

    private final AtuadorRepository repository;

    public AtuadorJpaGateway(AtuadorRepository repository) {
        this.repository = repository;
    }

    @Override
    public AtuadorResponse save(AtuadorRequest atuador) {
        return AtuadorMapper.mapper(repository.save(atuador.toModel()));
    }

    @Override
    public AtuadorResponse findyById(int id) {
        return AtuadorMapper.mapper(repository.findById(id).get());
    }

    @Override
    public AtuadorResponse update(int id, AtuadorRequest atuadorRequest) {
        AtuadorModel model = atuadorRequest.toModel();

        model.setId_atuador(id);

        return AtuadorMapper.mapper(model);
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
            repository.deleteById(id);
    }
}
