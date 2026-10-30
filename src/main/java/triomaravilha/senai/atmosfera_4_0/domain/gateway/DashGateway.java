package triomaravilha.senai.atmosfera_4_0.domain.gateway;

import triomaravilha.senai.atmosfera_4_0.application.dto.Dash.*;

import java.util.List;

public interface DashGateway {
    List<DashResponse> findAll();
    List<DashResponse> findById(Long id);
    List<DashTempResponse> getTemps();
    List<DashWifiResponse> getWif();
    List<DashAltResponse> getAlt();
    List<DashVentoResponse> getVento();
}
