from typing import Dict, Any
from .base import QGISCommand

class RasterCalculatorCommand(QGISCommand):
    """
    QGIS Raster Calculator command implementation.
    Parameters example:
    "EXPRESSION": '"a@1" * 10',
    "LAYERS": "/app/data/a.tif",
    "OUTPUT": "/app/data/out.tif"
    """
    
    @property
    def algorithm_id(self) -> str:
        return "qgis:rastercalculator"
    
    def validate_params(self, params: Dict[str, Any]) -> None:
        """
        Validate raster calculator parameters.
        """
        required = ["EXPRESSION", "LAYERS", "OUTPUT"]
        
        for param in required:
            if param not in params:
                raise ValueError(f"Missing required parameter: {param}")
        
        if not isinstance(params["EXPRESSION"], str):
            raise ValueError("EXPRESSION must be a string")
        
        if not isinstance(params["LAYERS"], str):
            raise ValueError("LAYERS must be a string")
