import httpx
import asyncio
import json
from fastapi import HTTPException
from pydantic import ValidationError
from src.api.models import PandData, VboData, RecordMetadata
from src.api.services.bag3d_client import Bag3DClient



class Bag3DService:

    @staticmethod
    def _structure_pand_data(raw_data):
        pand_data = raw_data.get('pand', raw_data)
        occurrence_data = pand_data.get('voorkomen', {})

        structured_recorddata = {
                "registration_time": occurrence_data.get('tijdstipRegistratie'), 
                "version": str(occurrence_data.get('versie')) if occurrence_data.get('versie') is not None else None,
                "validity_start_date": occurrence_data.get('beginGeldigheid'),
                "validity_end_date": occurrence_data.get('eindGeldigheid'),
                "inactivity_time": occurrence_data.get('tijdstipInactief'),
            }
        
        structured_data = {
            "bag_object_type": "PAND",
            "bag_id": pand_data.get('identificatie'),
            "construction_year": pand_data.get('oorspronkelijkBouwjaar'),
            "status": pand_data.get('status'),
            "is_notified_to_bag": pand_data.get('geconstateerd'),
            "document_date": pand_data.get('documentdatum'),                    
            "document_number": pand_data.get('documentnummer'),
            "record_metadata": RecordMetadata(**structured_recorddata)
        }
        
        return PandData(**structured_data)

    @staticmethod
    def _structure_vbo_data(raw_data):
        embedded = raw_data.get('_embedded', {})
        vbo_list = embedded.get('verblijfsobjecten', [])
        
        if not vbo_list:
            return []
    
        structured_vbos = []
        
        for vbo_item in vbo_list:
            vbo_data = vbo_item.get('verblijfsobject', vbo_item)

            structured_data = {
                "bag_object_type": "VBO",
                "bag_id": vbo_data.get('identificatie'),
                "usage_function": vbo_data.get('gebruiksdoelen'),
                "surface_area_m2": vbo_data.get('oppervlakte'),
            }
            
            structured_vbos.append(VboData(**structured_data))
    
        return structured_vbos

    
    @staticmethod
    async def fetch_and_aggregate(bag_id: str):
        """
        Asynchronously fetches and aggregates Pand and Verblijfsobjecten (VBO) data 
        from the external BAG API for a given building ID.
        """

        async with Bag3DClient() as bag3d_api_client:

            # endpoints
            pand_task = bag3d_api_client.get_pand(bag_id)
            vbo_task = bag3d_api_client.get_verblijfsobjecten(bag_id)

            try:
                pand_response, vbo_response = await asyncio.gather(pand_task, vbo_task)
            
                pand_response.raise_for_status()
                vbo_response.raise_for_status()
                
                raw_pand_data = pand_response.json()
                raw_vbo_data = vbo_response.json()
                

            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code

                if status_code >= 400 and status_code < 500:
                    raise HTTPException(
                        status_code=404, 
                        detail=f"BAG data not found or ID is invalid: {bag_id} (Upstream code: {status_code})"
                    )
                
                if status_code >= 500:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"External BAG API server error: {e}"
                    )
                
                raise HTTPException(
                    status_code=500, 
                    detail=f"External BAG API returned unexpected code {status_code}: {e}"
                )
            
            except httpx.RequestError as e:
                # Handle network/connection errors (DNS, timeouts)
                raise HTTPException(status_code=503, detail=f"Failed to connect to external BAG API: {e}")
            
            except json.JSONDecodeError as e:
                # Handle external API returning non-JSON content
                raise HTTPException(
                    status_code=500, 
                    detail=f"External BAG API returned invalid JSON content: {e}"
                )
        

        # structuring
        try:
            structured_pand_data = Bag3DService._structure_pand_data(raw_pand_data)
            structured_vbo_data = Bag3DService._structure_vbo_data(raw_vbo_data)
            
            aggregated_data = {
                "bag_id": bag_id,
                "pand_data": structured_pand_data,
                "verblijfsobject_data": structured_vbo_data,
            }

        except (ValidationError, KeyError) as e:

            raise HTTPException(
                status_code=500, 
                detail=f"Internal data structuring failed for BAG ID {bag_id}: {e}"
            )
        
        return aggregated_data
    
