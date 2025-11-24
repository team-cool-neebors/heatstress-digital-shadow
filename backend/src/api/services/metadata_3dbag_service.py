import httpx
import asyncio
import json
from fastapi import HTTPException
from src.api.services.metadata_3dbag_client import get_metadata_bag3d_client
from src.api.mappers.metadata_3dbag_mapper import Metadata3DBagMapper
from src.api.models.metadata_3dbag_model import AggregatedBagResponse
from src.api.exceptions import MappingError

class Metadata3DBagService:

    def __init__(self, api_client_factory, data_mapper: Metadata3DBagMapper):
        """
        Store the api_client and the data_mapper as dependencies
        """
        self._api_client_factory = api_client_factory
        self._mapper = data_mapper
    
    def _handle_bag_api_exceptions(self, e: Exception, bag_id: str):
        """
        Helper to map external BAG API exceptions (httpx errors) 
        to FastAPI HTTPExceptions.
        """

        if isinstance(e, httpx.HTTPStatusError):
            status_code = e.response.status_code
            
            if 400 <= status_code < 500:
                # 4xx errors (Not Found, Bad Request) 
                raise HTTPException(
                    status_code=404, 
                    detail=f"BAG data not found or ID is invalid: {bag_id} (Upstream code: {status_code})"
                )
            
            if status_code >= 500:
                # 5xx errors (Server Error) 
                raise HTTPException(
                    status_code=500, 
                    detail=f"External BAG API server error: {e}"
                )
            
            # Catch-all for unexpected status codes 
            raise HTTPException(
                status_code=500, 
                detail=f"External BAG API returned unexpected code {status_code}: {e}"
            )

        # Handle Network/Connection Errors (DNS, timeouts)
        elif isinstance(e, httpx.RequestError):
            raise HTTPException(
                status_code=503, 
                detail=f"Failed to connect to external BAG API: {e}"
            )

        # Handle JSON Decoding Errors (non-JSON response)
        elif isinstance(e, json.JSONDecodeError):
            raise HTTPException(
                status_code=500, 
                detail=f"External BAG API returned invalid JSON content: {e}"
            )
        
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"An unexpected error occurred during API call for ID {bag_id}: {e.__class__.__name__}"
            )
    

    async def fetch_and_aggregate(self, bag_id: str) -> AggregatedBagResponse:
        """
        Asynchronously fetches and aggregates Pand and VBO data 
        from the external BAG API for a given bag ID.
        """
        async with self._api_client_factory() as api_client: 
            pand_task = api_client.get_pand(bag_id)
            vbo_task = api_client.get_verblijfsobjecten(bag_id)

            responses = await asyncio.gather(pand_task, vbo_task, return_exceptions=True)
            pand_response, vbo_response = responses

            for resp in responses:
                if isinstance(resp, Exception):
                    self._handle_bag_api_exceptions(resp, bag_id)
            
            try:
                pand_response.raise_for_status()
                vbo_response.raise_for_status()

            except httpx.HTTPStatusError as e:
                self._handle_bag_api_exceptions(e, bag_id)
            
            raw_pand_data = pand_response.json()
            raw_vbo_data = vbo_response.json()
        
            try:
                structured_pand_data = self._mapper.map_pand_data(raw_pand_data)
                structured_vbo_data = self._mapper.map_vbo_data(raw_vbo_data)

            except MappingError as e:
                raise HTTPException(status_code=500, detail=f"Internal data structuring failed for BAG ID {bag_id}: {str(e)}")
        
        aggregated_data = {
            "bag_id": bag_id,
            "pand_data": structured_pand_data,
            "verblijfsobject_data": structured_vbo_data,
        }

        return AggregatedBagResponse(**aggregated_data)
    

    
def get_metadata_bag3d_service() -> Metadata3DBagService:
    """Factory function for FastAPI dependency injection."""
    mapper = Metadata3DBagMapper()
    return Metadata3DBagService(
        api_client_factory=get_metadata_bag3d_client,
        data_mapper=mapper
    )
        