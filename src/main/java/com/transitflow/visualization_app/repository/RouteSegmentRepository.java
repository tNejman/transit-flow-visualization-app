package com.transitflow.visualization_app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.transitflow.visualization_app.model.RouteSegment;

public interface RouteSegmentRepository extends JpaRepository<RouteSegment, UUID> {
    List<RouteSegment> findAll();
    RouteSegment findByStartStationIdAndEndStationId(UUID startStationId, UUID endStationId);
    List<RouteSegment> findByStartStationOrEndStation(Station startStation, Station endStation);
}
