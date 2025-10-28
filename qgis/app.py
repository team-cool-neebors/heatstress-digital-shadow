from fastapi import FastAPI, HTTPException, Query
from commands import RasterCalculatorCommand, QGISCommand
from typing import List 
from objects import TreePoint
from pydantic import BaseModel
import os
from preflight import init_qgis
qgs = init_qgis() 
import processing

app = FastAPI()

class Point(BaseModel):
    x: float
    y: float

class BurnRequest(BaseModel):
    points: List[Point] 

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}

@app.get("/run")
def run_qgis_algorithm():
    try:
        result = processing.run("qgis:rastercalculator", {
            'EXPRESSION': '"bbox@1" * 10',
            'LAYERS': ['/app/data/bbox.tif'],
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

@app.post("/burn-points")
def burn_point_to_raster(req: BurnRequest):
    """
    Create a point, buffer it, and burn it into a raster layer.
    Uses hardcoded test data.
    """
    try:
        import tempfile
        import os
        from qgis.core import (
            QgsVectorLayer, QgsFeature, QgsGeometry, QgsPointXY,
            QgsProject, QgsField, QgsVectorFileWriter, QgsCoordinateReferenceSystem,
            QgsProcessingFeedback
        )
        from qgis.PyQt.QtCore import QVariant
        
        height = 25.5
        buffer_distance = 3
        crs = "EPSG:28992"
        input_raster = "/app/data/bbox-test.tif"
        output_raster = "/app/data/burned_output.tif"

        # Creating a vector layer
        # https://docs.qgis.org/3.40/en/docs/pyqgis_developer_cookbook/vector.html#from-an-instance-of-qgsvectorlayer
        vl = QgsVectorLayer(f"Point?crs={crs}", "temp_point", "memory")
        pr = vl.dataProvider()
        pr.addAttributes([QgsField("value", QVariant.Double)]) # Add Fields
        vl.updateFields() # Tell the vector layer to fetch changes from the provider

        # --- Add all points ---
        for pt in req.points:
            feat = QgsFeature() # Shape + Attribute
            feat.setGeometry(QgsGeometry.fromPointXY(QgsPointXY(pt.x, pt.y)))
            feat.setAttributes([height])
            pr.addFeature(feat)
        vl.updateExtents()

        # Buffer for the point (in order to have actual dimensions)
        buffer_layer_path = os.path.join(tempfile.gettempdir(), "buffered_point.gpkg") 
        processing.run(
            "native:buffer",
            {
                "INPUT": vl,
                "DISTANCE": buffer_distance,
                "SEGMENTS": 16,
                "END_CAP_STYLE": 0,
                "JOIN_STYLE": 0,
                "MITER_LIMIT": 2,
                "DISSOLVE": True,  # Merge overlapping buffers
                "OUTPUT": buffer_layer_path,
            },
        )

        # Rasterize the point into the layer (it's inplace)
        processing.run(
            "gdal:rasterize_over",
            {
                "INPUT": buffer_layer_path,
                "INPUT_RASTER": input_raster,
                "FIELD": "value",
                "ADD": False,
                "EXTRA": "",
                "OPTIONS": "",
            },
            feedback=QgsProcessingFeedback(),
        )

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