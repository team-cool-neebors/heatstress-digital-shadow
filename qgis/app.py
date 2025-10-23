from fastapi import FastAPI, HTTPException
from commands import RasterCalculatorCommand, QGISCommand
from objects import TreePoint
import os
from preflight import init_qgis
qgs = init_qgis() 
import processing

app = FastAPI()

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}

@app.get("/run")
def run_qgis_algorithm():
    try:
        result = processing.run("qgis:rastercalculator", {
            'EXPRESSION': '"middelburg-section@1" * 10',
            'LAYERS': ['/app/data/middelburg-section.tif'],
            'OUTPUT': '/app/data/out.tif'
        })
            
        return {
            "status": "success",
            "result": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
