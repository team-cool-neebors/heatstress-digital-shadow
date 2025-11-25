from fastapi import APIRouter, Depends, Request, Path, Query
from src.api.controllers import WFSController, DataProcessingController, WMSController
from src.api.models import WFSParams
from src.api.services import Metadata3DBagService, get_metadata_bag3d_service
from src.api.models import AggregatedBagResponse
from src.api.requests import PlacedObjectsRequest

wfs_controller = WFSController()
dpc_controller = DataProcessingController()
wms_controller = WMSController()
api_router = APIRouter()
metadata_3dbag_router = APIRouter() 

@api_router.get("/objects/{type}")
async def get_objects_by_type(
    type: str,
    params: WFSParams = Depends()
):
    """
    Fetches object features from the QGIS Server WFS.
    """

    return await wfs_controller.get_features(
        type=type,
        params=params,
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


@api_router.api_route("/qgis/wms", methods=["GET"])
async def proxy_qgis_wms(request: Request):
    """
    Generic WMS proxy. Forwards GetMap / GetFeatureInfo to QGIS WMS.
    """
    return await wms_controller.proxy(request)

@api_router.post("/update-pet")
async def update_pet_map_based_on_objects(req: PlacedObjectsRequest):
    return await dpc_controller.update_map_placed_objects(
        req
    )
