from abc import ABC
import os
import httpx
from src.api.requests import PlacedObjectsRequest

class DataProcessingController(ABC):
    """
    Controller that should handle all requests that are made to the 
    QGIS Container (via the api within it)
    """
    QGIS_API_BASE_URL: str = os.getenv('QGIS_SERVER_URL', 'http://qgis/')

    async def update_map_placed_objects(self, req: PlacedObjectsRequest):
        endpoint = f"{self.QGIS_API_BASE_URL}/update"
        payload = req.model_dump()

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, json=payload)
