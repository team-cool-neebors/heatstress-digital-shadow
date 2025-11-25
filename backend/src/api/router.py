from fastapi import APIRouter, Depends, Response, Cookie, Request, Query
from typing import Optional
from src.api.controllers import WMSController, DataProcessingController, SessionController, WFSController
from src.api.models import WFSParams
from src.api.services import Metadata3DBagService, get_metadata_bag3d_service, DatabaseService, get_database_service
from src.api.models import AggregatedBagResponse
from src.api.requests import PlacedObjectsRequest

wfs_controller = WFSController()
dpc_controller = DataProcessingController()
session_controller = SessionController()
wms_controller = WMSController()
api_router = APIRouter()
metadata_3dbag_router = APIRouter() 

@api_router.get("/measures")
def get_measures(
    database_service: DatabaseService = Depends(get_database_service)
):
    return database_service.get_measures()

@api_router.get("/objects/{type}")
async def get_objects_by_type(
    type: str,
    params: WFSParams = Depends(),
    session_id: Optional[str] = Cookie(default=None),
):
    return await wfs_controller.get_features(
        type=type,
        params=params,
        session_id=session_id,
    )

@api_router.get("/session/init")
async def get_session(
    response: Response,
    session_id: Optional[str] = Cookie(default=None)
):
    return await session_controller.get_or_create_session(
        response=response,
        session_id=session_id,
    )

@api_router.get("/qgis/wms")
async def proxy_qgis_wms(
    request: Request,
    session_id: Optional[str] = Cookie(default=None)
):
    """
    Generic WMS proxy. Forwards GetMap / GetFeatureInfo to QGIS WMS.
    """
    return await wms_controller.proxy(request, session_id)

@api_router.post("/update-pet")
async def update_pet_map_based_on_objects(
    req: PlacedObjectsRequest,
    session_id: Optional[str] = Cookie(default=None)
):
    return await dpc_controller.update_map_placed_objects(
        req,
        session_id=session_id
    )

@metadata_3dbag_router.get("/search-pand", response_model=AggregatedBagResponse)
async def read_3dbag_by_coordinates(
    x_coord: float = Query(..., description="X coordinate (Rijksdriehoeksstelsel, EPSG:28992)"),
    y_coord: float = Query(..., description="Y coordinate (Rijksdriehoeksstelsel, EPSG:28992)"),

    service: Metadata3DBagService = Depends(get_metadata_bag3d_service),
):
    """
    Searches for the nearest PAND at the given coordinates and returns aggregated data.
    """
    return await service.fetch_and_aggregate(
        x_coord=x_coord, 
        y_coord=y_coord
    )
