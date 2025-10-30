"""
Run astral to calculate the azimuth and the elevation of the sun on a specific datetime and location
NOTE: To use astral you need to install it via the pip integration of QGIS, e.g.

"C:\Program Files\QGIS 3.40.10\bin\python-qgis-ltr.bat" -m pip astral -v
"""

def get_solar_position(lat: float, lon: float, name: str, region: str, timezone: str, dt):
    from astral import LocationInfo
    from astral.sun import azimuth, elevation
    from zoneinfo import ZoneInfo

    city = LocationInfo(
        name=name,
        region=region,
        timezone=timezone,
        latitude=lat,
        longitude=lon,
    )
 
    tz = ZoneInfo(city.timezone)
    dt = dt.replace(tzinfo=tz)
    az = azimuth(city.observer, dt)
    alt = elevation(city.observer, dt)

    return az, alt