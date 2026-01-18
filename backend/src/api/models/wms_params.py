from pydantic import BaseModel, Field
from typing import Optional

class WMSParams(BaseModel):
    """Model for WMS query parameters."""
    REQUEST: str = Field(
        ...,
        description="WMS request type (e.g., 'GetMap', 'GetFeatureInfo')."
    )
    LAYERS: str = Field(
        ...,
        description="Comma-separated list of layer names to be rendered."
    )
    BBOX: str = Field(
        None,
        description="Bounding box for spatial filtering (minX, minY, maxX, maxY)."
    )
    QUERY_LAYERS: Optional[str] = Field(
        None,
        description="Comma-separated list of layer names to query for feature info."
    )
    FORMAT: str = Field(
        "image/png",
        description="Format of the image to be returned."
    )
    WIDTH: int = Field(
        256,
        description="Width of the requested image in pixels."
    )
    HEIGHT: int = Field(
        256,
        description="Height of the requested image in pixels."
    )
    STYLES: str = Field(
        "default",
        description="Comma-separated list of styles to be applied to the layers."
    )
    TRANSPARENT: bool = Field(
        True,
        description="Whether the background of the image should be transparent."
    )
    INFO_FORMAT: str = Field(
        "application/json",
        description="Format of the feature info to be returned."
    )
    I: Optional[int] = Field(
        None,
        description="Pixel column coordinate for GetFeatureInfo requests."
    )
    J: Optional[int] = Field(
        None,
        description="Pixel row coordinate for GetFeatureInfo requests."
    )
