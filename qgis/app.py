from fastapi import FastAPI, HTTPException
from src.api.requests import BurnRequest
from src.services.raster_service import burn_points_to_raster
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