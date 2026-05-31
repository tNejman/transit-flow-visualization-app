package com.transitflow.visualization_app.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;

@Getter
@Entity
@Table(name = "Route_Segment_Data")
public class RouteSegmentData {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", length = 32, columnDefinition = "char(32)")
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "route_segment_id", nullable = false)
    @NotFound(action = NotFoundAction.IGNORE)
    private RouteSegment routeSegment;

    @Column(nullable = false)
    private int occupancyFromTo;

    @Column(nullable = false)
    private int occupancyToFrom;

    @Column(nullable = false)
    private Instant snapshotTime;

    @Column(nullable = false)
    private LocalDate eventTime;

    @Transient
    private boolean estimated = false;

    @Transient
    private boolean noData = false;

    protected RouteSegmentData() {

    }

    public RouteSegmentData(
            RouteSegment routeSegment,
            int occupancyFromTo,
            int occupancyToFrom,
            Instant snapshotTime,
            LocalDate eventTime) {
        this.routeSegment = routeSegment;
        this.occupancyFromTo = occupancyFromTo;
        this.occupancyToFrom = occupancyToFrom;
        this.snapshotTime = snapshotTime;
        this.eventTime = eventTime;
    }

    public void setEstimated(boolean estimated) {
        this.estimated = estimated;
    }

    public boolean isNoData() {
        return noData;
    }

    public void setNoData(boolean noData) {
        this.noData = noData;
    }
}
