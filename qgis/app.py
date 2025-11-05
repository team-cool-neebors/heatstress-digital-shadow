from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from src.configs.preflight import init_qgis
from src.api.router import api_router

qgs = init_qgis() 
app = FastAPI()

@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    """Handles 400 Bad Request for Validation Errors."""
    return JSONResponse(
        status_code=400,
        content={"detail": f"Validation error: {str(exc)}"},
    )

@app.exception_handler(RuntimeError)
async def runtime_error_exception_handler(request: Request, exc: RuntimeError):
    """Handles 500 Internal Server Error for Runtime Errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

@app.exception_handler(Exception)
async def unexpected_exception_handler(request: Request, exc: Exception):
    """Handles 500 Internal Server Error for all other Unexpected Errors."""
    print(f"Unhandled Exception: {exc}") 
    return JSONResponse(
        status_code=500,
        content={"detail": f"Unexpected error: {str(exc)}"},
    )

app.include_router(api_router)

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}
