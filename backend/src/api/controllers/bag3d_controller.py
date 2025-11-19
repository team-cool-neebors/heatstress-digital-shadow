from src.api.services.bag3d_service import Bag3DService

class Bag3DController:
    @staticmethod
    async def get(bag_id: str):

        return await Bag3DService.fetch_and_aggregate(bag_id)

