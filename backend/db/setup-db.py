import sqlite3
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(SCRIPT_DIR, "heatstressmeasures.sqlite")

SQL_FILES = [
    os.path.join(SCRIPT_DIR, "init.sql"),
    os.path.join(SCRIPT_DIR, "seed.sql"),
]


print(f"SCRIPT_DIR: {SCRIPT_DIR}")
print(f"DB_FILE: {DB_FILE}")

if not os.path.exists(DB_FILE):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    for sql_file in SQL_FILES:
        with open(sql_file, "r") as f:
            sql_script = f.read()
            cursor.executescript(sql_script)

    conn.commit()
    conn.close()
    print("Database created and seeded successfully!")
else:
    print(f"Database '{DB_FILE}' already exists. Skipping creation.")

