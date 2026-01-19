from qgis.core import QgsProject, QgsRasterLayer

def update_pet_layer_in_project(project_path: str, new_raster_path: str, base_name:str, style_path: str='/data/server/new-default.qml'):
    project = QgsProject.instance()
    
    if not project.read(project_path):
        raise RuntimeError("Unable to read QGIS project")

    for layer_id, layer in list(project.mapLayers().items()):
        if "pet" in layer.name().lower():
            project.removeMapLayer(layer_id)

    new_layer = QgsRasterLayer(new_raster_path, base_name, "gdal")
    if not new_layer.isValid():
        raise RuntimeError("New PET raster layer is invalid")

    new_layer.setName("pet-version-1")
    
    new_layer.loadNamedStyle(style_path)
    new_layer.triggerRepaint()
    
    project.addMapLayer(new_layer)

    if not project.write(project_path):
        raise RuntimeError("Unable to write QGIS project file")
