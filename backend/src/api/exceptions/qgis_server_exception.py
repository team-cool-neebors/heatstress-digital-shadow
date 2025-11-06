class QgisServerException(Exception):
    """Exception for errors originating from the QGIS Server."""
    def __init__(self, status_code: int, detail: str, log_message: str = None):
        self.status_code = status_code
        self.detail = detail
        self.log_message = log_message
        super().__init__(detail)
