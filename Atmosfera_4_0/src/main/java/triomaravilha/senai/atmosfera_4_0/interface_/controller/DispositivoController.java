package triomaravilha.senai.atmosfera_4_0.interface_.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import triomaravilha.senai.atmosfera_4_0.application.dto.DispositivoResponse;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryDispositivo;
import triomaravilha.senai.atmosfera_4_0.domain.repository.RepositoryRegistro;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.DispositivoRequest;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/dispositivo")
@RequiredArgsConstructor
public class DispositivoController {
    private final RepositoryDispositivo dispositivo;

    @GetMapping
    public ResponseEntity<List<DispositivoResponse>> findAll(){
        return ResponseEntity.ok(dispositivo.findAll());

    }

    @GetMapping("/{id}")
    public ResponseEntity<DispositivoResponse> findById(@PathVariable int id){
        return ResponseEntity.status(HttpStatus.valueOf(200)).body(dispositivo.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<DispositivoResponse> save(@RequestBody DispositivoRequest dispositivoRequest){
        DispositivoResponse dispositivoResponse = dispositivo.save(dispositivoRequest);

        return ResponseEntity.created(
                URI.create("/dispositivo" + dispositivoResponse.id())
        ).body(dispositivoResponse);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable int id){
        dispositivo.deleteById(id);

        return ResponseEntity.noContent().build();

    }
}
