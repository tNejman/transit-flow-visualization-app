package com.transitflow.visualization_app.repository;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;

import com.transitflow.visualization_app.model.RouteSegmentData;

public interface RouteSegmentDataRepository extends JpaRepository<RouteSegmentData, UUID> {
    List<RouteSegmentData> findAll();
    List<RouteSegmentData> findByRouteSegmentId(UUID routeSegmentId);
    List<RouteSegmentData> findByRouteSegmentIdAndEventTimeAfter(UUID routeSegmentId, LocalDate eventTime);
    List<RouteSegmentData> findByRouteSegmentIdAndEventTimeBefore(UUID routeSegmentId, LocalDate eventTime);
}
