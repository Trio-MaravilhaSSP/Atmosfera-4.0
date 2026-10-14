package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.RegistroModel;

@Repository
public interface RegistroJpa extends JpaRepository<RegistroModel, Long> {
}
