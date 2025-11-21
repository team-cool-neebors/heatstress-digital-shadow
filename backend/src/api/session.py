import uuid
from pathlib import Path
import shutil

SESSIONS_DIR = Path("/data/server/sessions")

def create_session() -> str:
    """Create a new session folder and return the session ID."""
    session_id = str(uuid.uuid4())
    session_folder = SESSIONS_DIR / session_id
    session_folder.mkdir(parents=True, exist_ok=True)
    
    shutil.copy("/data/server/starting-map.qgz", session_folder / "map.qgz")

    return session_id

def get_session_folder(session_id: str) -> Path:
    """Return the filesystem path for this session."""
    return SESSIONS_DIR / session_id
