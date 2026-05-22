from Scraper_all_cars import Class

class WebsiteUnderMaintenanceException(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)
        
class SeatsSoldOutException(Exception):
    def __init__(self, *args: object, class_sold_out: Class) -> None:
        self.class_sold_out = class_sold_out
        super().__init__(*args)
        
