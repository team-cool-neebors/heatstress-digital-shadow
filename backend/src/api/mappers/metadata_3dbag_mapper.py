from src.api.models import PandData, VboData, RecordMetadata, BAGPolygon
from src.api.exceptions import MappingError
from pydantic import ValidationError

class Metadata3DBagMapper:
    """
    Maps raw BAG API JSON data to structured Pydantic models.
    """
    @staticmethod 
    def map_pand_data(raw_data):
        try:
            pand_data = raw_data.get('pand', raw_data)
            occurrence_data = pand_data.get('voorkomen', {})

            structured_recorddata = {
                    "registration_time": occurrence_data.get('tijdstipRegistratie'), 
                    "version": str(occurrence_data.get('versie')) if occurrence_data.get('versie') is not None else None,
                    "validity_start_date": occurrence_data.get('beginGeldigheid'),
                    "validity_end_date": occurrence_data.get('eindGeldigheid'),
                    "inactivity_time": occurrence_data.get('tijdstipInactief'),
                }
            
            geometry_data = pand_data.get("geometrie")
            
            structured_data = {
                "bag_object_type": "PAND",
                "bag_id": pand_data.get('identificatie'),
                "construction_year": pand_data.get('oorspronkelijkBouwjaar'),
                "status": pand_data.get('status'),
                "is_notified_to_bag": pand_data.get('geconstateerd'),
                "document_date": pand_data.get('documentdatum'),                    
                "document_number": pand_data.get('documentnummer'),
                "record_metadata": RecordMetadata(**structured_recorddata),
                "geometry": BAGPolygon(**geometry_data) if geometry_data else None
            }
            
            return PandData(**structured_data)
        
        except ValidationError as e:
            raise MappingError(f"Invalid PAND structure: {e.errors()}")
        
    @staticmethod
    def map_vbo_data(raw_data):
        try:
            embedded = raw_data.get('_embedded', {})
            vbo_list = embedded.get('verblijfsobjecten', [])
            
            if not vbo_list:
                return []
        
            structured_vbos = []
            
            for vbo_item in vbo_list:
                vbo_data = vbo_item.get('verblijfsobject', vbo_item)
    
                structured_data = {
                    "bag_object_type": "VBO",
                    "bag_id": vbo_data.get('identificatie'),
                    "usage_function": vbo_data.get('gebruiksdoelen'),
                    "surface_area_m2": vbo_data.get('oppervlakte'),
                    "status": vbo_data.get('status'),
                }
                
                structured_vbos.append(VboData(**structured_data))
        
            return structured_vbos
        
        except ValidationError as e:
            raise MappingError(f"Invalid VBO structure: {e.errors()}")
            