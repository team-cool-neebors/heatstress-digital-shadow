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
    field_name = "t_w"
    if field_name not in [field.name() for field in zonal_layer.fields()]:
        zonal_layer.dataProvider().addAttributes([QgsField(field_name, QVariant.Double)])
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
        feature[field_name] = wet_bulb
        zonal_layer.updateFeature(feature)
    
    zonal_layer.commitChanges()
    return zonal_layer

def calculate_zonal_part_pet_sun(
    zonal_layer: QgsVectorLayer,
    t_a_field: str = "t_a",
    t_w_field: str = "t_w",
    u_field: str = "u",
    phi: float = 44.0,
    q_gl: float = 663.0,
) -> QgsVectorLayer:
    """
    Adds a 'pet_sun_partial' field to the given vector layer and calculates the PET sun temperature.
    
    :param QgsVectorLayer zonal_layer: The zonal statistics layer on which the calculation would be performed
    :param str t_a: The field in the zonal layer that contains the air temperature (Ta)
    :param str t_w: The field in the zonal layer that contains the wet bulb temperature (Tw)
    :param str u: The field in the zonal layer that contains the wind speed at 1.2 m height(U)
    :param float phi: The sun angle used in the calculation (φ)
    :param flaot q_gl: The global radiation taken by KNMI (Qgl)
    """
    field_name = "pet_sun_partial"
    if field_name not in [field.name() for field in zonal_layer.fields()]:
        zonal_layer.dataProvider().addAttributes([QgsField(field_name, QVariant.Double)])
        zonal_layer.updateFields()
    
    zonal_layer.startEditing()
    for feature in zonal_layer.getFeatures():
        t_a = feature[t_a_field]
        t_w = feature[t_w_field]
        u = feature[u_field]
        if t_a is None or t_w is None or u is None:
            pet_sun_partial = None
        else:
            pet_sun_partial = (
                -13.26 + 1.25 * t_a + 0.011 * q_gl - 3.37 * math.log(u) +
                0.0055 * q_gl * math.log(u) + 5.56 * math.sin(phi) - 0.0103 * q_gl * math.log(u) * math.sin(phi)
            )
        feature[field_name] = pet_sun_partial
        zonal_layer.updateFeature(feature)
    
    zonal_layer.commitChanges()
    return zonal_layer

def calculate_zonal_part_pet_shadow(
    zonal_layer: QgsVectorLayer,
    t_a_field: str = "t_a",
    t_w_field: str = "t_w",
    u_field: str = "u",
) -> QgsVectorLayer:
    """
    Adds a 'pet_shadow_partial' field to the given vector layer and calculates the PET shadow temperature.
    
    :param QgsVectorLayer zonal_layer: The zonal statistics layer on which the calculation would be performed
    :param str t_a: The field in the zonal layer that contains the air temperature (Ta)
    :param str t_w: The field in the zonal layer that contains the wet bulb temperature (Tw)
    :param str u: The field in the zonal layer that contains the wind speed at 1.2 m height(U)
    """
    field_name = "pet_shadow_partial"
    if field_name not in [field.name() for field in zonal_layer.fields()]:
        zonal_layer.dataProvider().addAttributes([QgsField(field_name, QVariant.Double)])
        zonal_layer.updateFields()
    
    zonal_layer.startEditing()
    for feature in zonal_layer.getFeatures():
        t_a = feature[t_a_field]
        t_w = feature[t_w_field]
        u = feature[u_field]
        if t_a is None or t_w is None or u is None:
            pet_shadow_partial = None
        else:
            pet_shadow_partial = (
                -12.14 + 1.25 * t_a - 1.47 * math.log(u) + 0.060 * t_w   
            )
        feature[field_name] = pet_shadow_partial
        zonal_layer.updateFeature(feature)
    
    zonal_layer.commitChanges()
    return zonal_layer
    
    
    