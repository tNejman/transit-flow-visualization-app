import uuid
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.types import Uuid
from sqlalchemy import Float

Base = declarative_base()

class Station(Base):
    __tablename__ = 'stations'

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    def __str__(self) -> str:
        return (
            f"<Station(id: {self.id}, "
            f"name: {self.name}, "
            f"latitude: {self.latitude}, "
            f"longitude: {self.longitude}>"
        )
    
class RouteSegment(Base):
    __tablename__ = 'route_segments'
    __table_args__ = (
        UniqueConstraint('station_id_from', 'station_id_to', name='unique_route_segment_stations'),
    )

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id_from = Column(Uuid(as_uuid=True), ForeignKey('stations.id'), nullable=False)
    station_id_to = Column(Uuid(as_uuid=True), ForeignKey('stations.id'), nullable=False)
    station_from = relationship("Station", foreign_keys=[station_id_from])
    station_to = relationship("Station", foreign_keys=[station_id_to])

    def __init__(self, station_from=None, station_to=None, **kwargs):
        super().__init__(**kwargs)
        
        if station_from and station_to:
            self.station_from, self.station_to = sorted([station_from, station_to], key=lambda s: s.id)
        else:
            raise Exception("Missing station in c-tor")
        
    def __str__(self) -> str:
        return (
            f"<RouteSegment(id: {self.id}, "
            f"station_from: {self.station_from.name}, "
            f"station_to: {self.station_to.name})>"
        )

class RouteSegmentData(Base):
    __tablename__ = 'route_segment_data'

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_segment_id = Column(Uuid(as_uuid=True), ForeignKey('route_segments.id'), nullable=False)
    route_segment = relationship("RouteSegment")
    occupancy_from_to = Column(Integer, nullable=False)
    occupancy_to_from = Column(Integer, nullable=False)
    snapshot_time = Column(DateTime(timezone=True), nullable=False)
    event_time = Column(Date, nullable=False)
    
    def __str__(self) -> str:
        return (
            f"<RouteSegmentData(id: {id}, "
            f"from: {self.route_segment.station_from.name}, "
            f"to: {self.route_segment.station_to.name}, "
            f"occ_A: {self.occupancy_from_to}↕{self.occupancy_to_from}, "
            f"snapshot_time: {self.snapshot_time:%Y-%m-%d %H:%M:%S}"
            f"event_time: {self.event_time:%Y-%m-%d}]>")