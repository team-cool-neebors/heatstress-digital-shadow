PRAGMA foreign_keys = ON;

-- Create model_features table
CREATE TABLE IF NOT EXISTS model_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_path TEXT,
    scale REAL,
    height REAL,
    radius REAL,
    geometry TEXT,
    rotation_x REAL,
    rotation_y REAL,
    rotation_z REAL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create measures table
CREATE TABLE IF NOT EXISTS measures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    information TEXT,
    model_features_id INTEGER,
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
    sort TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_features_id) REFERENCES model_features(id) ON DELETE SET NULL
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
