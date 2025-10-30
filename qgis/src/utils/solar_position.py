from astral import LocationInfo
from astral.sun import azimuth, elevation
from zoneinfo import ZoneInfo

def get_solar_position(lat: float, lon: float, name: str, region: str, timezone: str, dt):
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