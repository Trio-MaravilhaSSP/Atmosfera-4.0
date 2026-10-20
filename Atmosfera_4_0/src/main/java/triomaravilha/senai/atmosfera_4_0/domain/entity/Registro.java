package triomaravilha.senai.atmosfera_4_0.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Registro {
    private int dispositivo;
    private Timestamp timestamp;
    private LocalDateTime dataHora;
    private float temperatura;
    private float umidade;
    private float pressao;
    private float altitude;
    private float luminosidade;
    private float velVento;
    private int direcaoVento;
    private int intensidadeWifi;

}
