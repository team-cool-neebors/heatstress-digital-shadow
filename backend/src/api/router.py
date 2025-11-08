from fastapi import APIRouter
from src.api.controllers import qgis_server_controller

api_router = APIRouter()

api_router.include_router(qgis_server_controller.router, tags=["QGIS Server"])
