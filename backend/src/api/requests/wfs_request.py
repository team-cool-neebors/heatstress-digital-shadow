from typing import Optional
from pydantic import Field
from src.api.requests import ServerRequest

class WFSRequest(ServerRequest):
    """
    Model for WFS requests. Defines WFS-specific fields and sets WFS defaults.
    """
    # Override defaults from ServerRequest
    SERVICE: str = "WFS"
    REQUEST: str = "GetFeature"

    # WFS-specific fields
    TYPENAME: str = Field(..., description="The name of the feature type (layer) to fetch.")
    BBOX: Optional[str] = Field(None, description="Bounding box filter (e.g., 'minX,minY,maxX,maxY,CRS').")
