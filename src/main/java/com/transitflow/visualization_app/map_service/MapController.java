package com.transitflow.visualization_app.map_service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.transitflow.visualization_app.model.RouteSegmentData;
import com.transitflow.visualization_app.model.Station;

@RestController
@RequestMapping("/map")
public class MapController {
    private final MapService mapService;

    public MapController(MapService mapService) {
        this.mapService = mapService;
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<Station>> getAllNodes() {
        return new ResponseEntity<>(mapService.getAllNodes(), HttpStatus.OK);
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<?> getNode(@PathVariable UUID id) {
        try {
            return new ResponseEntity<>(mapService.getNodeById(id), HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/segments")
    public ResponseEntity<List<RouteSegmentData>> getNetwork(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return new ResponseEntity<>(mapService.getNetworkByDate(date), HttpStatus.OK);
    }

    @GetMapping("/segments/{id}")
    public ResponseEntity<?> getSegmentDetails(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            return new ResponseEntity<>(mapService.getSegmentDetails(id, date), HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/nodes/{id}/segments")
    public ResponseEntity<?> getSegmentsForNode(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            return new ResponseEntity<>(mapService.getSegmentsByNodeAndDate(id, date), HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> getDataStatus(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return new ResponseEntity<>(mapService.checkDataCompleteness(date), HttpStatus.OK);
    }
}
