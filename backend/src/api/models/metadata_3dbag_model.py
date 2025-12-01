from pydantic import BaseModel
from typing import Optional, List

class BAGPolygon(BaseModel):
    type: str  
    coordinates: List[List[List[float]]]

class RecordMetadata(BaseModel):
    registration_time: Optional[str]
    version: Optional[str]
    validity_start_date: Optional[str]
    validity_end_date: Optional[str]
    inactivity_time: Optional[str]

class PandData(BaseModel):
    bag_object_type: str
    bag_id: str
    construction_year: Optional[int]
    status: Optional[str]
    is_notified_to_bag: Optional[bool]
    document_date: Optional[str]
    document_number: Optional[str]
    record_metadata: RecordMetadata
    geometry: BAGPolygon

class VboData(BaseModel):
    bag_object_type: str
    bag_id: str
    usage_function: Optional[List[str]]
    surface_area_m2: Optional[int]
    status: str

class AggregatedBagResponse(BaseModel):
    bag_id: str
    pand_data: PandData
    verblijfsobject_data: List[VboData]
