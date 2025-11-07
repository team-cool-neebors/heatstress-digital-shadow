PRAGMA foreign_keys = ON;

-- Create measures table
CREATE TABLE IF NOT EXISTS measures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    information TEXT,
    is_effective_day INTEGER,
    is_effective_night INTEGER,
    is_effective_city INTEGER,
    is_effective_local INTEGER,
    local_air_temperature_effect_min REAL,
    local_air_temperature_effect_max REAL,
    city_air_temperature_effect_min REAL,
    city_air_temperature_effect_max REAL,
    cooling_effect_pet_min REAL,
    cooling_effect_pet_max REAL,
    model TEXT,
    sort TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- Create cooling_principles table
CREATE TABLE IF NOT EXISTS cooling_principles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Create linking table
CREATE TABLE measures_cooling_principles (
    measures_id INTEGER,
    cooling_principle_id INTEGER,
    PRIMARY KEY (measures_id, cooling_principle_id),
    FOREIGN KEY (measures_id) REFERENCES measures(id) ON DELETE CASCADE,
    FOREIGN KEY (cooling_principle_id) REFERENCES cooling_principles(id) ON DELETE CASCADE
);



-- Create measures_location table
CREATE TABLE IF NOT EXISTS measures_location (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    measures_id INTEGER,
    x REAL,
    y REAL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (measures_id) REFERENCES measures(id) ON DELETE CASCADE
);



