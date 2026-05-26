package com.transitflow.visualization_app.map_service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.transitflow.visualization_app.estimation.EstimationEngine;
import com.transitflow.visualization_app.model.RouteSegment;
import com.transitflow.visualization_app.model.RouteSegmentData;
import com.transitflow.visualization_app.repository.RouteSegmentDataRepository;
import com.transitflow.visualization_app.repository.RouteSegmentRepository;
import com.transitflow.visualization_app.repository.StationRepository;

@ExtendWith(MockitoExtension.class)
class MapServiceTest {

    @Mock
    private StationRepository stationRepository;

    @Mock
    private RouteSegmentRepository routeSegmentRepository;

    @Mock
    private RouteSegmentDataRepository routeSegmentDataRepository;

    @Mock
    private EstimationEngine estimationEngine;

    @InjectMocks
    private MapService mapService;

    @Test
    void returnsEstimatedSegmentWhenExactDataIsMissing() {
        UUID warsawRadomSegmentId = UUID.fromString("00000000-0000-0000-0000-000000000002");
        LocalDate requestedDate = LocalDate.of(2026, 5, 18);

        RouteSegment warsawRadomSegment = org.mockito.Mockito.mock(RouteSegment.class);
        when(warsawRadomSegment.getId()).thenReturn(warsawRadomSegmentId);

        RouteSegmentData estimate = new RouteSegmentData(
                warsawRadomSegment,
                60,
                40,
                java.time.Instant.parse("2026-05-18T12:00:00Z"),
                requestedDate);
        estimate.setEstimated(true);

        when(routeSegmentDataRepository.findByEventTime(requestedDate)).thenReturn(List.of());
        when(routeSegmentRepository.findAll()).thenReturn(List.of(warsawRadomSegment));
        when(estimationEngine.estimateForSegment(warsawRadomSegmentId, requestedDate)).thenReturn(Optional.of(estimate));

        List<RouteSegmentData> result = mapService.getNetworkByDate(requestedDate);

        assertEquals(1, result.size());
        assertEquals(60, result.get(0).getOccupancyFromTo());
        assertEquals(40, result.get(0).getOccupancyToFrom());
        assertEquals(requestedDate, result.get(0).getEventTime());
        assertEquals(true, result.get(0).isEstimated());
    }

    @Test
    void reportsIncompleteWhenAtLeastOneSegmentIsEstimated() {
        UUID exactSegmentId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID estimatedSegmentId = UUID.fromString("00000000-0000-0000-0000-000000000002");
        LocalDate requestedDate = LocalDate.of(2026, 5, 18);

        RouteSegment exactSegment = org.mockito.Mockito.mock(RouteSegment.class);
        when(exactSegment.getId()).thenReturn(exactSegmentId);

        RouteSegmentData exactData = new RouteSegmentData(
                exactSegment,
                70,
                30,
                java.time.Instant.parse("2026-05-18T12:00:00Z"),
                requestedDate);

        when(routeSegmentDataRepository.findByEventTime(requestedDate)).thenReturn(List.of(exactData));
        lenient().when(routeSegmentRepository.count()).thenReturn(2L);

        boolean complete = mapService.checkDataCompleteness(requestedDate);

        assertEquals(false, complete);
    }
}
