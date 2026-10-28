package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.das;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.Dash.*;
import triomaravilha.senai.atmosfera_4_0.application.mappers.das.DashMapper;
import triomaravilha.senai.atmosfera_4_0.domain.entity.DasData;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.DashGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo.DispositivoRespository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.registro.RegistroRepository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.DispositivoModel;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class dasJpaGateway implements DashGateway {

    private final RegistroRepository registroRepository;
    private final DispositivoRespository dispositivoRespository;

    public dasJpaGateway(RegistroRepository registroRepository, DispositivoRespository dispositivoRespository) {
        this.registroRepository = registroRepository;
        this.dispositivoRespository = dispositivoRespository;
    }

    @Override
    public List<DashResponse> findAll() {
        Iterable<RegistroModel> registros = this.registroRepository.findAll();
        Iterable<DispositivoModel> dispositivos = this.dispositivoRespository.findAll();

        List<RegistroModel> registroResponses = StreamSupport.stream(registros.spliterator(), false)
                .collect(Collectors.toList());

        List<DispositivoModel> dispositivo = StreamSupport.stream(dispositivos.spliterator(), false)
                .collect(Collectors.toList());

        List<DasData> dasData = registroResponses.stream().map(r ->{

            DispositivoModel dispositivoModel = dispositivo.stream().filter(d -> d.getId_dispositivo() == r.getId_dispositivo_fk()).collect(Collectors.toList()).get(0);


            return new DasData(
                    r.getId(),
                    Math.toIntExact(dispositivoModel.getId_dispositivo()),
                    dispositivoModel.getId_dispositivo(),
                    r.getData_hora(),
                    r.getTemperatura(),
                    r.getUmidade(),
                    r.getIntensidade_wifi(),
                    r.getAltitude(),
                    r.getLuminosidade(),
                    r.getPressao(),
                    r.getVelocidade_vento(),
                    r.getDirecao_vento()
            );
        }).collect(Collectors.toList());


        return dasData.stream().map(DashMapper::mapper).collect(Collectors.toList());
    }

    @Override
    public List<DashResponse> findById(Long id) {
        List<DashResponse> lista= findAll();

        return lista.stream().filter(l -> l.sala() == id).collect(Collectors.toList());
    }

    @Override
    public List<DashTempResponse> getTemps() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(r -> new DashTempResponse(
                r.id_registro(),
                r.dispositivo(),
                r.data(),
                r.temperatura(),
                r.umidade()
        )).toList();

    }

    @Override
    public List<DashWifiResponse> getWif() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(r -> new DashWifiResponse(
                r.id_registro(),
                r.dispositivo(),
                r.data(),
                r.luminosidade(),
                (int) r.sinal()

        )).toList();
    }

    @Override
    public List<DashAltResponse> getAlt() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(r -> new DashAltResponse(
                r.id_registro(),
                r.dispositivo(),
                r.data(),
                r.pressao(),
                r.altitude()

        )).toList();
    }

    @Override
    public List<DashVentoResponse> getVento() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(r -> new DashVentoResponse(
                r.id_registro(),
                r.dispositivo(),
                r.data(),
                r.velVento(),
                (int) r.sinal()

        )).toList();
    }


}
