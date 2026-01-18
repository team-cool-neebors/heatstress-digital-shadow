import re
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional

BBOX_REGEX: re.Pattern = re.compile(r"^\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*$")

class ServerRequest(BaseModel):
    """
    Abstract base model for all QGIS server requests. 
    Defines parameters common to most services (WFS, WMS, WCS).
    """
    # Core OGC Parameters
    SERVICE: str = Field(..., description="OGC Service type (e.g., 'WFS', 'WMS').")
    REQUEST: str = Field(..., description="OGC Request type (e.g., 'GetFeature', 'GetMap').")
    VERSION: str = Field('1.1.0', description="OGC Protocol Version.")
    
    # Common Geospatial Parameters
    BBOX: Optional[str] = Field(None, description="Bounding box filter (e.g., 'minX,minY,maxX,maxY').")

    @field_validator('BBOX')
    @classmethod
    def validate_bbox_format(cls, v: Optional[str]) -> Optional[str]:
        if v and not BBOX_REGEX.match(v):
            raise ValueError("Invalid BBOX format. Expected 'minX,minY,maxX,maxY'.")
        return v

    # Allow extra params to be captured in __pydantic_extra__
    model_config = ConfigDict(
        extra='allow',
        exclude_none=True,
        alias_generator=lambda s: s.upper(), 
        populate_by_name=True
    )
