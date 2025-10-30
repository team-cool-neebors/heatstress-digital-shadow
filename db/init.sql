-- Create measures table
CREATE TABLE IF NOT EXISTS measures (
    id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
    name TINYTEXT,
    information VARCHAR(512),
    is_effective_day BOOLEAN,
    is_effective_night BOOLEAN,
    is_effective_city BOOLEAN,
    is_effective_local BOOLEAN,
    local_air_temperature_effect_min FLOAT,
    local_air_temperature_effect_max FLOAT,
    city_air_temperature_effect_min FLOAT,
    city_air_temperature_effect_max FLOAT,
    cooling_effect_pet_min FLOAT,
    cooling_effect_pet_max FLOAT,
    model TEXT,
    sort TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Create cooling_principles table
CREATE TABLE IF NOT EXISTS cooling_principles(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name TINYTEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(id)
);

-- Create linking table
CREATE TABLE measures_cooling_principles (
    measures_id INT,
    cooling_principle_id INT,
    PRIMARY KEY (measures_id, cooling_principle_id),
    FOREIGN KEY (measures_id) REFERENCES measures(id) ON DELETE CASCADE,
    FOREIGN KEY (cooling_principle_id) REFERENCES cooling_principles(id) ON DELETE CASCADE
);


-- Create measures_location table
CREATE TABLE IF NOT EXISTS measures_location (
    id INT PRIMARY KEY AUTO_INCREMENT UNIQUE,
    measures_id INT,
    x FLOAT,
    y FLOAT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (measures_id) REFERENCES measures(id) ON DELETE CASCADE
);





