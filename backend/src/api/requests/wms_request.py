from typing import Optional
from pydantic import Field
from src.api.requests import ServerRequest

class WMSRequest(ServerRequest):
    """
    Model for WMS requests. Defines WMS-specific fields and sets WMS defaults.
    """
    # Override defaults from ServerRequest
    SERVICE: str = "WMS"
    REQUEST: str = "GetMap"
    
    # WMS-specific fields
    LAYERS: str = Field(..., description="Comma-separated list of layer names.")
    WIDTH: Optional[int] = Field(None, description="Image width in pixels.")
    HEIGHT: Optional[int] = Field(None, description="Image height in pixels.")
    BBOX: Optional[str] = Field(None, description="Bounding box filter.")
    FORMAT: Optional[str] = Field('image/png', description="Output image format.")
