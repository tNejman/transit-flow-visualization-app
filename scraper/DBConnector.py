import os
import ssl
from dotenv import load_dotenv
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, selectinload, joinedload
from typing import List
from datetime import date

from Objects import RouteSegment, RouteSegmentData
class DBConnector:
    def create_mysql_session(self):
        load_dotenv()
        
        db_address = os.getenv("DB_ADDRESS")
        db_port = os.getenv("DB_PORT")
        db_name = os.getenv("DB_NAME")
        db_user = os.getenv("DB_USER")
        db_pass = os.getenv("DB_PASS")

        if not all([db_address, db_port, db_name, db_user, db_pass]):
            raise ValueError("Missing one or more required database environment variables.")
        db_url = f"mysql+pymysql://{db_user}:{db_pass}@{db_address}:{db_port}/{db_name}"
        engine = create_engine(db_url, pool_pre_ping=True, connect_args={
            "ssl": {
                "cert_reqs": ssl.CERT_NONE
            }
        })
        return sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False)
    
    def create_local_session(self, filename: str):
        engine = create_engine(f"sqlite:///{os.path.abspath(filename)}", echo=True)
        return sessionmaker(bind=engine)
    
    def select_all_route_segments(self, sessionmaker: sessionmaker) -> List[RouteSegment]:
        with sessionmaker() as session:
            stmt = select(RouteSegment).options(
                joinedload(RouteSegment.station_from),
                joinedload(RouteSegment.station_to)
            )
            
            route_segments = session.scalars(stmt).all()
            return route_segments
    
    def select_all_route_segments_not_scraped_today(self, sessionmaker: sessionmaker) -> List[RouteSegment]:
        with sessionmaker() as session:
            today = date.today()
            stmt = select(RouteSegment).where(
                ~select(RouteSegmentData.id).where(
                    RouteSegmentData.route_segment_id == RouteSegment.id,
                    RouteSegmentData.event_time == today
                ).exists()
            ).options(
                joinedload(RouteSegment.station_from),
                joinedload(RouteSegment.station_to)
            )
            route_segments = session.scalars(stmt).all()
            return route_segments
            
        return []
    
    def insert_route_segment_data(self, sessionmaker: sessionmaker, route_segment_data: RouteSegmentData) -> None:
        with sessionmaker() as session:
            session.add(route_segment_data)
            session.commit()