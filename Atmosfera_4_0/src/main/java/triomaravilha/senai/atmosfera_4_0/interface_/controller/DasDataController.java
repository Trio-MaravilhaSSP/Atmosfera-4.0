package triomaravilha.senai.atmosfera_4_0.interface_.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import triomaravilha.senai.atmosfera_4_0.application.dto.DashResponse;

import triomaravilha.senai.atmosfera_4_0.domain.gateway.DashGateway;


import java.util.Collections;
import java.util.List;

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
}
