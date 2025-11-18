from fastapi import APIRouter
from src.services.pet_service import PETService
from src.services.raster_service import RasterService
from src.services.shadow_service import ShadowService
from src.services.geojson_service import GeoJSONService
from datetime import datetime, timedelta

router = APIRouter()
pet_service = PETService()
raster_service = RasterService()
shadow_service = ShadowService()
geojson_service = GeoJSONService()

@router.get("/full-map-generation")
def get_uhi_zone():
    uhi = "/app/data/json/wind_reduction copy.geojson"
    ref_path = "/app/data/dsm.TIF"
    bowen_ratio = "/app/data/raster/br-reproject.tif"
    svf = "/app/data/raster/svf-reproject.tif"

    reference = raster_service.load_raster_layer(ref_path, "dsm")
    vector = pet_service.load_zonal_layer(uhi)
    
    obj = geojson_service.calculate_wind_speed_1_2(vector) 
    obj = pet_service.calculate_zonal_uhi(obj, bowen_ratio, svf)
    obj = pet_service.calculate_t_a_temperature(obj)
    obj = pet_service.calculate_wet_bulb_temp(obj)

    obj = pet_service.calculate_zonal_part_pet_sun(obj, "t_a", "t_w", "geschaalde_u_1_2")
    obj = pet_service.calculate_zonal_part_pet_shadow(obj, "t_a", "t_w", "geschaalde_u_1_2")

    result = raster_service.rasterize_vector_layer(obj, "pet_sun_partial", "/app/data/uhi/temp.tif")
    raster_service.clip_raster_by_extent(result, reference, "/app/data/uhi/sun-bbox.tif")

    result = raster_service.rasterize_vector_layer(obj, "pet_shadow_partial", "/app/data/uhi/temp.tif")
    raster_service.clip_raster_by_extent(result, reference, "/app/data/uhi/shadow-bbox.tif")

    raster_service.rasterize_vector_layer(obj, "t_a", "/app/data/uhi/t_a.tif")

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

    output_folder = "/app/data/shadow-maps"
    lat, lon = 51.498, 3.613
    start_dt = datetime(2015, 7, 1, 15, 0, 0)
    end_dt = datetime(2015, 7, 1, 15, 0, 0)

    shadow_service.generate_hillshade_maps(
        ref_path, output_folder, lat, lon, start_dt, end_dt
    )
    
    pet_service.calculate_total_pet_map(
        "/app/data/shadow-maps/hillshade_20150701_1500.tif",
        "/app/data/uhi/sun-pet.tif",
        "/app/data/uhi/shadow-pet.tif",
        "/app/data/pet/pet.tif",
    )
    
    return {
        "status": "success",
        "message": "Map(s) generated successfully",
    }
