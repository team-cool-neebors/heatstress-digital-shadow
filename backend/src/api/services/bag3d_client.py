import httpx
from config import get_settings

settings = get_settings()

class Bag3DClient:
    """
    A dedicated client for interacting with the external BAG API.
    Handles configuration, authentication, and request boilerplate.
    """
    def __init__(self):
        self.BASE_URL = settings.BASE_URL
        self.HEADERS = {
            "X-Api-Key": settings.BAG_API_KEY,
            "Accept": "application/hal+json",
            "api-version": "1.0.1",
            "Accept-Crs": "epsg:28992"
        }
        
        self._client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers=self.HEADERS,
            timeout=10.0 
        )

    @property
    def client(self) -> httpx.AsyncClient:
        return self._client
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self._client.aclose()

    async def get_pand(self, bag_id: str) -> httpx.Response:
        """Fetches building (PAND) data."""
        return await self._client.get(f"panden/{bag_id}")
    
    async def get_verblijfsobjecten(self, bag_id: str) -> httpx.Response:
        """Fetches Verblijfsobjecten (VBO) data linked to the PAND."""
        return await self._client.get(f"verblijfsobjecten?pandIdentificatie={bag_id}")