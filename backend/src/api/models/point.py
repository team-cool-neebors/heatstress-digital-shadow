from pydantic import BaseModel
from enum import Enum

class Geometry(Enum): 
    Circle = 'circle'

class Point(BaseModel):
    x: float
    y: float
    height: float
    radius: float
    geometry: Geometry
