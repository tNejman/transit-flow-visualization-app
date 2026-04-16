package com.transitflow.visualization_app.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.transitflow.visualization_app.model.Station;

public interface StationRepository extends JpaRepository<Station, UUID> {
    List<Station> findAll();
}
