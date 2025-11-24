from abc import ABC
import os
import httpx
from src.api.requests import PlacedObjectsRequest
from typing import Optional

class DataProcessingController(ABC):
    """
    Controller that should handle all requests that are made to the 
    QGIS Container (via the api within it)
    """
    QGIS_API_BASE_URL: str = os.getenv('QGIS_URL', 'http://qgis:8000')

    async def update_map_placed_objects(
        self, 
        req: PlacedObjectsRequest,
        session_id: Optional[str] 
    ):
        endpoint = f"{self.QGIS_API_BASE_URL}/pet/update"
        payload = req.model_dump(mode="json")

        async with httpx.AsyncClient(timeout=200.0) as client:
            response = await client.post(endpoint, json=payload, params={"session_id": session_id})
            
        try:
            return response.json()
        except ValueError:
            return response.text
