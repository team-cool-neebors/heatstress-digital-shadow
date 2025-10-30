r"""
Run GDAL Hillshade from a standalone Python script using QGIS.
AKA Running the shadow map generation script


To increase  your chances of succeeding (or to even get it running) please run
the file via the python.bat file in QGIS. If you have not altered it's default installation 
directory your path should be C:\Program Files\QGIS 3.40.10\bin\python-qgis-ltr.bat.
Therefore your entire command (via cmd or something) should be

"C:\Program Files\QGIS 3.40.10\bin\python-qgis-ltr.bat" hillshade.py
"""
def generate_hillshade_stand_alone(input_path, output_path, azimuth, altitude):
    import sys
    from qgis.core import QgsApplication, QgsProcessingFeedback

    # Input output config!
    input_tif = input_path
    output_tif = output_path

    # 1. Configure QGIS path (adjust if your install is elsewhere)
    QgsApplication.setPrefixPath(
        r"C:\Program Files\QGIS 3.40.10\apps\qgis-ltr", True
    )

    # 2. Start QGIS (headless)
    app = QgsApplication([], False)
    app.initQgis()

    # 3. The processing hack! Add the QGIS plugins folder so Python can find "processing" (stupid)
    # Thank you to that one person https://gis.stackexchange.com/questions/390628/run-qgis-script-without-going-through-qgis
    sys.path.append(
        r"C:\Program Files\QGIS 3.40.10\apps\qgis-ltr\python\plugins"
    )

    from processing.core.Processing import Processing #import this to actually add the processing
    Processing.initialize() # initializing it
    import processing # actually importing it
    from processing.algs.gdal.GdalAlgorithmProvider import GdalAlgorithmProvider # just so you can import this as well

    params = {
        "INPUT": input_tif,
        "Z_FACTOR": 1.0,
        "AZIMUTH": azimuth,
        "ALTITUDE": altitude,
        "COMBINED": False,
        "MULTIDIRECTIONAL": False,
        "OUTPUT": output_tif,
    }

    # 4. Running the algorithm for shadow generation
    feedback = QgsProcessingFeedback()

    result = processing.run("gdal:hillshade", params, feedback=feedback)
    print("Hillshade saved to:", result["OUTPUT"])

    # 5. Doei doei allemaal
    app.exitQgis()


def generate_hillshade_maps(input_path, output_folder, lat, lon, start_dt, end_dt):
    import sys
    from datetime import datetime, timedelta
    from src.utils.solar_position import get_solar_position
    from qgis.core import QgsApplication, QgsProcessingFeedback
    import os

    input_tif = input_path

    # 1. Configure QGIS path (adjust if your install is elsewhere)
    QgsApplication.setPrefixPath(
        r"C:\Program Files\QGIS 3.40.10\apps\qgis-ltr", True
    )

    # 2. Start QGIS (headless)
    app = QgsApplication([], False)
    app.initQgis()

    # 3. The processing hack! Add the QGIS plugins folder so Python can find "processing" (stupid)
    # Thank you to that one person https://gis.stackexchange.com/questions/390628/run-qgis-script-without-going-through-qgis
    sys.path.append(
        r"C:\Program Files\QGIS 3.40.10\apps\qgis-ltr\python\plugins"
    )

    from processing.core.Processing import Processing #import this to actually add the processing
    Processing.initialize() # initializing it
    import processing # actually importing it
    from processing.algs.gdal.GdalAlgorithmProvider import GdalAlgorithmProvider # just so you can import this as well


    current_dt = start_dt
    while current_dt <= end_dt:
        az, alt = get_solar_position(lat, lon, "Middelburg", "Netherlands", "Europe/Amsterdam", current_dt)
        print(f"{current_dt}: Azimuth={az:.2f}, Altitude={alt:.2f}")

        hour_str = current_dt.strftime("%Y%m%d_%H%M")
        out_path = os.path.join(output_folder, f"hillshade_{hour_str}.tif")

        params = {
            "INPUT": input_tif,
            "Z_FACTOR": 1.0,
            "AZIMUTH": az,
            "ALTITUDE": alt,
            "COMBINED": False,
            "MULTIDIRECTIONAL": False,
            "OUTPUT": out_path,
        }
        feedback = QgsProcessingFeedback()
        result = processing.run("gdal:hillshade", params, feedback=feedback)
        print(f"Hillshade saved: {out_path}")

        current_dt += timedelta(hours=1)

    # 5. Doei doei allemaal
    app.exitQgis()
