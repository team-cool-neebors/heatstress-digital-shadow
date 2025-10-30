from fastapi import FastAPI, HTTPException
import json

from src.api.requests import BurnRequest
from src.services.raster_service import burn_points_to_raster
from src.services.pet_service import calculate_wet_bulb_temp, load_zonal_layer, calculate_zonal_part_pet_sun
from src.configs.preflight import init_qgis
qgs = init_qgis() 
app = FastAPI()

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}

@app.post("/burn-points")
def burn_point_to_raster(req: BurnRequest):
    """
    Create a point, buffer it, and burn it into a raster layer.
    Uses hardcoded input raster
    """
    try:
        input_raster = "/app/data/bbox-test.tif"
        burn_points_to_raster(input_raster, req.points)

        return {
            "status": "success",
            "message": f"Burned {len(req.points)} point(s) into raster.",
            "params": {
                "points": [p.dict() for p in req.points]
            },
            "output": input_raster,
        }
                    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
@app.get("/uhi-zone")
def get_uhi_zone():
    try:
        uhi = "/app/data/uhi/uhi-air-temp-u-1.2 copy.geojson"
        vector = load_zonal_layer(uhi)
        obj = calculate_wet_bulb_temp(vector, "air_mean")
        obj = calculate_zonal_part_pet_sun(obj, "air_mean", "t_w", "geschaalde_u_1.2_corr")
        
        return {
            "status": "success",
            "response": json.dumps(obj, default=lambda o: o.__dict__),
            "output": uhi,
        }
                    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")