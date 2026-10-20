package triomaravilha.senai.atmosfera_4_0.infra.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import triomaravilha.senai.atmosfera_4_0.domain.entity.Atuador;
import triomaravilha.senai.atmosfera_4_0.infra.model.AtuadorModel;

@Repository
public interface AtuadorJpa extends JpaRepository<AtuadorModel, Integer> {
}
