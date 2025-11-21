from abc import ABC
from fastapi import Cookie, Response
from typing import Optional
from src.api.session import create_session

class SessionController(ABC):
    """
    Controller that should handle all session related functions
    """
    async def get_or_create_session(
        self,
        response: Response,
        session_id: Optional[str] = Cookie(default=None)
    ) -> str:
        """Return existing session_id or create a new one."""
        if session_id:
            return session_id

        new_id = create_session()

        response.set_cookie(
            key="session_id",
            value=new_id,
            httponly=True,
            secure=False,  # http
            samesite="Lax",
            path="/"
        )

        return new_id
