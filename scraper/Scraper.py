from datetime import datetime, date, timezone
from sqlalchemy import select
from sqlalchemy.orm import joinedload, sessionmaker
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import Page, Browser, Locator, BrowserContext, expect, ProxySettings
from playwright_stealth import Stealth
from curl_cffi import requests
from typing import Optional, List
from enum import Enum
import re
import os

from Objects import Base, Station, RouteSegment, RouteSegmentData
from DBConnector import DBConnector
from Exceptions import *
from Timer import time_function

class Class(Enum):
    FIRST = 1
    SECOND = 2

class RouteOccupancyScraper:
    def __init__(self, base_url: str, is_debug: bool = False) -> None:
        # self.batch_size: int = batch_size
        self.base_url: str = base_url
        self.is_debug: bool = is_debug
        self.scrape_datetime: str = datetime.today().strftime('%Y-%m-%d-%H..%M')
        self.log_file_name: str = f"{self.scrape_datetime}-logs.txt"

    def log(self, mes: str) -> None:
        if self.is_debug:
            debug_mes = f"DEBUG: {mes}"
            print(debug_mes)
            with open(self.log_file_name, "a", encoding="utf-8") as f:
                        f.write(f"{datetime.today().strftime('%Y-%m-%d-%H..%M')} - {debug_mes}\n")
            
    def debug_screenshot(self, page: Page, title: str, _counter: List[int] = [1]) -> None:
        if self.is_debug:
            folder_name = f"scraper/scraper_screenshots/{self.scrape_datetime}"
            if not os.path.exists(folder_name):
                os.makedirs(folder_name)
            file_path = os.path.join(folder_name, f"{_counter[0]}-{title}.png")
            page.screenshot(path=file_path)
            _counter[0] += 1

    def build_event_time(self, date: str, time: str) -> date:
        current_year = datetime.now().year
        combined_str = f"{current_year} {date} {time}"
        parsed_datetime = datetime.strptime(combined_str, "%Y %A, %d %B %H:%M")
        event_datetime = parsed_datetime.replace(tzinfo=timezone.utc).date()
        return event_datetime
    
    def format_station_name(self, station_name: str) -> str:
        name_split = station_name.split()
        return f"{name_split[0]} {name_split[1][0]}" if len(name_split) > 1 else name_split[0]
    
    def goto_connections_page(self, page: Page, station_from_name: str, station_to_name: str) -> None:
        website_under_contr_locator: Locator = page.locator('text=Ten system sprzedaży biletów jest chwilowo niedostępny')
        if website_under_contr_locator.count() > 0 and website_under_contr_locator.is_visible():
            raise WebsiteUnderMaintenanceException("Website under construction")
        
        cookies_popout_locator = page.locator('button[class="CybotCookiebotDialogBodyButton"][id="CybotCookiebotDialogBodyButtonDecline"]')
        if cookies_popout_locator.count() > 0 and cookies_popout_locator.is_visible():
            cookies_popout_locator.click()
        
        station_from_and_in_locator: Locator = page.locator('input[class*="AutocompleateStation_autocompleteStation_input_"]')
        self.log(f"Filling in station from: {station_from_name}")
        station_from_and_in_locator.first.fill(self.format_station_name(station_from_name))
        page.locator('span[id="station1"]').first.click()
        self.debug_screenshot(page, "after_filling_in_station_from")
        
        self.log(f"Filling in station to: {station_to_name}")
        station_from_and_in_locator.nth(1).fill(self.format_station_name(station_to_name))
        page.locator('span[id="station1"]').first.click()
        self.debug_screenshot(page, "after_filling_in_station_to")

        self.log("Pressing 'NEXT'")
        self.debug_screenshot(page, "before_pressing_next")
        page.locator('button[class*="ConfirmButton_confirmButton_"][aria-label="Next"][aria-disabled="false"]').click()
        
        self.log("Pressing 'SEARCH FOR A CONNECTION'")
        self.debug_screenshot(page, "before_pressing_search_for_connection")
        page.locator('button[data-testid="MainPageDesktop-confirm-button"][type="submit"][aria-label*="Search for a"]').click()
    
    def exhaust_later_button(self, page: Page) -> None:
        later_button_locator = page.get_by_role("button", name="Later", exact=True)
        while not later_button_locator.is_disabled():
            later_button_locator.click()
            later_button_locator = page.get_by_role("button", name="Later", exact=True)
            
    def goto_carriage_page(self, page: Page, nth_connection_to_choose: int, class_sought: Class) -> None:
        self.exhaust_later_button(page)
        self.log("Purchasing ticket...")
        page.locator("text=We are searching").wait_for(state="hidden")
        buy_tikcet_locator = page.locator('button[data-testid="OutlineButton"][class*="OutlineButton_outlineButton_"][aria-label*="Buy a ticket for a connection"]')
        buy_tikcet_locator.nth(nth_connection_to_choose).wait_for()
        buy_tikcet_locator.nth(nth_connection_to_choose).click()
        
        class_selection_button_locator: Locator
        if class_sought == Class.FIRST:
            self.log("Choosing 1st class..")
            class_selection_button_locator = page.get_by_test_id("SuperPromo-select-seat-type-1").filter(has_text="Choose class 1")
            
        elif class_sought == Class.SECOND:
            self.log("Choosing 2nd class..")
            class_selection_button_locator = page.get_by_test_id("SuperPromo-select-seat-type-1").filter(has_text="Choose class 2")
            
        if class_selection_button_locator.is_disabled():
            raise SeatsSoldOutException("", class_sold_out=class_sought)
        
        self.debug_screenshot(page, "before_choosing_class")
        class_selection_button_locator.click()
        
        self.log("Choosing a seat...")
        self.debug_screenshot(page, "before_choosing_a_seat")
        choose_a_place_locator: Locator = page.get_by_role("button", name="Choose a place")
        choose_a_place_locator.first.wait_for()
        if choose_a_place_locator.count() > 1:
            raise Exception("non-direct connection")
        choose_a_place_locator.first.click()
        self.debug_screenshot(page, "after_choosing_a_seat")
        
        self.log("Waiting for loaded page (carriage view)...")
        # page.locator("text=direction").wait_for(state="visible")
        page.locator("text=Loading...").wait_for(state="hidden")
            
    def scrape_carriage(self, page: Page, carriage: Locator, class_sought: Class) -> List[str]:
        aria_label_str = str(carriage.get_attribute('aria-label')).lower()
        carriage_id_str = "locomotive"
        if aria_label_str == "locomotive":
            self.log("Scraping locomotive - skipping")
            return []
        elif aria_label_str.startswith("choose car number "):
            carriage_id_str = re.sub(r'\D', '', aria_label_str[-3:])
            self.log(f"Scraping carriage no. '{carriage_id_str}'")
        
        if "pointer-events: none;" in str(carriage.get_attribute('style')).lower():
            self.log(f"Carriage not clickable - skipping")
            return []
        
        carriage.scroll_into_view_if_needed()
        self.debug_screenshot(page, "before_clicking_carriage")
        carriage.dispatch_event("click")
        # page.wait_for_timeout(1000)
        
        iframe = page.frame_locator('iframe[title="Choose your seat on the plan"]')
        seat_buttons_locator = iframe.locator('button[class="seat-overlay-button"]')
        seat_buttons_locator.first.wait_for(state="attached")
        # page.wait_for_timeout(500)
        aria_label_values: List[str] = [str(seat_button.get_attribute('aria-label')).lower() for seat_button in seat_buttons_locator.all()]

        occ_data_debug: dict[str, int] = {}
        if self.is_debug:
            occ_data_debug = self.parse_occupancy_data(aria_label_values, class_sought)
        self.log(f"carriage id. {carriage_id_str} seats: {occ_data_debug}")
        
        return aria_label_values
        
    def fetch_route_data_for_all_hours(self, station_from: Station, station_to: Station, class_sought: Class) -> Optional[List[tuple[List[str], str, str]]]:
        """
        Returns:
            Optional[List[tuple[List[str], str, str]]]: 
            each tuple represents one ride-date-hour trio; and ride is a list of strings, each being one seat aria-label
        """
        with Stealth().use_sync(sync_playwright()) as p:
            # server_addr = os.getenv("NGROK_ADDRESS")
            # server_user = os.getenv("SERV_USER")
            # server_pass = os.getenv("SERV_PASS")
            
            # if not all([server_addr, server_user, server_pass]):
            #     raise ValueError("Missing env variables for ngrok")

            # proxy_cfg = ProxySettings({
            #     "server": str(server_addr),
            #     "username": str(server_user),
            #     "password": str(server_pass)
            # })
            
            browser: Browser = p.chromium.launch(
                headless=True, 
                args=["--disable-blink-features=AutomationControlled"],
                # proxy=proxy_cfg
            )
            context: BrowserContext = browser.new_context()
            context.tracing.start(screenshots=True, snapshots=True, sources=True)
            page: Page = context.new_page()

            cars_html_date_hour_trio_list: List[tuple[List[str], str, str]] = []

            try:
                self.log(f"Loading {self.base_url}...")
                page.goto(self.base_url, wait_until="domcontentloaded", timeout=45000)
                
                self.goto_connections_page(page, str(station_from.name), str(station_to.name))
                
                connection_list_url = page.url
                self.exhaust_later_button(page)
                self.log("Purchasing ticket...")
                page.locator("text=We are searching").wait_for(state="hidden")
                buy_tikcet_locator: Locator = page.locator('button[data-testid="OutlineButton"][class*="OutlineButton_outlineButton_"][aria-label*="Buy a ticket for a connection"]')
                buy_tikcet_locator.first.wait_for()
                
                for i in range(buy_tikcet_locator.count()):
                    page.goto(connection_list_url, wait_until="domcontentloaded", timeout=45000)
                    
                    self.goto_carriage_page(page, i, class_sought)

                    self.log("Waiting for load of first carriage locator")
                    # TODO - check for "We are unable to show available seats on the plan now" and abort
                    carriages_locator: Locator = page.locator('div[class*="Carriage_carriageBox_"][role="button"]')
                    carriages_locator.first.wait_for()
                    
                    route_data_locator: Locator = page.locator('span[class=css-1yge7qx]')
                    date = route_data_locator.nth(0).inner_html()
                    hour = route_data_locator.nth(1).evaluate("el => el.childNodes[0].textContent.trim()")
                    # event_datetime = self.build_event_time(date, hour)
                    self.log(f"Route date: {date}, departure at: {hour}")
                    
                    self.log("GRM META")
                    loc = page.locator('li[class*="Grm_grmMetaItem_"]')
                    loc.first.wait_for()
                    self.log(f"Train info: {loc.first.inner_text()}")
            
                    for i in range(carriages_locator.count()):
                        aria_label_values = self.scrape_carriage(page, carriages_locator.nth(i), class_sought)
                        cars_html_date_hour_trio_list.append((aria_label_values, date, str(hour)))
                        
                return cars_html_date_hour_trio_list

            except PlaywrightTimeoutError as e:
                self.log(f"PlaywrightTimneout while navigating for segment from: {station_from.name} to: {station_to.name}, err: {e}")
                self.debug_screenshot(page, "timeout_error")
            except SeatsSoldOutException as e:
                self.log(f"Seats sold out in {e.class_sold_out}")
            except Exception as e:
                self.log(f"Exception; Failed to fetch data for segment from: {station_from.name} to: {station_to.name}, err: {e}")
            finally:
                self.debug_screenshot(page, "finally")
                if self.is_debug:
                    with open("page_source.html", "w", encoding="utf-8") as f:
                        aria_list_list = [seat_date_hour[0] for seat_date_hour in cars_html_date_hour_trio_list]
                        seat_list = [seat for sublist in aria_list_list for seat in sublist]
                        f.write("\n".join(seat_list))
                browser.close()
                return cars_html_date_hour_trio_list

    def parse_occupancy_data(self, html_content: List[str], class_sought: Class) -> dict[str, int]:
        free_seats = 0
        taken_seats = 0

        sougt_class_str = "klasa 1" if class_sought == Class.FIRST else "klasa 2"
        
        for button_aria_label_str in html_content:
            if not sougt_class_str in button_aria_label_str:
                continue
            if 'wolne' in button_aria_label_str:
                free_seats += 1
            elif 'niedostepne' in button_aria_label_str:
                taken_seats += 1
                
        extracted_data = {
            'free_seats': free_seats,
            'taken_seats': taken_seats,
        }        
        return extracted_data
    
    def fetch_data_and_build_route_segment_data(self, route_segment: RouteSegment) -> Optional[RouteSegmentData]:
        station_from = route_segment.station_from
        station_to = route_segment.station_to
        
        from_to_data_class1 = self.fetch_route_data_for_all_hours(station_from, station_to, Class.FIRST)
        from_to_data_class2 = self.fetch_route_data_for_all_hours(station_from, station_to, Class.SECOND)
        to_from_data_class1 = self.fetch_route_data_for_all_hours(station_to, station_from, Class.FIRST)
        to_from_data_class2 = self.fetch_route_data_for_all_hours(station_to, station_from, Class.SECOND)
        
        if not from_to_data_class1:
            from_to_data_class1 = []
        if not from_to_data_class2:
            from_to_data_class2 = []
        if not to_from_data_class1:
            to_from_data_class1 = []
        if not to_from_data_class2:
            to_from_data_class2 = []
        
        aria_lists_from_to_class1 = [aria_list for aria_list, _, _ in from_to_data_class1]
        aria_lists_from_to_class2 = [aria_list for aria_list, _, _ in from_to_data_class2]
        aria_lists_to_from_class1 = [aria_list for aria_list, _, _ in to_from_data_class1]
        aria_lists_to_from_class2 = [aria_list for aria_list, _, _ in to_from_data_class2]
        
        pure_aria_seats_from_to_class1 = [seat for sublist in aria_lists_from_to_class1 for seat in sublist]
        pure_aria_seats_from_to_class2 = [seat for sublist in aria_lists_from_to_class2 for seat in sublist]
        pure_aria_seats_to_from_class1 = [seat for sublist in aria_lists_to_from_class1 for seat in sublist]
        pure_aria_seats_to_from_class2 = [seat for sublist in aria_lists_to_from_class2 for seat in sublist]
        
        seat_counts_from_to_class_1 = self.parse_occupancy_data(pure_aria_seats_from_to_class1, Class.FIRST)
        seat_counts_from_to_class_2 = self.parse_occupancy_data(pure_aria_seats_from_to_class2, Class.SECOND)
        seat_counts_to_from_class_1 = self.parse_occupancy_data(pure_aria_seats_to_from_class1, Class.FIRST)
        seat_counts_to_from_class_2 = self.parse_occupancy_data(pure_aria_seats_to_from_class2, Class.SECOND)
        
        occupancy_total_from_to = seat_counts_from_to_class_1["taken_seats"] + seat_counts_from_to_class_2["taken_seats"]
        occupancy_total_to_from = seat_counts_to_from_class_1["taken_seats"] + seat_counts_to_from_class_2["taken_seats"]
        
        return RouteSegmentData(route_segment_id=route_segment.id,
                                route_segment=route_segment,
                                occupancy_from_to=occupancy_total_from_to,
                                occupancy_to_from=occupancy_total_to_from,
                                snapshot_time=datetime.now(timezone.utc),
                                event_time=datetime.now(timezone.utc).date())
        

