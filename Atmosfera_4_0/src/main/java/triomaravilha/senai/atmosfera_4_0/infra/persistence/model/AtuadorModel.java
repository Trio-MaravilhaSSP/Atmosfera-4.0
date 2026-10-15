package triomaravilha.senai.atmosfera_4_0.infra.persistence.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "Atuadores"
)
public class AtuadorModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_atuador")
    private int id_atuador;

    @Column(name = "id_dispositivo_fk", nullable = false)
    private Integer id_dispositivo_fk;

    @Column(nullable = false, length = 30)
    private String nome_atuador;

    @Column(nullable = true)
    private boolean status_atual;

    @Column(nullable = true)
    private LocalDateTime ultimo_comando;

    public boolean getStatus_atual() {return this.status_atual; }


     public AtuadorModel(Integer id_dispositivo_fk,String nome_atuador, boolean status_atual,LocalDateTime ultimo_comando) {
            this.id_dispositivo_fk = id_dispositivo_fk;
            this.nome_atuador = nome_atuador;
            this.status_atual = status_atual;
            this.ultimo_comando = ultimo_comando;
     }
}
