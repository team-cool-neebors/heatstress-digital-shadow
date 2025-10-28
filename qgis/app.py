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

@app.get("/burn-point-to-raster")
def burn_point_to_raster():
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
        
        x = 31942.8
        y = 391691.2
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

        # Add point feature
        point = QgsGeometry.fromPointXY(QgsPointXY(x, y)) # Shape
        feat = QgsFeature() # Shape + Attribute
        feat.setGeometry(point)
        feat.setAttributes([height])
        pr.addFeature(feat) # Add the feature to the provider
        vl.updateExtents() # Recalculate bounding box of all features

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
                "DISSOLVE": False,
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
                    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")