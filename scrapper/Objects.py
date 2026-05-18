import uuid
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.types import Uuid
from sqlalchemy import Float

Base = declarative_base()

class Station(Base):
    __tablename__ = 'Stations'

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    def __init__(self, **kwargs):
        if 'id' not in kwargs:
            kwargs['id'] = uuid.uuid4()
        super().__init__(**kwargs)
    
class RouteSegment(Base):
    __tablename__ = 'Route_Segments'
    __table_args__ = (
        UniqueConstraint('station_id_from', 'station_id_to', name='unique_route_segment_stations'),
    )

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    station_id_from = Column(Uuid(as_uuid=True), ForeignKey('Stations.id'), nullable=False)
    station_id_to = Column(Uuid(as_uuid=True), ForeignKey('Stations.id'), nullable=False)
    station_from = relationship("Station", foreign_keys=[station_id_from])
    station_to = relationship("Station", foreign_keys=[station_id_to])

    def __init__(self, station_from=None, station_to=None, **kwargs):
        super().__init__(**kwargs)
        
        if station_from and station_to:
            if station_from.id > station_to.id:
                self.station_from = station_to
                self.station_to = station_from
            else:
                self.station_from = station_from
                self.station_to = station_to

class RouteSegmentData(Base):
    __tablename__ = 'Route_Segment_Data'

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_segment_id = Column(Uuid(as_uuid=True), ForeignKey('Route_Segments.id'), nullable=False)
    route_segment = relationship("RouteSegment")
    occupancy_from_to = Column(Integer, nullable=False)
    occupancy_to_from = Column(Integer, nullable=False)
    snapshot_time = Column(DateTime(timezone=True), nullable=False)
    event_time = Column(Date, nullable=False)