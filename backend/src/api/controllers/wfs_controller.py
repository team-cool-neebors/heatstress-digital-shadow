from fastapi import HTTPException, Response
from src.api.controllers import AbstractServerController
from src.api.models import WFSParams
from src.api.requests import (
    ServerRequest,
    WFSRequest,
)
from typing import Optional

class WFSController(AbstractServerController):
    """
    Controller specialized for WFS GetFeature requests (e.g., fetching GeoJSON).
    """
    
    async def get_features(self, type: str, params: WFSParams, session_id: Optional[str]) -> Response:
        """
        Constructs the necessary WFS ServerRequest based on user input and fetches the data.
        """
        
        bbox_param: Optional[str] = None
        
        if params.bbox:
            if not self.BBOX_REGEX.match(params.bbox):
                raise HTTPException(status_code=422, detail="Invalid BBOX format. Expected 'minX,minY,maxX,maxY'.")
            
            bbox_param = f"{params.bbox},{self.TARGET_CRS}" 
            
        wfs_request = WFSRequest(
            TYPENAME=type,  # The requested layer name
            BBOX=bbox_param,
            SRSNAME=self.TARGET_CRS,
            OUTPUTFORMAT='application/json',
        )
        
        return await self.get_resource(request_data=wfs_request, session_id=session_id)
