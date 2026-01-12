-- Model features
INSERT INTO model_features (
    model_path,
    scale,
    height,
    radius,
    geometry,
    rotation_x,
    rotation_y,
    rotation_z
    )
VALUES
('/models/tree-pine.glb', 15, 15, 5, 'circle', 0, 0, 90),
('/models/shrub.glb', 2, 0, 2, 'circle', 0, 0, 90),
('/models/pond.glb', 5, 0, 8, 'circle', 0, 0, 90),
('/models/fountain.glb', 13, 0, 7, 'circle', 0, 0, 90);

-- Measures
INSERT INTO measures (
    name, 
    information,
    model_features_id,
    is_effective_day, 
    is_effective_night, 
    is_effective_city, 
    is_effective_local, 
    local_air_temperature_effect_min, 
    local_air_temperature_effect_max, 
    city_air_temperature_effect_min, 
    city_air_temperature_effect_max, 
    cooling_effect_pet_min, 
    cooling_effect_pet_max,
    sort
    )
VALUES
('Trees', 'Effect is dependant on tree type, size and the local climate', 1, 1, 0, 1, 1, 0.2, 2.7, 0.7, 2.7, 3.4, 19, 'green' ),
('Grass/Shrubs', 'Effect of a healthy, well-evaporating lawn. Grass also affects surface temperature up to 20°C cooler than concrete.', 2, 1, 1, 1, 1, 0.1, 1.1, 0.9, 1.2, 0.4, 4.9, 'green'),
('Grass Concrete Tiles', '', NULL, 1, 1, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'green'),
('Green Facades', 'The smaller the street, the greater the effect on air temperature. Greater effect for facades with more sun exposure.', NULL, 1, 1, 0, 1, 0, 1.9, 0.2, 1.5, NULL, NULL, 'green'),
('Green Roofs (extensive)', 'A green roof covered with sedum provides little cooling at night (compared to a white roof). City-level effect is as if 100% of all roofs in the city were green.', NULL, 0, 1, 0, 1, 0.0, 1.8, 0.0, 0.8, NULL, NULL, 'green'),
('Green Roofs (intensive)', 'City-level effect is as if 100% of all roofs in the city were green.', NULL, 1, 1, 1, 0, 0, 1.7, 1.0, 1.6, NULL, NULL, 'green'),
('Park/Urban Willows/Fingers', 'Effect depends on vegetation type (tree vs grass), tree size, park size, and local climate. PET effect in shade is higher than shown here.', NULL, 1, 1, 1, 0, NULL, NULL, 1.1, 2.0, 1.9, 4.2, 'green'),

('Ponds', 'Effect depends on temperature difference between water and air and the size of the water body.', 3, 1, 0, 0, 1, 0.5, 1.3, 0.5, 0.7, 0.6, 3.6, 'blue'),
('Small Lakes', 'Higher evaporation increases cooling effect.', NULL, 1, 0, 1, 0, 1, 2, 0.5, 1.6, NULL, NULL, 'blue'),
('Canals / Ditches / Singels', 'Effect depends on temperature difference between water and air and the size of the water body.', NULL, 1, 0, 0, 1, NULL, NULL, 0.1, 0.8, 0.2, 2, 'blue'),
('Rivers / Ventilated Water', 'Effect depends on temperature difference between water and air and the size of the water body.', NULL, 1, 0, 1, 0, NULL, NULL, 0.5, 4, 1, 4, 'blue'),
('Fountains', 'Evaporation from fountains provides local cooling.', 4, 1, 0, 0, 1, NULL, NULL, 1, 4.7, 1.0, 5.0, 'blue'),
('Misting Systems', 'Evaporation-based cooling, data from Japanese studies.', NULL, 1, 0, 0, 1, NULL, NULL, 0.7, 3.0, NULL, NULL, 'blue'),
('Street Sprinkling', 'Evaporation-based cooling.', NULL, 1, 0, 0, 1, NULL, NULL, 0.8, 3.0, NULL, NULL, 'blue'),
('Polder Roofs', 'Evaporation similar to intensive green roofs.', NULL, 1, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'blue'),

('Parasols/cloths/pergolas/arcades/loggias/awnings/screens', 'the mentioned effects only concern shading by buildings. References see footnote(3).', NULL, 1, 0, 0, 1, NULL, NULL, 0, 1, 2, 17, 'grey'),
('Solar chimney', 'References see footnote(3)', NULL, 1, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'grey'),
('Wind corridors', 'Wind corridors increase wind speed up to 1.5 m/s. Effect on air temperature and PET is not quantified. References see footnote(3).', NULL, 1, 0, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'grey'),
('Large surfaces', 'he openness is represented by the SVF (sky view factor). A low SVF leads to a higher temperature in summer due to the exposed pavement and the lack of shade. A 10% higher SVF also leads to an increase in wind speed by 8%. The total effect of SVF on temperature or PET also depends on albedo, presence of vegetation, and street height-to-width ratio. References see footnote(3).', NULL, 1, 1, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, 'grey'),
('Street height-to-width ratio', 'Studies often focus on dry and hot climate zones, which are not suitable for the Dutch context. References see footnote(4).', NULL, 1, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, NULL, 'grey'),
('Street orientation', 'References see footnote(11).', NULL, 1, 0, 0, 1, NULL, NULL, NULL, 0.4, NULL, 10.2, 'grey'),
('Light-colored facades', 'References see footnote(12).', NULL, 1, 0, 0, 1, NULL, NULL, 0.1, 0.7, NULL, NULL, 'grey'),
('Light-colored streets', 'It is recommended that reflective sidewalks only be used if the streets height-to-width ratio is no greater than 1.0, otherwise the radiation will be reflected back to the facades. For references, see footnote.', NULL, 1, 0, 1, 0, NULL, 1.9, NULL, NULL, NULL, NULL, 'grey'),
('White roofs', '0.1- 0.3 per 10% albedo enlargement', NULL, 1, 0, 1, 0, NULL, 0.9, NULL, NULL, NULL, NULL, 'grey');

-- Cooling principles
INSERT INTO cooling_principles (name)

VALUES ('Evaporation'),
       ('Shading'),
       ('Reflection'),
       ('Ventilation');


-- many to many linking table
INSERT INTO measures_cooling_principles (measures_id, cooling_principle_id)

VALUES (1, 1),
       (1, 2),
       (2, 1),
       (2, 3),
       (3, 1),
       (4, 1),
       (5, 1),
       (6, 1),
       (7, 1), 
       (7, 2), 
       (8, 1),
       (9, 1),
       (10, 1),
       (11, 1),
       (11, 4),
       (12, 1),
       (13, 1),
       (14, 1),
       (15, 1), 
       (16, 2),
       (17, 4),
       (18, 4),
       (19, 4),
       (20, 2),
       (20, 4),
       (21, 2),
       (21, 4),
       (22, 3),
       (23, 3),
       (24, 3);
