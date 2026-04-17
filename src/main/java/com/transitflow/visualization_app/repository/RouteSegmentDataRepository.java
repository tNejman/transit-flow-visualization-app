package com.transitflow.visualization_app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.transitflow.visualization_app.model.RouteSegmentData;

public interface RouteSegmentDataRepository extends JpaRepository<RouteSegmentData, UUID> {
    List<RouteSegmentData> findAll();
    List<RouteSegmentData> findByRouteSegmentId(UUID routeSegmentId);
    List<RouteSegmentData> findByRouteSegmentIdAndTimestampBetween(UUID routeSegmentId, LocalDateTime start, LocalDateTime end);
    List<RouteSegmentData> findByRouteSegmentIdAndTimestampAfter(UUID routeSegmentId, LocalDateTime timestamp);
    List<RouteSegmentData> findByRouteSegmentIdAndTimestampBefore(UUID routeSegmentId, LocalDateTime timestamp);
    List<RouteSegmentData> findByStartStationIdOrEndStationId(Station startStation, Station endStation);
}
