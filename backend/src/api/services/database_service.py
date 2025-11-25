import sqlite3
import os
from fastapi import Depends
from typing import List, Dict, Optional, Generator
from src.api.exceptions import DatabaseFileNotFound, DatabaseConnectionError
from src.api.requests import MeasureLocationsRequest

DATABASE_FILE = os.environ.get("DB_FILE_PATH", "/app/db/heatstressmeasures.sqlite")

def get_database_connection() -> Generator[sqlite3.Connection, None, None]:
    """
    Get SQLite connection.
    """
    if not os.path.exists(DATABASE_FILE):
        raise DatabaseFileNotFound(db_path=DATABASE_FILE)
             
    conn = None
    try:
        conn = sqlite3.connect(
            DATABASE_FILE,
            check_same_thread=False
        )
        conn.row_factory = sqlite3.Row
        yield conn
        
    except sqlite3.Error as e:
        raise DatabaseConnectionError(detail=str(e))
        
    finally:
        if conn:
            conn.close()

class DatabaseService:
    """
    Service for all database interactions related to heatstress measures.
    """
    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def get_measures(self) -> List[Dict[str, Optional[str] | int]]:
        """
        Selects all placeable measures.
        """
        cursor = self.conn.cursor()
        query = "SELECT name FROM measures WHERE model IS NOT NULL"
        
        try:
            cursor.execute(query)
        except sqlite3.OperationalError as e:
            raise DatabaseConnectionError(detail=f"SQL Query failed: {str(e)}")
        
        results: List[Dict[str, Optional[str]]] = []
        
        for row in cursor.fetchall():
            results.append({
                "id": row["id"],
                "name": row["name"]
            })

        return results
    
    def add_measure_locations(self, data: List[MeasureLocationsRequest]) -> int:
        """
        Inserts new measure location records into the measures_location table.
        Returns the number of inserted records.
        """
        cursor = self.conn.cursor()
        
        query = """
        INSERT INTO measures_location 
            (measure_id, x, y, created_at, updated_at) 
        VALUES 
            (?, ?, ?, datetime('now'), datetime('now'))
        """
        
        values = [
            (data.measure_id, data.x, data.y) 
            for data in data
        ]
        
        try:
            cursor.executemany(query, values)
            self.conn.commit()
            
            return cursor.rowcount
            
        except sqlite3.OperationalError as e:
            raise DatabaseConnectionError(detail=f"Insertion failed in measures_location: {str(e)}")

def get_database_service(
    conn: sqlite3.Connection = Depends(get_database_connection)
) -> DatabaseService:
    """
    FastAPI dependency that instantiates and returns the DatabaseService.
    """
    return DatabaseService(conn=conn)
