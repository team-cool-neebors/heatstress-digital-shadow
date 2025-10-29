import sys
from qgis.core import QgsApplication
from qgis.analysis import QgsNativeAlgorithms

def init_qgis(prefix_path: str = "/usr"):
    """Initialize QGIS and its Processing framework."""
    if QgsApplication.instance() is not None:
        return QgsApplication.instance()

    QgsApplication.setPrefixPath(prefix_path, True)

    qgs = QgsApplication([], False)
    qgs.initQgis()

    sys.path.append(f"{prefix_path}/share/qgis/python/plugins")
    import processing
    from processing.core.Processing import Processing
    Processing.initialize()

    QgsApplication.processingRegistry().addProvider(QgsNativeAlgorithms())

    print("✅ QGIS environment initialized.")
    return qgs