from fastapi import Response
from src.api.controllers import AbstractServerController
from src.api.models import WMSParams
from src.api.requests import WMSRequest

class WMSController(AbstractServerController):
    """
    Controller speialized for WMS requests (GetMap, GetFeatureInfo, etc.).
    """

    async def get_wms(
        self,
        params: WMSParams,
        session_id: str = "starting-map"
    ) -> Response:
        """
        Constructs the necessary WMS ServerRequest based on user input and fetches the data.
        """
        
        wms_request = WMSRequest(
            **params.model_dump(exclude_none=True)   
        )

        return await self.get_resource(
            request_data=wms_request,
            session_id=session_id,
            path="wms"
        )
