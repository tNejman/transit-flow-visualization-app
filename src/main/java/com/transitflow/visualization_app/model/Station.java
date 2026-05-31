package com.transitflow.visualization_app.model;

import java.sql.Types;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;


import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Entity
@Table(name = "Stations")
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Type(HexStringToUUIDUserType.class)
    @Column(name = "id", length = 32, columnDefinition = "char(32)")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(nullable = false, unique = true)
    @EqualsAndHashCode.Include
    private String name;

    @Column(nullable = false)
    private double latitude;  // Szerokość geograficzna (Y)

    @Column(nullable = false)
    private double longitude; // Długość geograficzna (X)
    protected Station() {

    }

    public Station(String name, Point location) {
        this.name = name;
        this.latitude = location.getY();
        this.longitude = location.getX();
    }
}
