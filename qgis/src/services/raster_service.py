import os
import tempfile
from qgis.core import (
    QgsVectorLayer, QgsRasterLayer, QgsFeature, QgsGeometry, QgsPointXY,
    QgsField, QgsProcessingFeedback
)
from qgis.PyQt.QtCore import QVariant
from typing import List
from src.api.models import Point

def load_raster_layer(path: str, layer: str) -> QgsRasterLayer:
    return QgsRasterLayer(path, layer)

def burn_points_to_raster(raster: str, points: List[Point], crs="EPSG:28992", height=15, buffer_distance = 3) -> str:
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

def rasterize_vector_layer(
    vector_layer: QgsVectorLayer,
    attribute_field: str,
    output_path: str,
    resolution: float = 1.0,
    no_data_value: float = 0.0,
) -> QgsRasterLayer:
    """
    Rasterizes a vector layer based on a specific attribute field using georeferenced units.

    :param QgsVectorLayer vector_layer: Input vector layer to rasterize.
    :param str attribute_field: The attribute field whose values will be burned into the raster.
    :param str output_path: Path to the output raster (e.g., '/tmp/output.tif').
    :param float resolution: The raster resolution in georeferenced units
    :param float no_data_value: Value for pixels with no data.
    :return: The rasterized layer as a QgsRasterLayer.
    :rtype: QgsRasterLayer
    """
    import processing

    feedback = QgsProcessingFeedback()

    # Define raster extent and resolution in georeferenced units
    params = {
        'INPUT': vector_layer,
        'FIELD': attribute_field,
        'BURN': 1, #  Source trust me (ui qgis)
        'USE_Z': False,
        'UNITS': 1,  # 1 = Georeferenced units (map units)
        'WIDTH': resolution,
        'HEIGHT': resolution,
        'EXTENT': vector_layer.extent(),
        'NODATA': no_data_value,
        'DATA_TYPE': 5,  # Float32
        'OUTPUT': output_path
    }

    result = processing.run("gdal:rasterize", params, feedback=feedback)
    raster_layer = QgsRasterLayer(result['OUTPUT'], os.path.basename(output_path))

    if not raster_layer.isValid():
        raise Exception(f"Rasterization failed — could not load output: {output_path}")

    return raster_layer

def clip_raster_by_extent(
    input_raster: QgsRasterLayer,
    reference_raster: QgsRasterLayer,
    output_path: str,
    no_data_value: float = 0,
    crop_to_cutline: bool = True
) -> QgsRasterLayer:
    """
    Clips the first raster by the extent of the second raster.

    :param QgsRasterLayer input_raster: The raster to be clipped.
    :param QgsRasterLayer reference_raster: The raster whose extent will be used for clipping.
    :param str output_path: The path for the clipped output raster (e.g., '/tmp/clipped.tif').
    :param float no_data_value: Optional no-data value to assign to empty areas.
    :param bool crop_to_cutline: Whether to crop tightly to the reference extent.
    :return: The clipped raster layer.
    :rtype: QgsRasterLayer
    """
    import processing

    feedback = QgsProcessingFeedback()
    
    extent = reference_raster.extent()
    extent_str = f"{extent.xMinimum()},{extent.xMaximum()},{extent.yMinimum()},{extent.yMaximum()}"

    params = {
        'INPUT': input_raster,
        'PROJWIN': extent_str,
        'NODATA': no_data_value,
        'OPTIONS': '',
        'DATA_TYPE': 0,  # same as input
        'OUTPUT': output_path
    }

    result = processing.run("gdal:cliprasterbyextent", params, feedback=feedback)
    
    clipped_raster = QgsRasterLayer(result['OUTPUT'], os.path.basename(output_path))
    
    if not clipped_raster.isValid():
        raise Exception("Raster clipping failed — could not load output raster.")
    
    return clipped_raster