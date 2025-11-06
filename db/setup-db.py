import sqlite3
import os

DB_FILE = "heatstressmeasures.sqlite"

SQL_FILES = [
    "init.sql",      
    "seed.sql",      
    "seedchild.sql"  
]

if not os.path.exists(DB_FILE):
    print(f"Creating database '{DB_FILE}'...")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    for sql_file in SQL_FILES:
        print(f"Running {sql_file}...")
        with open(sql_file, "r") as f:
            sql_script = f.read()
            cursor.executescript(sql_script)

    conn.commit()
    conn.close()
    print("Database created and seeded successfully!")
else:
    print(f"Database '{DB_FILE}' already exists. Skipping creation.")

