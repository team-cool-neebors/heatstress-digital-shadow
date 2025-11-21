from fastapi import Request, Response
import httpx

from src.api.exceptions import QgisServerException
from src.settings import QGIS_WMS_BASE_URL


class WMSController:
    def __init__(self, base_url: str = QGIS_WMS_BASE_URL):
        self.base_url = base_url

    async def proxy(self, request: Request) -> Response:
        """
        Proxies any WMS request (GetMap, GetFeatureInfo, etc.)
        to the QGIS server, preserving query parameters.
        """
        query_string = request.url.query

        if query_string:
            upstream_url = f"{self.base_url}?{query_string}"
        else:
            upstream_url = self.base_url

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                upstream_response = await client.get(upstream_url)
        except httpx.HTTPError as exc:
            raise QgisServerException(
                status_code=502,
                detail=f"Failed to contact QGIS WMS server: {exc}",
                log_message=str(exc),
            )

        headers = {}
        content_type = upstream_response.headers.get("content-type")
        if content_type:
            headers["content-type"] = content_type

        return Response(
            content=upstream_response.content,
            status_code=upstream_response.status_code,
            headers=headers,
        )
