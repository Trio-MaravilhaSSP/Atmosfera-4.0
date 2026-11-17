package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.registro;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;

@Repository
public interface RegistroRepository extends CrudRepository<RegistroModel, Long> {
}