def DEBUG_create_stations_and_segment(sessionmaker: sessionmaker, from_str: str, to_str: str) -> None:
    station_from = Station(name=from_str, latitude=1.0, longitude=1.0)
    station_to = Station(name=to_str, latitude=1.0, longitude=1.0)
        
    with sessionmaker() as session:
        engine = session.get_bind()
        Base.metadata.create_all(engine)
    
    with sessionmaker() as session:
        session.add(station_from)
        session.add(station_to)
        session.commit()
    
    with sessionmaker() as session:
        stmt_from = select(Station).where(Station.name == from_str)
        stmt_to = select(Station).where(Station.name == to_str)
        
        station_from_db_fetched = session.scalar(stmt_from)
        station_to_db_fetched = session.scalar(stmt_to)
        
        if not station_from_db_fetched or not station_to_db_fetched:
            raise Exception("missing db station")
        
        segment = RouteSegment(station_from=station_from_db_fetched,
                               station_to=station_to_db_fetched)
        session.add(segment)
        session.commit()

def DEBUG_get_segment_from_station_names(from_str: str, to_str: str) -> RouteSegment:
    Session = DBConnector().create_local_session(filename="scraped_data.db")
    
    with Session() as session:
        stmt_from = select(Station).where(Station.name == from_str)
        stmt_to = select(Station).where(Station.name == to_str)
        
        station_from_db_fetched = session.scalar(stmt_from)
        station_to_db_fetched = session.scalar(stmt_to)
        
        if not station_from_db_fetched or not station_to_db_fetched:
            raise Exception("missing db station")
        
        id_min = min(station_from_db_fetched.id, station_to_db_fetched.id)
        id_max = max(station_from_db_fetched.id, station_to_db_fetched.id)
        stmt_seg = select(RouteSegment).where(RouteSegment.station_id_from == id_min and RouteSegment.station_id_to == id_max
                                      ).options(joinedload(RouteSegment.station_from), 
                                                joinedload(RouteSegment.station_to))
        
        route_segment_fetched = session.scalar(stmt_seg)
        if not route_segment_fetched:
            raise Exception("missing route segment")
        
        return route_segment_fetched

