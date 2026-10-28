package triomaravilha.senai.atmosfera_4_0.interface_.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import triomaravilha.senai.atmosfera_4_0.application.dto.DashResponse;

import triomaravilha.senai.atmosfera_4_0.domain.gateway.DashGateway;


import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/dashboard")
@AllArgsConstructor
public class DasDataController {

    private final DashGateway dash;

    @GetMapping
    public ResponseEntity<List<DashResponse>> findAll() {
        return ResponseEntity.ok(dash.findAll());
    }


    @GetMapping("/{id}")
    public ResponseEntity<List<DashResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(dash.findById(id));
    }

    @GetMapping("/temperatura")
    public ResponseEntity<List<Float>> getTemperatura() {
        return ResponseEntity.ok(dash.getTemps());
    }

    @GetMapping("/altitude")
    public ResponseEntity<List<Float>> getAltitude() {
        return ResponseEntity.ok(dash.getAlt());
    }

    @GetMapping("/sinal")
    public ResponseEntity<List<Float>> getSinal() {
        return ResponseEntity.ok(dash.getSinal());
    }
}
