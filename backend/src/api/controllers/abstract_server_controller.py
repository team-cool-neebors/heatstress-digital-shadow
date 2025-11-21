from abc import ABC
from fastapi import Response
from src.api.exceptions import QgisServerException
from src.api.requests import ServerRequest
import httpx
import os
import re

class AbstractServerController(ABC):
    """
    Base class for all controllers that proxy requests to the QGIS Server.
    Handles shared configuration and the generic HTTP request logic.
    """
    # Shared Configuration
    QGIS_SERVER_BASE_URL: str = os.getenv('QGIS_SERVER_URL', 'http://nginx/nginx')
    QGIS_TIMEOUT: float = 30.0
    TARGET_CRS: str = "EPSG:28992"
    BBOX_REGEX: re.Pattern = re.compile(r"^\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*$")

    async def get_resource(self, request_data: ServerRequest, path: str = '') -> Response:
        """
        Makes an asynchronous GET request to the QGIS Server using the
        parameters derived from any ServerRequest model.
        """
        
        # Pydantic model_dump handles all model fields, excluding None values
        params_dict = request_data.model_dump(
            exclude_none=True,
            by_alias=True
        )
        
        # Add extra params from the model's catch-all
        if request_data.__pydantic_extra__:
             params_dict.update(request_data.__pydantic_extra__)
        
        full_url = f"{self.QGIS_SERVER_BASE_URL}{path}"
        
        async with httpx.AsyncClient() as client:
            try:
                qgis_response = await client.get(full_url, params=params_dict, timeout=self.QGIS_TIMEOUT)
                qgis_response.raise_for_status()
                
                content_type = qgis_response.headers.get('Content-Type', 'application/json')
                
                return Response(content=qgis_response.content, media_type=content_type)
            except httpx.TimeoutException:
                raise QgisServerException(status_code=504, detail="QGIS Server request timed out.")
            except httpx.HTTPStatusError as e:
                # Centralized error handling
                raise QgisServerException(
                    status_code=500,
                    detail=f"QGIS WFS error: {e.response.status_code} - See logs for details.",
                    log_message=f"QGIS Server Error ({e.response.status_code}): {e.response.text}"
                )
            except Exception as e:
                raise QgisServerException(
                    status_code=500,
                    detail=f"Server connection error: {e.__class__.__name__}",
                    log_message=f"General Server connection error: {e}"
                )
