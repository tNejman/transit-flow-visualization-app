package com.transitflow.visualization_app.estimation;

import java.lang.reflect.Field;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.transitflow.visualization_app.model.RouteSegment;
import com.transitflow.visualization_app.model.RouteSegmentData;
import com.transitflow.visualization_app.model.Station;
import com.transitflow.visualization_app.repository.RouteSegmentDataRepository;
import com.transitflow.visualization_app.repository.RouteSegmentRepository;

@ExtendWith(MockitoExtension.class)
class EstimationEngineTest {

    @Mock
    private RouteSegmentDataRepository routeSegmentDataRepository;

    @Mock
    private RouteSegmentRepository routeSegmentRepository;

    @InjectMocks
    private EstimationEngine estimationEngine;

    @Test
    void returnsExactDataWhenItExists() {
        UUID segmentId = UUID.randomUUID();
        LocalDate requestedDate = LocalDate.of(2026, 5, 20);

        RouteSegment segment = buildSegment();
        RouteSegmentData exact = new RouteSegmentData(
                segment,
                55,
                44,
                Instant.parse("2026-05-19T10:00:00Z"),
                requestedDate);

        when(routeSegmentDataRepository.findByRouteSegmentId(segmentId)).thenReturn(List.of(exact));

        Optional<RouteSegmentData> result = estimationEngine.estimateForSegment(segmentId, requestedDate);

        assertTrue(result.isPresent());
        assertEquals(55, result.get().getOccupancyFromTo());
        assertEquals(44, result.get().getOccupancyToFrom());
        assertEquals(requestedDate, result.get().getEventTime());
    }

    @Test
    void returnsAveragedHistoricalDataWhenNoExactMatchExists() {
        UUID segmentId = UUID.randomUUID();
        LocalDate requestedDate = LocalDate.of(2026, 5, 20);

        RouteSegment segment = buildSegment();

        RouteSegmentData older1 = new RouteSegmentData(
                segment,
                10,
                20,
                Instant.parse("2026-05-01T08:00:00Z"),
                LocalDate.of(2026, 5, 1));

        RouteSegmentData older2 = new RouteSegmentData(
                segment,
                30,
                40,
                Instant.parse("2026-05-10T08:00:00Z"),
                LocalDate.of(2026, 5, 10));

        when(routeSegmentDataRepository.findByRouteSegmentId(segmentId)).thenReturn(List.of());
        when(routeSegmentDataRepository.findByRouteSegmentIdAndEventTimeBefore(segmentId, requestedDate))
                .thenReturn(List.of(older1, older2));
        when(routeSegmentRepository.findById(segmentId)).thenReturn(Optional.of(segment));

        Optional<RouteSegmentData> result = estimationEngine.estimateForSegment(segmentId, requestedDate);

        assertTrue(result.isPresent());
        assertEquals(20, result.get().getOccupancyFromTo());
        assertEquals(30, result.get().getOccupancyToFrom());
        assertEquals(requestedDate, result.get().getEventTime());
    }

    private RouteSegment buildSegment() {
        GeometryFactory geometryFactory = new GeometryFactory();
        Station stationA = createStation("A", geometryFactory.createPoint(new Coordinate(21.0, 52.0)));
        Station stationB = createStation("B", geometryFactory.createPoint(new Coordinate(21.1, 52.1)));
        return new RouteSegment(stationA, stationB);
    }

    private Station createStation(String name, Point location) {
        Station station = new Station(name, location);
        setId(station, UUID.randomUUID());
        return station;
    }

    private void setId(Object entity, UUID id) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException("Failed to set entity id", e);
        }
    }
}
