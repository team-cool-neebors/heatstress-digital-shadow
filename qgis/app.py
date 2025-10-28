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

@app.get("/burn-point-to-raster")
def burn_point_to_raster():
    """
    Create a point, buffer it, and burn it into a raster layer.
    Uses hardcoded test data.
    """
    try:
        import tempfile
        from qgis.core import (
            QgsVectorLayer, QgsFeature, QgsGeometry, QgsPointXY,
            QgsProject, QgsField, QgsVectorFileWriter, QgsCoordinateReferenceSystem,
            QgsRasterLayer
        )
        from qgis.PyQt.QtCore import QVariant
        import processing
        
        # Hardcoded parameters
        x = 3.5896
        y = 51.4427
        height = 25.5
        buffer_distance = 100
        crs = "EPSG:28992"
        input_raster = "/app/data/middelburg-section.tif"
        output_raster = "/app/data/burned_output.tif"

        # Create temporary files for intermediate steps
        temp_point = tempfile.NamedTemporaryFile(suffix='.gpkg', delete=False).name
        temp_buffer = tempfile.NamedTemporaryFile(suffix='.gpkg', delete=False).name
        temp_burned = tempfile.NamedTemporaryFile(suffix='.tif', delete=False).name
        
        try:
            # Load input raster to get extent and resolution
            raster = QgsRasterLayer(input_raster, "input_raster")
            extent = raster.extent()
            pixel_size_x = raster.rasterUnitsPerPixelX()
            pixel_size_y = raster.rasterUnitsPerPixelY()
            
            # 1. Create point layer
            point_layer = QgsVectorLayer(f"Point?crs={crs}", "point", "memory")
            provider = point_layer.dataProvider()
            
            # Add height attribute
            provider.addAttributes([QgsField("height", QVariant.Double)])
            point_layer.updateFields()
            
            # Create point feature
            feature = QgsFeature()
            feature.setGeometry(QgsGeometry.fromPointXY(QgsPointXY(x, y)))
            feature.setAttributes([height])
            provider.addFeatures([feature])
            
            # Save point layer
            QgsVectorFileWriter.writeAsVectorFormat(
                point_layer, temp_point, "UTF-8", 
                QgsCoordinateReferenceSystem(crs), "GPKG"
            )
            
            # 2. Create buffer
            buffer_result = processing.run("native:buffer", {
                'INPUT': temp_point,
                'DISTANCE': buffer_distance,
                'SEGMENTS': 32,
                'END_CAP_STYLE': 0,
                'JOIN_STYLE': 0,
                'MITER_LIMIT': 2,
                'DISSOLVE': False,
                'OUTPUT': temp_buffer
            })
            
            # 3. Burn vector into raster (matching input raster dimensions)
            burn_result = processing.run("gdal:rasterize", {
                'INPUT': temp_buffer,
                'FIELD': 'height',
                'BURN': 0,
                'USE_Z': False,
                'UNITS': 1,
                'WIDTH': raster.width(),
                'HEIGHT': raster.height(),
                'EXTENT': f'{extent.xMinimum()},{extent.xMaximum()},{extent.yMinimum()},{extent.yMaximum()} [{crs}]',
                'NODATA': 0,
                'OPTIONS': '',
                'DATA_TYPE': 5,  # Float32
                'INIT': None,
                'INVERT': False,
                'EXTRA': '',
                'OUTPUT': temp_burned,
                'X_RES': 1,
                'Y_RES': 1
            })
            
            # 4. Merge with original raster using raster calculator
            # Add the burned values to the original raster
            calc_result = processing.run("qgis:rastercalculator", {
                'EXPRESSION': f'"{os.path.basename(input_raster).replace(".tif", "")}@1" + "{os.path.basename(temp_burned).replace(".tif", "")}@1"',
                'LAYERS': [input_raster, temp_burned],
                'OUTPUT': output_raster
            })
            
            return {
                "status": "success",
                "message": "Point buffered and burned to raster",
                "output": output_raster,
                "point": {"x": x, "y": y, "height": height},
                "buffer_distance": buffer_distance,
                "raster_dimensions": {
                    "width": raster.width(),
                    "height": raster.height(),
                    "extent": extent.asWktPolygon()
                }
            }
            
        finally:
            # Cleanup temporary files
            for temp_file in [temp_point, temp_buffer, temp_burned]:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")