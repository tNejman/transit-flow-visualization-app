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

-- 3. WSTAWIANIE ODCINKÓW (ROUTE_SEGMENT)
-- Uwzględniono Twoją regułę biznesową: ID stacji "From" jest mniejsze od "To" alfabetycznie/numerycznie,
-- oraz poprawne nazwy kolumn: station_id_from i station_id_to.
INSERT INTO Route_Segments (id, station_id_from, station_id_to) VALUES
('00000000-0000-0000-0000-000000000001', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e56'), -- 1: Warszawa -> Łódź
('00000000-0000-0000-0000-000000000002', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e68'), -- 2: Warszawa -> Radom
('00000000-0000-0000-0000-000000000003', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e60'), -- 3: Warszawa -> Lublin
('00000000-0000-0000-0000-000000000004', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e61'), -- 4: Warszawa -> Białystok
('00000000-0000-0000-0000-000000000005', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e62'), -- 5: Warszawa -> Olsztyn
('00000000-0000-0000-0000-000000000006', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54'), -- 6: Warszawa -> Poznań
('00000000-0000-0000-0000-000000000007', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52'), -- 7: Warszawa -> Gdańsk
('00000000-0000-0000-0000-000000000008', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57'), -- 8: Warszawa -> Katowice
('00000000-0000-0000-0000-000000000009', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51'), -- 9: Warszawa -> Kraków
('00000000-0000-0000-0000-000000000010', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e63'), -- 10: Warszawa -> Toruń
('00000000-0000-0000-0000-000000000011', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e66', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e68'), -- 11: Kielce -> Radom
('00000000-0000-0000-0000-000000000012', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e66'), -- 12: Kraków -> Kielce
('00000000-0000-0000-0000-000000000013', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e56'), -- 13: Poznań -> Łódź
('00000000-0000-0000-0000-000000000014', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e58'), -- 14: Poznań -> Szczecin
('00000000-0000-0000-0000-000000000015', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e55'), -- 15: Poznań -> Wrocław
('00000000-0000-0000-0000-000000000016', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54'), -- 16: Gdańsk -> Poznań
('00000000-0000-0000-0000-000000000017', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e54', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59'), -- 17: Poznań -> Bydgoszcz
('00000000-0000-0000-0000-000000000018', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e63'), -- 18: Bydgoszcz -> Toruń
('00000000-0000-0000-0000-000000000019', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e59'), -- 19: Gdańsk -> Bydgoszcz
('00000000-0000-0000-0000-000000000020', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e53'), -- 20: Gdańsk -> Gdynia
('00000000-0000-0000-0000-000000000021', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e52', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e58'), -- 21: Gdańsk -> Szczecin
('00000000-0000-0000-0000-000000000022', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e55', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e67'), -- 22: Wrocław -> Opole
('00000000-0000-0000-0000-000000000023', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e67'), -- 23: Katowice -> Opole
('00000000-0000-0000-0000-000000000024', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57'), -- 24: Kraków -> Katowice
('00000000-0000-0000-0000-000000000025', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e57', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e65'), -- 25: Katowice -> Częstochowa
('00000000-0000-0000-0000-000000000026', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e50', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e65'), -- 26: Warszawa -> Częstochowa
('00000000-0000-0000-0000-000000000027', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e51', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e64'), -- 27: Kraków -> Rzeszów
('00000000-0000-0000-0000-000000000028', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e64', 'e0a1b2c3-d4e5-4f6a-8b9c-0a1b2c3d4e69'); -- 28: Rzeszów -> Przemyśl


-- Dodawanie danych dla odcinka 1 (Warszawa -> Łódź) na dzień 18 maja 2026 r.
INSERT INTO route_segment_data (id, route_segment_id, occupancy_from_to, occupancy_to_from, snapshot_time, event_time) VALUES
(RANDOM_UUID(), '00000000-0000-0000-0000-000000000001', 550, 1100, '2026-05-18T12:00:00Z', '2026-05-18');

-- Warszawa-Radom, dane służące do przybliżania
INSERT INTO route_segment_data (id, route_segment_id, occupancy_from_to, occupancy_to_from, snapshot_time, event_time) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 1000, 2000, '2026-05-16T10:00:00Z', '2026-05-16'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 2000, 3000, '2026-05-17T10:00:00Z', '2026-05-17');
