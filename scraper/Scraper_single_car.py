import logging
from datetime import datetime
import requests
import asyncio
from bs4 import BeautifulSoup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import Page, expect
from playwright_stealth import Stealth
import uuid
from unittest.mock import MagicMock

from Objects import RouteSegment, RouteSegmentData
from DBConnector import DBConnector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RouteOccupancyScraper:
    def __init__(self, db_session, batch_size: int = 50, base_url: str = "https://example.com/routes"):
        self.session = db_session
        self.batch_size = batch_size
        self.base_url = base_url

    def fetch_route_data(self, segment) -> str:
        station_from = getattr(segment, 'station_name_from', 'Warszawa Centralna') 
        station_to = getattr(segment, 'station_name_to', 'Kraków Główny')

        with Stealth().use_sync(sync_playwright()) as p:
            browser = p.chromium.launch(headless=True, args=["--disable-blink-features=AutomationControlled"])
            context = browser.new_context()
            context.tracing.start(screenshots=True, snapshots=True, sources=True)
            page = context.new_page()

            try:
                current_date_str = datetime.today().strftime('%Y-%m-%d')
                print("Today is: ", current_date_str)
                current_time_str = f"{int(datetime.today().strftime('%H'))+4}%3A{datetime.today().strftime('%M')}"
                print("Time is: ", current_time_str)
                url = f"https://ebilet.intercity.pl/wyszukiwanie?dwyj={current_date_str}&swyj=5100246&sprzy=5100081&time={current_time_str}&przy=0&sprzez=&ticket100=1010&ticket50=&polbez=0"
                print(f"Loading {url}...")
                page.goto(url, wait_until="domcontentloaded", timeout=45000)
                print("purchasin ticket")
                page.get_by_role("button", name="Buy a ticket").first.click()
                print("choosing 2nd class")
                page.get_by_test_id("SuperPromo-select-seat-type-1").filter(has_text="Choose class 2").click()
                print("choosing seat")
                page.get_by_role("button", name="Choose a place").first.click()
                
                print("waiting for loaded page")
                page.locator("text=direction").wait_for(state="visible")
                page.locator("text=Loading...").wait_for(state="hidden")

                max_retries = 10
                target_frame = ""
                for _ in range(max_retries):
                    for frame in page.frames:
                        try:
                            if frame.locator("button.seat-overlay-button").count() > 0:
                                target_frame = frame
                                break
                        except:
                            pass
                    if target_frame:
                        break
                    
                    page.wait_for_timeout(500)
                
                if not target_frame:
                    raise Exception("no frame found")
    
                sub_html = target_frame.locator("body").inner_html()
                return sub_html

            except PlaywrightTimeoutError as e:
                logger.error(f"Timeout while navigating for segment {segment.id}: {e}")
                page.screenshot(path="timeout_error.png", full_page=True)
                return None
            except Exception as e:
                logger.error(f"Failed to fetch data for segment {segment.id}: {e}")
                return None
            finally:
                page.screenshot(path="debug_before_closing.png")
                with open("page_source.html", "w", encoding="utf-8") as f:
                    f.write(sub_html)
                browser.close()
                
    def parse_occupancy_data(self, html_content: str) -> dict:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        free_seats = 0
        taken_seats = 0
        
        buttons = soup.find_all('button', class_='seat-overlay-button')
        
        for button in buttons:
            aria_label = button.get('aria-label', '').lower()
            
            if 'wolne' in aria_label:
                free_seats += 1
            elif 'niedostepne' in aria_label:
                taken_seats += 1
                
        extracted_data = {
            'free_seats': free_seats,
            'taken_seats': taken_seats,
            'event_time': 0        # TODO add event time
        }
        
        return extracted_data

def make_mock_route_segment(from_st: str, to_st: str) -> RouteSegment:
    station_a = MagicMock()
    station_a.id = uuid.uuid4()
    
    station_b = MagicMock()
    station_b.id = uuid.uuid4()
    
    return RouteSegment(station_from=station_a, station_to=station_b)

if __name__ == "__main__":
    # Session = DBConnector().create_mysql_session()
    Session = DBConnector().create_local_session(filename="scraped_data.db")
    seg = make_mock_route_segment("Warszawa Zachodnia", "Łódź Fabryczna")
    with Session() as session:
        scraper = RouteOccupancyScraper(db_session=session, batch_size=50)
        html = scraper.fetch_route_data(seg)
        # print(html)
        data = scraper.parse_occupancy_data(html)
        print(data)
        # scraper.run()