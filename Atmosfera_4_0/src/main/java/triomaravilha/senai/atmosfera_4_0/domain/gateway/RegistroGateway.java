package triomaravilha.senai.atmosfera_4_0.domain.gateway;


import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;

import java.util.List;

public interface RegistroGateway {
    RegistroResponse save(RegistroRequest atuador);
    RegistroResponse findyById(Long id);
    List<RegistroResponse> findAll();
    RegistroResponse update(Long id, RegistroRequest atuador);
    void deleteId(Long id);
}
