package triomaravilha.senai.atmosfera_4_0.application.service.adapter;

import org.springframework.stereotype.Service;
import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.AtuadorMapper;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryAtuador;
import triomaravilha.senai.atmosfera_4_0.infra.jpa.AtuadorJpa;
import triomaravilha.senai.atmosfera_4_0.infra.model.AtuadorModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;
import java.util.List;
import java.util.Optional;

@Service
public class AtuadorAdapter implements RepositoryAtuador {

    private final AtuadorJpa atuadorJpa;

    public AtuadorAdapter(AtuadorJpa atuadorJpa ) {
        this.atuadorJpa = atuadorJpa;
    }


    @Override
    public AtuadorResponse save(AtuadorRequest atuador) {
        return AtuadorResponse.fromModel(atuadorJpa.save(atuador.toModel()));
    }

    @Override
    public AtuadorResponse findyById(int id) {
        Optional<AtuadorModel> atuador = atuadorJpa.findById(id);

        return atuador.map(AtuadorResponse::fromModel).get();
    }

    @Override
    public List<AtuadorResponse> findAll() {
        List<AtuadorModel> models = atuadorJpa.findAll();

        if(models.isEmpty()){
            return List.of();
        }

        return models.stream().map(AtuadorMapper::mapper).toList();
    }

    @Override
    public void deleteId(int id) {
        atuadorJpa.deleteById(id);
    }
}