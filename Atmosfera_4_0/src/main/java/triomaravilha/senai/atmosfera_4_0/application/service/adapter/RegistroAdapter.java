package triomaravilha.senai.atmosfera_4_0.application.service.adapter;

import org.springframework.stereotype.Service;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.RegistroMapper;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryRegistro;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.RegistroJpa;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;

import java.util.List;
import java.util.Optional;

@Service
public class RegistroAdapter implements RepositoryRegistro {

    private final RegistroJpa registroJpa;

    public RegistroAdapter(RegistroJpa registroJpa) {
        this.registroJpa = registroJpa;
    }


    @Override
    public RegistroResponse save(RegistroRequest registro) {
        return RegistroResponse.fromModel(registroJpa.save(registro.toModel()));
    }

    @Override
    public RegistroResponse findyById(Long id) {
        Optional<RegistroModel> registroModel = registroJpa.findById(id);

        return registroModel.map(RegistroResponse::fromModel).get();
    }

    @Override
    public List<RegistroResponse> findAll() {
        List<RegistroModel> registroModels = registroJpa.findAll();

        if (registroModels.isEmpty()) {
            return List.of();
        }

        return registroModels.stream().map(RegistroMapper::mapper).toList();
    }

    @Override
    public void deleteId(Long id) {
        registroJpa.deleteById(id);
    }
}
