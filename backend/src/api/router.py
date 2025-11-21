from fastapi import APIRouter, Depends, Path
from src.api.controllers import WFSController
from src.api.models import WFSParams
from src.api.services import Metadata3DBagService, get_metadata_bag3d_service
from src.api.models import AggregatedBagResponse
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


metadata_3dbag_router = APIRouter() 

@metadata_3dbag_router.get("/{bag_id}", response_model=AggregatedBagResponse)
# check if building id is 16 length (standard for bag)
async def read_3dbag(
    bag_id: str = Path(
        min_length=16,
        max_length=16,
        regex="^\d{16}$", 
        description="The 16-digit BAG ID"),

    service: Metadata3DBagService = Depends(get_metadata_bag3d_service),
    ):

    return await service.fetch_and_aggregate(bag_id)
@api_router.post("/update-pet")
async def update_pet_map_based_on_objects(req: PlacedObjectsRequest):
    
