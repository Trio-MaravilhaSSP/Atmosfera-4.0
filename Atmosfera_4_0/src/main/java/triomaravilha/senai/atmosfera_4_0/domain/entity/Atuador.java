package triomaravilha.senai.atmosfera_4_0.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Atuador {
    private String nomeAtuador;
    private int dispositivo;
    private boolean status;
    private LocalDateTime ultimoComando;
}