@time_function
def main() -> int:
    sessionmaker = DBConnector().create_mysql_session()
    route_segments = DBConnector().select_all_route_segments_not_scraped_today(sessionmaker)

    try:
        scraper = RouteOccupancyScraper(base_url="https://ebilet.intercity.pl/", is_debug=True )
        for segment in route_segments:
            route_segment_data: Optional[RouteSegmentData] = scraper.fetch_data_and_build_route_segment_data(segment)
            with open("backup.txt", "a", encoding="utf-8") as f:
                f.write(f"{route_segment_data.__str__()}\n")
            if route_segment_data:
                DBConnector().insert_route_segment_data(sessionmaker, route_segment_data)
        return 0
    
    except Exception as e:
        print(f"DEBUG: ", e)
        return 1
            
@time_function
def main_no_log() -> int:
    sessionmaker = DBConnector().create_local_session(filename="scraped_data.db")
    route_segments = DBConnector().select_all_route_segments(sessionmaker)

    scraper = RouteOccupancyScraper(base_url="https://ebilet.intercity.pl/", is_debug=False )
    for segment in route_segments:
        route_segment_data: Optional[RouteSegmentData] = scraper.fetch_data_and_build_route_segment_data(segment)
        if route_segment_data:
            DBConnector().insert_route_segment_data(sessionmaker, route_segment_data)
        
    return 0

if __name__ == "__main__":    
    main()