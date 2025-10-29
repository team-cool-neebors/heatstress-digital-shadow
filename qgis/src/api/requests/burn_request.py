from pydantic import BaseModel
from typing import List
from src.api.models.point import Point

class BurnRequest(BaseModel):
    points: List[Point] 