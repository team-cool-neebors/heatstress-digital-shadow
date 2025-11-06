from fastapi import APIRouter
from src.services.pet_service import PETService
from src.services.raster_service import RasterService
from src.services.geojson_service import GeoJSONService

router = APIRouter()
pet_service = PETService()
raster_service = RasterService()
geojson_service = GeoJSONService()

@router.get("/u")
def get_geschaalde_u():
    u = "/app/data/json/wind_reduction copy.geojson"
    vector = pet_service.load_zonal_layer(u)
    geojson_service.calculate_wind_speed_1_2(vector)
    

@router.get("/uhi-zone")
def get_uhi_zone():
    uhi = "/app/data/uhi/uhi-air-temp-u-1.2 copy.geojson"
    output = "/app/data/uhi/raster_pet_shadow.tif"
    ref_path = "/app/data/bbox-dsm.tif"

    reference = raster_service.load_raster_layer(ref_path, "bbox-dm")
    vector = pet_service.load_zonal_layer(uhi)
    obj = pet_service.calculate_wet_bulb_temp(vector, "air_mean")

    obj = pet_service.calculate_zonal_part_pet_sun(obj, "air_mean", "t_w", "geschaalde_u_1.2_corr")
    result = raster_service.rasterize_vector_layer(obj, "pet_sun_partial", output)
    raster_service.clip_raster_by_extent(result, reference, "/app/data/uhi/sun-bbox.tif")

    obj = pet_service.calculate_zonal_part_pet_shadow(vector, "air_mean", "t_w", "geschaalde_u_1.2_corr")
    result = raster_service.rasterize_vector_layer(obj, "pet_shadow_partial", output)
    raster_service.clip_raster_by_extent(result, reference, "/app/data/uhi/shadow-bbox.tif")

    raster_service.rasterize_vector_layer(obj, "air_mean", "/app/data/uhi/t_a.tif")

    pet_service.calculate_total_pet_sun(
        "/app/data/uhi/sun-bbox.tif",
        "/app/data/raster/br-reproject.tif",
        "/app/data/raster/svf-reproject.tif",
        "/app/data/uhi/sun-pet.tif",
    )
    pet_service.calculate_total_pet_shadow(
        "/app/data/uhi/shadow-bbox.tif",
        "/app/data/raster/svf-reproject.tif",
        "/app/data/uhi/t_a.tif",
        "/app/data/uhi/shadow-pet.tif",
    )

    return {"status": "success"}
