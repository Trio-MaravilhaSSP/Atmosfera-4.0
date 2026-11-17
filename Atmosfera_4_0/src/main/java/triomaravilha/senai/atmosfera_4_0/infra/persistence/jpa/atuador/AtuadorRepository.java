package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa.atuador;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.AtuadorModel;

@Repository
public interface AtuadorRepository extends CrudRepository<AtuadorModel, Integer> {
}
