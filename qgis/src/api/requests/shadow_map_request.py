from pydantic import BaseModel
from datetime import datetime

class ShadowMapRequest(BaseModel):
    dem_path:   str
    start_dt:   datetime
    end_dt:     datetime