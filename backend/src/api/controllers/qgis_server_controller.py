from fastapi import APIRouter, HTTPException, Query, Response
from src.api.exceptions import QgisServerException
import httpx
import os
import re

QGIS_SERVER_BASE_URL = os.getenv('QGIS_SERVER_URL', 'http://nginx/')
QGIS_TIMEOUT = 30.0
QGIS_LAYER_NAME = "trees"
TARGET_CRS = "EPSG:28992"
BBOX_REGEX = re.compile(r"^\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*,\s*[-+]?\d+(\.\d+)?\s*$")

async def get_resource(params: dict, path: str = '') -> Response:
    """Makes an asynchronous GET request to the QGIS Server."""
    full_url = f"{QGIS_SERVER_BASE_URL}{path}"
    print(full_url)
    
    async with httpx.AsyncClient() as client:
        try:
            qgis_response = await client.get(full_url, params=params, timeout=QGIS_TIMEOUT)
            qgis_response.raise_for_status() 
            return Response(content=qgis_response.text, media_type="application/json")
        except httpx.TimeoutException:
            raise QgisServerException(status_code=504, detail="QGIS Server request timed out.")
        except httpx.HTTPStatusError as e:
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

router = APIRouter()

@router.get("/trees")
async def get_tree_features(
    bbox: str = Query(None, description="Bounding box for spatial filtering (minX, minY, maxX, maxY) in EPSG:28992.")
):
    """
    Fetches tree features using BBOX filter from the QGIS Server WFS.
    """
    
    wfs_params = {
        'SERVICE': 'WFS',
        'VERSION': '1.1.0',
        'REQUEST': 'GetFeature',
        'TYPENAME': QGIS_LAYER_NAME,
        'OUTPUTFORMAT': 'application/json',
    }
    
    if bbox:
        if not BBOX_REGEX.match(bbox):
            raise ValueError("Invalid BBOX format. Expected 'minX,minY,maxX,maxY'.")
        
        wfs_params['BBOX'] = f"{bbox},{TARGET_CRS}"

    return await get_resource(params=wfs_params)
