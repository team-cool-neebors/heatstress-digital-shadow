from fastapi import FastAPI, HTTPException
import subprocess, json

app = FastAPI()

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QGIS container is alive"}

@app.post("/run")
def run_qgis_algorithm(alg: str, params: dict):
    """
    Example:
    POST /run
    {
      "alg": "qgis:rastercalculator",
      "params": {
          "EXPRESSION": "A@1 + B@1",
          "LAYERS": "A=/data/a.tif;B=/data/b.tif",
          "OUTPUT": "/data/out.tif"
      }
    }
    """
    try:
        cmd = ["qgis_process", "run", alg, "--json"]
        for k, v in params.items():
            cmd.append(f"--{k}={v}")

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=result.stderr)

        return json.loads(result.stdout)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
