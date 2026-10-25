package triomaravilha.senai.atmosfera_4_0.application.main;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import triomaravilha.senai.atmosfera_4_0.application.service.adapter.AtuadorAdapter;
import triomaravilha.senai.atmosfera_4_0.application.service.adapter.DispositivoAdapter;
import triomaravilha.senai.atmosfera_4_0.application.service.adapter.RegistroAdapter;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.atuador.AtuadorJpaGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo.DispositivoJpaGateway;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.registro.RegistroJpaGateway;

@Configuration
public class AppConfig {

    @Bean("jpaAtuador")
    @Primary
    public AtuadorAdapter AtuadorDTOJPA(AtuadorJpaGateway gateway){
        return new AtuadorAdapter(gateway);
    }

    @Bean("jpaDispositivo")
    @Primary
    public DispositivoAdapter DispositivoDTOJPA(DispositivoJpaGateway gateway){
        return new DispositivoAdapter(gateway);
    }

    @Bean("jpaRegistro")
    @Primary
    public RegistroAdapter RegistroDTOJPA(RegistroJpaGateway gateway){
        return new RegistroAdapter(gateway);
    }
}
