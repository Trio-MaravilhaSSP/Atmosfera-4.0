package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.registro;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.RegistroMapper;
import triomaravilha.senai.atmosfera_4_0.domain.entity.Registro;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.RegistroGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.exceptions.NoIntegridadeReferencial;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo.DispositivoRespository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class RegistroJpaGateway implements RegistroGateway {
    private final RegistroRepository repository;
    private final DispositivoRespository repositoryDispositivo;

    public RegistroJpaGateway(RegistroRepository repository, DispositivoRespository repositoryDispositivo) {
        this.repository = repository;
        this.repositoryDispositivo = repositoryDispositivo;
    }

    @Override
    public RegistroResponse save(RegistroRequest atuador) {
        if (repositoryDispositivo.findById(atuador.toModel().getId_dispositivo_fk()).isPresent()) {
            throw new NoIntegridadeReferencial("Conexão com Registro e Dispositivo");
        }

        return RegistroMapper.mapper(repository.save(atuador.toModel()));
    }

    @Override
    public RegistroResponse findyById(Long id) {
        return RegistroMapper.mapper(repository.findById(id).get());
    }

    @Override
    public List<RegistroResponse> findAll() {
        Iterable<RegistroModel> registros = repository.findAll();

        List<RegistroModel> registroResponses = StreamSupport.stream(registros.spliterator(), false)
                .collect(Collectors.toList());
        return registroResponses.stream().map(RegistroMapper::mapper).collect(Collectors.toList());
    }

    @Override
    public RegistroResponse update(Long id, RegistroRequest atuador) {
        RegistroModel registros = repository.findById(id).get();
        return RegistroMapper.mapper(repository.save(registros));
    }

    @Override
    public void deleteId(Long id) {
            RegistroModel registros = repository.findById(id).get();

            repository.delete(registros);
    }
}
