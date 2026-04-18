package com.transitflow.visualization_app.map_service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.transitflow.visualization_app.model.RouteSegmentData;
import com.transitflow.visualization_app.model.Station;

@Service
public class MapService {

    public List<Station> getAllNodes() {
        return Collections.emptyList();
    }

    public Station getNodeById(UUID id) {
        return null;
    }

    public List<RouteSegmentData> getNetworkByDate(LocalDate date) {
        return Collections.emptyList();
    }

    public List<RouteSegmentData> getSegmentsByNodeAndDate(UUID nodeId, LocalDate date) {
        return Collections.emptyList();
    }

    public RouteSegmentData getSegmentDetails(UUID segmentId, LocalDate date) {
        return null;
    }

    public boolean checkDataCompleteness(LocalDate date) {
        return true;
    }
}
