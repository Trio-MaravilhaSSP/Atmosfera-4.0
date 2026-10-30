package triomaravilha.senai.atmosfera_4_0.application.service.adapter;

import org.springframework.stereotype.Service;
import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.AtuadorGateway;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;
import java.util.List;

@Service
public class AtuadorAdapter {

    private final AtuadorGateway atuadorGateway;

    public AtuadorAdapter(AtuadorGateway atuadorGateway) {
        this.atuadorGateway = atuadorGateway;
    }

    public AtuadorResponse save(AtuadorRequest atuadorRequest) {
        return atuadorGateway.save(atuadorRequest);
    }

    public AtuadorResponse update(int id, AtuadorRequest atuadorRequest) {
        return atuadorGateway.update(id, atuadorRequest);
    }           

    public List<AtuadorResponse> findAll() {
        return atuadorGateway.findAll();
    }

    public void deleteId(int id){
        atuadorGateway.deleteId(id);
    }
}