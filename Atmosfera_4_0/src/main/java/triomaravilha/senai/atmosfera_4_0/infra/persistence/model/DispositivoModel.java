package triomaravilha.senai.atmosfera_4_0.infra.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name ="Dispositivos"
)
public class DispositivoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dispositivo")
    private Long id_dispositivo;

    @Column(nullable = false, length = 30)
    private String nome_dispositivo;

    @Column(length = 50)
    private String localizacao;

    @Column(nullable = false, length = 30)
    private String tipo_dispositivo;

    @Column(name = "gateway_pai_fk")
    private Integer gateway_pai_fk;

}
