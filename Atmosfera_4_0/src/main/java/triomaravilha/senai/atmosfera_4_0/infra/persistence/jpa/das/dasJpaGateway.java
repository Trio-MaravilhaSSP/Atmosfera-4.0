package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.das;

import org.springframework.stereotype.Component;
import triomaravilha.senai.atmosfera_4_0.application.dto.DashResponse;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.application.mappers.DashMapper;
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
                    dispositivoModel.getId_dispositivo(),
                    r.getData_hora(),
                    r.getTemperatura(),
                    r.getUmidade(),
                    r.getIntensidade_wifi(),
                    r.getAltitude(),
                    r.getLuminosidade(),
                    r.getPressao()
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
    public List<Float> getTemps() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(DashResponse::temperatura).collect(Collectors.toList());

    }

    @Override
    public List<Float> getSinal() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(DashResponse::sinal).collect(Collectors.toList());
    }

    @Override
    public List<Float> getAlt() {
        List<DashResponse> registros = findAll();

        return registros.stream().map(DashResponse::altitude).collect(Collectors.toList());
    }


}
