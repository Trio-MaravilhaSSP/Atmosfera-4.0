package triomaravilha.senai.atmosfera_4_0.domain.gateway;

import triomaravilha.senai.atmosfera_4_0.application.dto.DashResponse;

import java.util.List;

public interface DashGateway {
    List<DashResponse> findAll();
    List<DashResponse> findById(Long id);
    List<Float> getTemps();
    List<Float> getSinal();
    List<Float> getAlt();
}
