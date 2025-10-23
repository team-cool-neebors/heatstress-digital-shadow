from pydantic import BaseModel

class TreePoint(BaseModel):
    x: float
    y: float
    height: float
    buffer_distance: float
    crs: str = "EPSG:4326"