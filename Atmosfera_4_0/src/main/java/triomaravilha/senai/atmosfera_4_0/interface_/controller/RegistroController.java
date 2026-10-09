package triomaravilha.senai.atmosfera_4_0.interface_.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryRegistro;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/registro")
@RequiredArgsConstructor
public class RegistroController {
    private final RepositoryRegistro repositoryRegistro;

    @GetMapping
    public ResponseEntity<List<RegistroResponse>> findAll() {
        return ResponseEntity.ok(repositoryRegistro.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroResponse> findById(@PathVariable Long id) {
        return  ResponseEntity.status(HttpStatus.valueOf(200)).body(repositoryRegistro.findyById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RegistroResponse> save(@RequestBody RegistroRequest registroRequest) {
        RegistroResponse registroResponse = repositoryRegistro.save(registroRequest);

        return ResponseEntity.created(
                URI.create("/registro" + registroResponse.id())
        ).body(registroResponse);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repositoryRegistro.deleteId(id);
        return ResponseEntity.noContent().build();
    }
}
