package com.transitflow.visualization_app.estimation;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.transitflow.visualization_app.model.RouteSegment;
import com.transitflow.visualization_app.model.RouteSegmentData;
import com.transitflow.visualization_app.repository.RouteSegmentDataRepository;
import com.transitflow.visualization_app.repository.RouteSegmentRepository;

@Service
public class EstimationEngine {

    private final RouteSegmentDataRepository routeSegmentDataRepository;
    private final RouteSegmentRepository routeSegmentRepository;

    public EstimationEngine(
            RouteSegmentDataRepository routeSegmentDataRepository,
            RouteSegmentRepository routeSegmentRepository) {
        this.routeSegmentDataRepository = routeSegmentDataRepository;
        this.routeSegmentRepository = routeSegmentRepository;
    }

    public Optional<RouteSegmentData> estimateForSegment(UUID segmentId, LocalDate requestedDate) {
        List<RouteSegmentData> exactMatches = routeSegmentDataRepository.findByRouteSegmentId(segmentId).stream()
                .filter(data -> requestedDate.equals(data.getEventTime()))
                .toList();

        if (!exactMatches.isEmpty()) {
            return Optional.of(exactMatches.get(0));
        }

        List<RouteSegmentData> historicalData = routeSegmentDataRepository
                .findByRouteSegmentIdAndEventTimeBefore(segmentId, requestedDate)
                .stream()
                .sorted(Comparator.comparing(RouteSegmentData::getEventTime))
                .toList();

        if (historicalData.isEmpty()) {
            return Optional.empty();
        }

        RouteSegment routeSegment = routeSegmentRepository.findById(segmentId)
                .orElseThrow(() -> new IllegalStateException(
                        "RouteSegment " + segmentId + " was not found while estimating data"));

        int avgOccupancyFromTo = average(historicalData, RouteSegmentData::getOccupancyFromTo);
        int avgOccupancyToFrom = average(historicalData, RouteSegmentData::getOccupancyToFrom);

        RouteSegmentData estimate = new RouteSegmentData(
                routeSegment,
                avgOccupancyFromTo,
                avgOccupancyToFrom,
                Instant.now(),
                requestedDate);

        return Optional.of(estimate);
    }

    private int average(List<RouteSegmentData> items, java.util.function.ToIntFunction<RouteSegmentData> extractor) {
        double sum = items.stream()
                .mapToInt(extractor)
                .sum();

        return (int) Math.round(sum / items.size());
    }
}
