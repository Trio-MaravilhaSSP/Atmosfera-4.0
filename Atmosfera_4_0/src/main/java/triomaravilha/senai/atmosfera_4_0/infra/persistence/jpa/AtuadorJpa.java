package triomaravilha.senai.atmosfera_4_0.infra.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.infra.persistence.model.AtuadorModel;

@Repository
public interface AtuadorJpa extends JpaRepository<AtuadorModel, Integer> {
}
