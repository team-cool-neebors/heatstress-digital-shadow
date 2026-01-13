from fastapi import HTTPException, status

class DatabaseException(HTTPException):
    """
    Exception for database-related errors.
    """
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(status_code=status_code, detail=detail)

class DatabaseFileNotFound(DatabaseException):
    def __init__(self, db_path: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database file not found. Service cannot start without file at: {db_path}"
        )

class DatabaseConnectionError(DatabaseException):
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {detail}"
        )
