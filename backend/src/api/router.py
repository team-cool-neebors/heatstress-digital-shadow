from fastapi import APIRouter, Depends, Response, Cookie
from typing import Optional

from src.api.controllers import WFSController, DataProcessingController, SessionController
from src.api.models import WFSParams
from src.api.requests import PlacedObjectsRequest

wfs_controller = WFSController()
dpc_controller = DataProcessingController()
session_controller = SessionController()

api_router = APIRouter()


@api_router.get("/objects/{type}")
async def get_objects_by_type(
    type: str,
    params: WFSParams = Depends(),
):
    return await wfs_controller.get_features(
        type=type,
        params=params,
    )


@api_router.post("/update-pet")
async def update_pet_map_based_on_objects(
    req: PlacedObjectsRequest,
    session_id: Optional[str] = Cookie(default=None),
):
    return await dpc_controller.update_map_placed_objects(req, session_id)


@api_router.get("/session/init")
async def get_session(
    response: Response,
    session_id: Optional[str] = Cookie(default=None)
):
    return await session_controller.get_or_create_session(
        response=response,
        session_id=session_id,
    )
