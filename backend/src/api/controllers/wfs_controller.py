from fastapi import Response
from src.api.controllers import AbstractServerController
from src.api.models import WFSParams
from src.api.requests import WFSRequest

class WFSController(AbstractServerController):
    """
    Controller specialized for WFS GetFeature requests (e.g., fetching GeoJSON).
    """
    
    async def get_features(
            self,
            type: str,
            params: WFSParams
        ) -> Response:
        """
        Constructs the necessary WFS ServerRequest based on user input and fetches the data.
        """
            
        wfs_request = WFSRequest(
            TYPENAME=type,  # The requested layer name
            BBOX=params.BBOX,
        )

        return await self.get_resource(
            request_data=wfs_request,
            session_id="starting-map",
            path="wfs"
        )
