package triomaravilha.senai.atmosfera_4_0.interface_.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import triomaravilha.senai.atmosfera_4_0.application.dto.AtuadorResponse;
import triomaravilha.senai.atmosfera_4_0.domain.gateway.AtuadorGateway;
import triomaravilha.senai.atmosfera_4_0.interface_.dto.AtuadorRequest;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/atuador")
@AllArgsConstructor
public class AtuadorController {

    private final AtuadorGateway atuador;

    @GetMapping
    public ResponseEntity<List<AtuadorResponse>> findAll(){
        return ResponseEntity.ok(atuador.findAll());
    }


    @GetMapping("/{id}")
    public ResponseEntity<AtuadorResponse> findById(@PathVariable Integer id){
        return ResponseEntity.status(HttpStatusCode.valueOf(200)).body(atuador.findyById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<AtuadorResponse> save(@RequestBody AtuadorRequest atuadorRequest){
        AtuadorResponse at = atuador.save(atuadorRequest);
        return ResponseEntity.created(
                URI.create("/atuador" + at.id())
        ).body(at);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtuadorResponse> update(@PathVariable int id, @RequestBody AtuadorRequest atuadorRequest){
        return ResponseEntity.ok(atuador.update(id, atuadorRequest));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable Integer id){
        atuador.deleteId(id);
        return ResponseEntity.noContent().build();
    }

}
