import math
from qgis.core import (
    QgsVectorLayer, QgsField
)
from qgis.PyQt.QtCore import QVariant

def load_zonal_layer(path: str) -> QgsVectorLayer:
    return QgsVectorLayer(path, "zonal_layer", "ogr")

def calculate_wet_bulb_temp(zonal_layer: QgsVectorLayer, t_a_field = "t_a", r_h = 44.0) -> QgsVectorLayer:
    """
    Adds a 'wet_bulb' field to the given vector layer and calculates wet-bulb temperature.
    
    :param QgsVectorLayer zonal_layer: The zonal statistics layer on which the calculation would be performed
    :param str t_a: The field in the zonal layer that contains the air temperature (Ta)
    :param float r_h: The relative humidity value (or constant) used in the calculation (φ)
    """
    if 'wet_bulb' not in [field.name() for field in zonal_layer.fields()]:
        zonal_layer.dataProvider().addAttributes([QgsField('wet_bulb', QVariant.Double)])
        zonal_layer.updateFields()
    
    zonal_layer.startEditing()
    for feature in zonal_layer.getFeatures():
        t_a = feature[t_a_field]
        if t_a is None:
            wet_bulb = None
        else:
            temp_val = t_a
            wet_bulb = (
                temp_val * math.atan(0.151977 * math.sqrt(r_h + 8.313659)) +
                math.atan(temp_val + r_h) -
                math.atan(r_h - 1.676331) +
                0.00391838 * (r_h ** 1.5) * math.atan(0.023101 * r_h) -
                4.686035
            )
        feature['wet_bulb'] = wet_bulb
        zonal_layer.updateFeature(feature)
    
    zonal_layer.commitChanges()
    return zonal_layer