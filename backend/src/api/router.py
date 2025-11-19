from fastapi import APIRouter, Depends
from src.api.controllers import WFSController
from src.api.models import WFSParams
from src.api.requests import PlacedObjectsRequest

wfs_controller = WFSController()
api_router = APIRouter()

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
