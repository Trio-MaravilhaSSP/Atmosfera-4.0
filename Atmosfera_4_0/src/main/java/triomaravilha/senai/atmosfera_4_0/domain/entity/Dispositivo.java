package triomaravilha.senai.atmosfera_4_0.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Dispositivo {
    private String nomeDispositivo;
    private String localizacao;
    private String tipoDispositivo;
    private int gatewayPai;
}
