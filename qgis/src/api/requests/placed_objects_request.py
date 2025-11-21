from pydantic import BaseModel
from typing import List
from src.api.models.point import Point

class PlacedObjectsRequest(BaseModel):
    points: List[Point]