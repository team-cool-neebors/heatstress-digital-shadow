from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import subprocess
import json

class QGISCommand(ABC):
    """
    Abstract base class for QGIS processing commands.
    Each command should inherit from this class and implement the required methods.
    """
    
    def __init__(self):
        self.qgis_process_bin = "qgis_process"
    
    @property
    @abstractmethod
    def algorithm_id(self) -> str:
        """
        Return the QGIS algorithm identifier (e.g., 'qgis:rastercalculator')
        """
        pass
    
    @abstractmethod
    def validate_params(self, params: Dict[str, Any]) -> None:
        """
        Validate the parameters before execution.
        Raise ValueError if validation fails.
        """
        pass
    
    def build_command(self, params: Dict[str, Any]) -> list:
        """
        Build the qgis_process command list.
        """
        cmd = [self.qgis_process_bin, "run", self.algorithm_id, "--json"]        
        for key, value in params.items():
            cmd.append(f"--{key}={value}")
        
        return cmd
    
    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the QGIS command with the given parameters.
        """
        self.validate_params(params)
        
        cmd = self.build_command(params)
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise RuntimeError(f"QGIS command failed: {result.stderr}")
        
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse QGIS output: {e}")
