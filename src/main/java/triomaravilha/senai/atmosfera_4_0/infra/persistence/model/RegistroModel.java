package triomaravilha.senai.atmosfera_4_0.infra.persistence.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "registros"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegistroModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Long id;

    @Column(name = "id_dispositivo_fk", nullable = false)
    @NotNull(message = "O dispositivo é obrigatório")
    private int id_dispositivo_fk;

    @Column
    private Timestamp timestamp;

    @Column
    private LocalDateTime data_hora;

    @Column
    private Float temperatura;

    @Column
    private Float umidade;

    @Column
    private Float pressao;

    @Column
    private Float altitude;

    @Column
    private Float luminosidade;

    @Column
    private Float velocidade_vento;

    @Column
    private Integer direcao_vento;

    @Column
    private Integer intensidade_wifi;

}
