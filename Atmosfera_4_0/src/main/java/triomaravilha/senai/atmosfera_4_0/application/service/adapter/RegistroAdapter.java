package triomaravilha.senai.atmosfera_4_0.application.service.adapter;

import org.springframework.stereotype.Service;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.RegistroGateway;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;

import java.util.List;

@Service
public class RegistroAdapter {

    private final RegistroGateway registroGateway;

    public RegistroAdapter(RegistroGateway registroGateway) {
        this.registroGateway = registroGateway;
    }

    RegistroResponse save(RegistroRequest registroRequest) {
        return registroGateway.save(registroRequest);
    }

    RegistroResponse findyById(Long id){
        return registroGateway.findyById(id);
    }
    List<RegistroResponse> findAll(){
        return registroGateway.findAll();
    }
    RegistroResponse update(Long id, RegistroRequest atuador){
        return registroGateway.update(id, atuador);
    }
    void deleteId(Long id){
        registroGateway.deleteId(id);
    }

}
