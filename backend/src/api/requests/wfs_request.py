from pydantic import Field
from src.api.requests import ServerRequest

class WFSRequest(ServerRequest):
    """
    Model for WFS requests. Defines WFS-specific fields and sets WFS defaults.
    """
    SERVICE: str = "WFS"
    REQUEST: str = "GetFeature"
    SRSNAME: str = "EPSG:28992"
    OUTPUTFORMAT: str = "application/json"

    # WFS specific fields
    TYPENAME: str = Field(..., description="The name of the feature type (layer) to fetch.")
