from fastapi import FastAPI, HTTPException
from commands import RasterCalculatorCommand, QGISCommand
import os

app = FastAPI()

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}

@app.get("/run")
def run_qgis_algorithm():
    """
    Example:
    POST /run
    {
      "alg": "qgis:rastercalculator",
      "params": {
          "EXPRESSION": "A@1 + B@1",
          "LAYERS": "A=/data/a.tif;B=/data/b.tif",
          "OUTPUT": "/data/out.tif"
      }
    }
    """
    try:
        command = RasterCalculatorCommand()
        params = {
            "EXPRESSION": '"middelburg-section@1" * 10',
            "LAYERS": "/app/data/middelburg-section.tif",
            "OUTPUT": "/app/data/out.tif"
        }
        
        result = command.execute(params)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
