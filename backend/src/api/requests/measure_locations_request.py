from pydantic import BaseModel, Field

class MeasureLocationsRequest(BaseModel):
    id: int = Field(..., description="ID of the placed measure.")
    x: float = Field(..., description="X-coordinate (longitude) of the measure.")
    y: float = Field(..., description="Y-coordinate (latitude) of the measure.")
