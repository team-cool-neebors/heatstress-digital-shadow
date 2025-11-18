from fastapi import APIRouter
from src.api.requests import PlacedObjectsRequest
from src.services.raster_service import RasterService

router = APIRouter()
raster_service = RasterService()

@router.post("/points")
def burn_point_to_raster(req: PlacedObjectsRequest):
    input_raster = "/app/data/bbox-test.tif"
    raster_service.burn_points_to_raster(input_raster, req.points)

    return {
        "status": "success",
        "message": f"Burned {len(req.points)} point(s) into raster.",
        "params": {"points": [p.dict() for p in req.points]},
        "output": input_raster,
    }

@router.get('/clean')
def clean_raster(): 
    input_raster = "/app/data/bbox-dsm.tif"
    input_raster = raster_service.load_raster_layer(input_raster, "bbox-dsm")
    raster_service.fill_nodata_gdal(input_raster, '/app/data/cleaned.tif')