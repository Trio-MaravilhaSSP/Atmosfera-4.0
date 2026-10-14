package triomaravilha.senai.atmosfera_4_0.infra.jpa;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import triomaravilha.senai.atmosfera_4_0.infra.model.RegistroModel;

@Repository
public interface RegistroJpa extends JpaRepository<RegistroModel, Long> {
}
