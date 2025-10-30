import os
import tempfile
from qgis.core import (
    QgsVectorLayer, QgsFeature, QgsGeometry, QgsPointXY,
    QgsField, QgsProcessingFeedback
)
from qgis.PyQt.QtCore import QVariant
from typing import List
from src.api.models import Point

def burn_points_to_raster(raster, points: List[Point], crs="EPSG:28992", height=15, buffer_distance = 3) -> str:
    import processing

    # Creating a vector layer
    # https://docs.qgis.org/3.40/en/docs/pyqgis_developer_cookbook/vector.html#from-an-instance-of-qgsvectorlayer
    vl = QgsVectorLayer(f"Point?crs={crs}", "temp_point", "memory")
    pr = vl.dataProvider()
    pr.addAttributes([QgsField("value", QVariant.Double)]) # Add Fields
    vl.updateFields() # Tell the vector layer to fetch changes from the provider

    # --- Add all points ---
    for pt in points:
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
            "INPUT_RASTER": raster,
            "FIELD": "value",
            "ADD": False,
            "EXTRA": "",
            "OPTIONS": "",
        },
        feedback=QgsProcessingFeedback(),
    )

    return raster