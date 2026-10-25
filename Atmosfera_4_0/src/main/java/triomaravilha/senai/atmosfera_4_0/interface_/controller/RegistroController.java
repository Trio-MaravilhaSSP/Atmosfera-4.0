package triomaravilha.senai.atmosfera_4_0.interface_.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import triomaravilha.senai.atmosfera_4_0.application.dto.RegistroResponse;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.RegistroGateway;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.RegistroRequest;
import java.net.URI;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/registro")
@RequiredArgsConstructor
public class RegistroController {
    private final RegistroGateway registroGateway;

    @GetMapping
    public ResponseEntity<List<RegistroResponse>> findAll() {
        return ResponseEntity.ok(registroGateway.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegistroResponse> findById(@PathVariable Long id) {
        return  ResponseEntity.status(HttpStatus.valueOf(200)).body(registroGateway.findyById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RegistroResponse> save(@RequestBody RegistroRequest registroRequest) {
        RegistroResponse registroResponse = registroGateway.save(registroRequest);

        return ResponseEntity.created(
                URI.create("/registro/" + registroResponse.id())
        ).body(registroResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroResponse> update(@PathVariable Long id, @RequestBody RegistroRequest registroRequest) {
        return ResponseEntity.ok(registroGateway.update(id, registroRequest));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        registroGateway.deleteId(id);
        return ResponseEntity.noContent().build();
    }
}
