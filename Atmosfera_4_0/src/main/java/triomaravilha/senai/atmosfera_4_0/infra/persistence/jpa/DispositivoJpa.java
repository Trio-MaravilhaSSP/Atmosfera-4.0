package triomaravilha.senai.atmosfera_4_0.infra.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.infra.model.DispositivoModel;

@Repository
public interface DispositivoJpa extends JpaRepository<DispositivoModel, Integer> {
}
