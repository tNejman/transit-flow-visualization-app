-- 1. CZYSZCZENIE TABEL (w odpowiedniej kolejności ze względu na klucze obce)

-- Poprawiona sekcja stacji z jawną konwersją na geometrię
-- Sposób A: Użycie konstrukcji typu literalnego (Zalecane i najczystsze)
-- DELETE FROM if exists route_segment_data;
-- DELETE FROM if exists route_segment;
-- DELETE FROM if exists stations;

INSERT INTO stations (id, name, longitude, latitude) VALUES 
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'Warszawa Centralna', 21.0037, 52.2285),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'Kraków Główny',      19.9478, 50.0681),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'Gdańsk Główny',      18.6442, 54.3556),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e53', 'Gdynia Główna',      18.5305, 54.5186),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'Poznań Główny',      16.9114, 52.4012),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e55', 'Wrocław Główny',     17.0361, 51.0984),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e56', 'Łódź Fabryczna',     19.4712, 51.7687),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57', 'Katowice',           19.0168, 50.2584),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e58', 'Szczecin Główny',    14.5515, 53.4182),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59', 'Bydgoszcz Główna',   18.0103, 53.1336),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e60', 'Lublin Główny',      22.5686, 51.2375),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e61', 'Białystok',          23.1706, 53.1418),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e62', 'Olsztyn Główny',     20.4870, 53.7732),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e63', 'Toruń Główny',       18.5988, 53.0097),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e64', 'Rzeszów Główny',     22.0047, 50.0413),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e65', 'Częstochowa',        19.1226, 50.8127),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e66', 'Kielce',             20.6232, 50.8703),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e67', 'Opole Główne',       17.9391, 50.6683),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e68', 'Radom',              21.1464, 51.4017),
('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e69', 'Przemyśl Główny',    22.7767, 49.7832);
-- Sposób B: Jeśli twój parser woli standardowy CAST (alternatywa, gdyby powyższe zgłosiło błąd składniowy)
-- INSERT INTO Stations (id, name, location) VALUES 
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'Warszawa Centralna', CAST('POINT(21.0037 52.2285)' AS GEOMETRY)),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'Kraków Główny',      CAST('POINT(19.9478 50.0681)' AS GEOMETRY));
-- Zastosuj tę zmianę (ST_GeometryFromText) dla WSZYSTKICH pozostałych stacji w pliku!
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'Gdańsk Główny',      ST_GeomFromText('POINT(18.6442 54.3556)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e53', 'Gdynia Główna',      ST_GeomFromText('POINT(18.5305 54.5186)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'Poznań Główny',      ST_GeomFromText('POINT(16.9114 52.4012)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e55', 'Wrocław Główny',     ST_GeomFromText('POINT(17.0361 51.0984)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e56', 'Łódź Fabryczna',     ST_GeomFromText('POINT(19.4712 51.7687)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57', 'Katowice',           ST_GeomFromText('POINT(19.0168 50.2584)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e58', 'Szczecin Główny',    ST_GeomFromText('POINT(14.5515 53.4182)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59', 'Bydgoszcz Główna',   ST_GeomFromText('POINT(18.0103 53.1336)')), -- Jeśli powyższe zadziała, zmień wszystkie
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e60', 'Lublin Główny',      ST_GeomFromText('POINT(22.5686 51.2375)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e61', 'Białystok',          ST_GeomFromText('POINT(23.1706 53.1418)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e62', 'Olsztyn Główny',     ST_GeomFromText('POINT(20.4870 53.7732)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e63', 'Toruń Główny',       ST_GeomFromText('POINT(18.5988 53.0097)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e64', 'Rzeszów Główny',     ST_GeomFromText('POINT(22.0047 50.0413)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e65', 'Częstochowa',        ST_GeomFromText('POINT(19.1226 50.8127)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e66', 'Kielce',             ST_GeomFromText('POINT(20.6232 50.8703)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e67', 'Opole Główne',       ST_GeomFromText('POINT(17.9391 50.6683)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e68', 'Radom',              ST_GeomFromText('POINT(21.1464 51.4017)')),
-- ('e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e69', 'Przemyśl Główny',    ST_GeomFromText('POINT(22.7767 49.7832)'));

-- 3. WSTAWIANIE ODCINKÓW (ROUTE_SEGMENT)
-- Uwzględniono Twoją regułę biznesową: ID stacji "From" jest mniejsze od "To" alfabetycznie/numerycznie,
-- oraz poprawne nazwy kolumn: station_id_from i station_id_to.
INSERT INTO Route_Segments (id, station_id_from, station_id_to) VALUES
(RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51'); -- Warszawa (e50) -> Łódź (e56)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e68'), -- Warszawa (e50) -> Radom (e68)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e60'), -- Warszawa (e50) -> Lublin (e60)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e61'), -- Warszawa (e50) -> Białystok (e61)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e62'), -- Warszawa (e50) -> Olsztyn (e62)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54'), -- Warszawa (e50) -> Poznań (e54)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52'), -- Warszawa (e50) -> Gdańsk (e52)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57'), -- Warszawa (e50) -> Katowice (e57)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51'), -- Warszawa (e50) -> Kraków (e51)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e63'), -- Warszawa (e50) -> Toruń (e63)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e66', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e68'), -- Kielce (e66) -> Radom (e68)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e66'), -- Kraków (e51) -> Kielce (e66)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c- ', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e56'), -- Wrocław (e55) -> Łódź (e56)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e56'), -- Poznań (e54) -> Łódź (e56)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e58'), -- Poznań (e54) -> Szczecin (e58)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e55'), -- Poznań (e54) -> Wrocław (e55)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54'), -- Gdańsk (e52) -> Poznań (e54)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59'), -- Poznań (e54) -> Bydgoszcz (e59)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e63'), -- Bydgoszcz (e59) -> Toruń (e63)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59'), -- Gdańsk (e52) -> Bydgoszcz (e59)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e53'), -- Gdańsk (e52) -> Gdynia (e53)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e58'), -- Gdańsk (e52) -> Szczecin (e58)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e55', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e67'), -- Wrocław (e55) -> Opole (e67)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e67'), -- Katowice (e57) -> Opole (e67)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57'), -- Kraków (e51) -> Katowice (e57)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e65'), -- Katowice (e57) -> Częstochowa (e65)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e65'), -- Warszawa (e50) -> Częstochowa (e65)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e64'), -- Kraków (e51) -> Rzeszów (e64)
-- (RANDOM_UUID(), 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e64', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e69'); -- Rzeszów (e64) -> Przemyśl (e69)