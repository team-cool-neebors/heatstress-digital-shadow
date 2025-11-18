from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

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
    SRSNAME: Optional[str] = Field('EPSG:28992', description="Target Spatial Reference System.")
    OUTPUTFORMAT: Optional[str] = Field(None, description="The desired output format.")
    
    # Catch-all for any other custom or specific parameters not explicitly defined
    __pydantic_extra__: Dict[str, Any] = {}

    class Config:
        extra = 'allow' # Allows unknown fields to be stored in __pydantic_extra__
        exclude_none = True # Ensure None values are not included in the output dictionary
