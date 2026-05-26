package com.transitflow.visualization_app.map_service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.transitflow.visualization_app.estimation.EstimationEngine;
import com.transitflow.visualization_app.model.RouteSegment;
import com.transitflow.visualization_app.model.RouteSegmentData;
import com.transitflow.visualization_app.model.Station;
import com.transitflow.visualization_app.repository.RouteSegmentDataRepository;
import com.transitflow.visualization_app.repository.RouteSegmentRepository;
import com.transitflow.visualization_app.repository.StationRepository;

@Service
public class MapService {

    private final StationRepository stationRepository;
    private final RouteSegmentRepository routeSegmentRepository;
    private final RouteSegmentDataRepository routeSegmentDataRepository;
    private final EstimationEngine estimationEngine;

    // Wstrzykiwanie repozytoriów przez konstruktor
    public MapService(StationRepository stationRepository,
                      RouteSegmentRepository routeSegmentRepository,
                      RouteSegmentDataRepository routeSegmentDataRepository,
                      EstimationEngine estimationEngine) {
        this.stationRepository = stationRepository;
        this.routeSegmentRepository = routeSegmentRepository;
        this.routeSegmentDataRepository = routeSegmentDataRepository;
        this.estimationEngine = estimationEngine;
    }

    public List<Station> getAllNodes() {
        return stationRepository.findAll();
    }

    public Station getNodeById(UUID id) {
        return stationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Station with ID " + id + " not found"));
    }

    public List<RouteSegmentData> getNetworkByDate(LocalDate date) {
        List<RouteSegmentData> exactData = routeSegmentDataRepository.findByEventTime(date);
        var exactSegmentIds = exactData.stream()
                .map(data -> data.getRouteSegment().getId())
                .collect(java.util.stream.Collectors.toSet());

        List<RouteSegmentData> estimatedData = routeSegmentRepository.findAll().stream()
                .filter(segment -> !exactSegmentIds.contains(segment.getId()))
                .map(segment -> estimationEngine.estimateForSegment(segment.getId(), date))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        List<RouteSegmentData> merged = new ArrayList<>(exactData);
        merged.addAll(estimatedData);
        return merged;
    }

    public List<RouteSegmentData> getSegmentsByNodeAndDate(UUID nodeId, LocalDate date) {
        // Upewniamy się najpierw, czy stacja w ogóle istnieje (żeby rzucić 404 w kontrolerze jeśli nie)
        if (!stationRepository.existsById(nodeId)) {
            throw new NoSuchElementException("Station with ID " + nodeId + " not found");
        }

        // 1. Znajdź wszystkie segmenty infrastruktury podpięte pod tę stację (jako startowa lub końcowa)
        List<RouteSegment> segments = routeSegmentRepository.findByStationToOrStationFrom(nodeId, nodeId);
        
        // 2. Zbierz dane (occupancy, etc.) dla tych segmentów z konkretnego dnia
        List<RouteSegmentData> result = new ArrayList<>();
        for (RouteSegment segment : segments) {
            List<RouteSegmentData> dataForSegment = routeSegmentDataRepository.findByRouteSegmentId(segment.getId());
            // Filtrujemy dane, które odpowiadają wybranej dacie
            for (RouteSegmentData data : dataForSegment) {
                if (data.getEventTime().equals(date)) {
                    result.add(data);
                }
            }
        }
        return result;
    }

    public RouteSegmentData getSegmentDetails(UUID segmentId, LocalDate date) {
        // Pobieramy dane dla danego segmentu z bazy
        List<RouteSegmentData> dataList = routeSegmentDataRepository.findByRouteSegmentId(segmentId);
        
        // Szukamy rekordu z pasującą datą
        return dataList.stream()
                .filter(data -> data.getEventTime().equals(date))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("No data found for segment ID " + segmentId + " on date " + date));
    }

    public boolean checkDataCompleteness(LocalDate date) {
        List<RouteSegmentData> dataForDay = routeSegmentDataRepository.findByEventTime(date);
        var exactSegmentIds = dataForDay.stream()
                .map(data -> data.getRouteSegment().getId())
                .collect(java.util.stream.Collectors.toSet());

        long totalSegments = routeSegmentRepository.count();
        return exactSegmentIds.size() >= totalSegments;
    }
}
