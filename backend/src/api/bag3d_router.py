from fastapi import APIRouter, Path
from src.api.controllers import  Bag3DController
from src.api.models import AggregatedBagResponse


bag3d_controller = Bag3DController()
bag3d_router = APIRouter() 

@bag3d_router.get("/{bag_id}", response_model=AggregatedBagResponse)
# check if building id is 16 length (standard for bag)
async def read_3dbag(bag_id: str = Path(
        min_length=16,
        max_length=16,
        regex="^\d{16}$", 
        description="The 16-digit BAG ID"
    )):
    return await bag3d_controller.get(bag_id)
