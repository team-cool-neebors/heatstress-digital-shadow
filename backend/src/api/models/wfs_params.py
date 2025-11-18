from pydantic import BaseModel, Field

class WFSParams(BaseModel):
    """Model for WFS GetFeature query parameters."""
    bbox: str = Field(
        None,
        description="Bounding box for spatial filtering (minX, minY, maxX, maxY) in EPSG:28992."
    )
