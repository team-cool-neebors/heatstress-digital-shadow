from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from src.api.requests import BurnRequest, ShadowMapRequest
from src.configs.preflight import init_qgis
from src.services import (
    PETService,
    ShadowService,
    RasterService
)
qgs = init_qgis() 
app = FastAPI()
pet_service = PETService()
shadow_service = ShadowService()
raster_service = RasterService()

@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    """Handles 400 Bad Request for Validation Errors."""
    return JSONResponse(
        status_code=400,
        content={"detail": f"Validation error: {str(exc)}"},
    )

@app.exception_handler(RuntimeError)
async def runtime_error_exception_handler(request: Request, exc: RuntimeError):
    """Handles 500 Internal Server Error for Runtime Errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
    """Handles 500 Internal Server Error for all other Unexpected Errors."""
    print(f"Unhandled Exception: {exc}") 
    return JSONResponse(
        status_code=500,
        content={"detail": f"Unexpected error: {str(exc)}"},
    )

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}

@app.post("/burn-points")
def burn_point_to_raster(req: BurnRequest):
    """
    Create a point, buffer it, and burn it into a raster layer.
    Uses hardcoded input raster
    """
    input_raster = "/app/data/bbox-test.tif"
    raster_service.burn_points_to_raster(input_raster, req.points)

    return {
        "status": "success",
        "message": f"Burned {len(req.points)} point(s) into raster.",
        "params": {
            "points": [p.dict() for p in req.points]
        },
        "output": input_raster,
    }
    
@app.get("/uhi-zone")
def get_uhi_zone():
    uhi = "/app/data/uhi/uhi-air-temp-u-1.2 copy.geojson"
    output = "/app/data/uhi/raster_pet_shadow.tif"
    referenceRaster = "/app/data/bbox-dsm.tif"
    referenceRaster = raster_service.load_raster_layer(referenceRaster, "bbox-dm")
    vector = pet_service.load_zonal_layer(uhi)
    obj = pet_service.calculate_wet_bulb_temp(vector, "air_mean")
    
    obj = pet_service.calculate_zonal_part_pet_sun(obj, "air_mean", "t_w", "geschaalde_u_1.2_corr")
    result = raster_service.rasterize_vector_layer(obj, "pet_sun_partial", output)
    raster_service.clip_raster_by_extent(result, referenceRaster, "/app/data/uhi/sun-bbox.tif")
    
    obj = pet_service.calculate_zonal_part_pet_shadow(vector, "air_mean", "t_w", "geschaalde_u_1.2_corr")
    result = raster_service.rasterize_vector_layer(obj, "pet_shadow_partial", output)
    raster_service.clip_raster_by_extent(result, referenceRaster, "/app/data/uhi/shadow-bbox.tif")

    raster_service.rasterize_vector_layer(obj, "air_mean", "/app/data/uhi/t_a.tif")

    pet_service.calculate_total_pet_sun("/app/data/uhi/sun-bbox.tif", "/app/data/raster/br-reproject.tif", "/app/data/raster/svf-reproject.tif", "/app/data/uhi/sun-pet.tif")
    pet_service.calculate_total_pet_shadow("/app/data/uhi/shadow-bbox.tif", "/app/data/raster/svf-reproject.tif",  "/app/data/uhi/t_a.tif", "/app/data/uhi/shadow-pet.tif")

    return {
        "status": "success"
    }


@app.post("/shadow-map")
def create_hillshade(req: ShadowMapRequest):
    try:
        output_folder = "/app/data/shadow-maps"
        lat = 51.498
        lon = 3.613

        shadow_service.generate_hillshade_maps(req.dem_path, output_folder, lat, lon, req.start_dt, req.end_dt)

        return {
            "status": "success",
            "output_folder": output_folder,
            "message": "Hillshade(s) generated successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating hillshade: {str(e)}")