package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.dispositivo;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.DispositivoModel;

@Repository
public interface DispositivoRespository extends CrudRepository<DispositivoModel, Integer> {
}
