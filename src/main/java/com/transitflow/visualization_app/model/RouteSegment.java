package com.transitflow.visualization_app.model;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Entity
@Table(
    name = "Route_Segments",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_route_segment_stations",
            columnNames = {"station_id_from", "station_id_to"}
        )
    }
)
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RouteSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id_from", nullable = false)
    // StationId from should always be smaller than stationId to, to avoid duplicates in the database
    private Station stationFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id_to", nullable = false)
    // StationId To should always be larger than stationId from, to avoid duplicates in the database
    private Station stationTo;

    protected RouteSegment() {

    }

    public RouteSegment(Station stationFrom, Station stationTo) {
        if (stationFrom.getId().compareTo(stationTo.getId()) > 0) {
            this.stationFrom = stationTo;
            this.stationTo = stationFrom;
        } else {
            this.stationFrom = stationFrom;
            this.stationTo = stationTo;
        }
    }
}
