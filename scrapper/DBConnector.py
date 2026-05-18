import os
import ssl
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

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
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return SessionLocal()
    
    def create_local_session(self, filename: str):
        engine = create_engine(f"sqlite:///{os.path.abspath(filename)}", echo=True)
        # SessionLocal = sessionmaker(bind=engine)
        # return SessionLocal()
        return sessionmaker(bind=engine)