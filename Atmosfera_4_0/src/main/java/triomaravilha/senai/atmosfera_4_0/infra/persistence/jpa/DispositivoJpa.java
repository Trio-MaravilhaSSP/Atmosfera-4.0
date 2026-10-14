package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.DispositivoModel;

@Repository
public interface DispositivoJpa extends JpaRepository<DispositivoModel, Integer> {
}
