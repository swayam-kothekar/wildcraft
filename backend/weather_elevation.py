import httpx

class OpenMeteoWildernessWeather:
    """
    Fetches real-time weather & elevation for backcountry coordinates via Open-Meteo API.
    """
    async def get_wilderness_conditions(self, lat: float, lon: float) -> dict:
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,surface_pressure"
            elev_url = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}"

            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                elev_res = await client.get(elev_url)

                data = res.json().get("current", {})
                elev_data = elev_res.json()
                elevation = elev_data.get("elevation", [1400])[0] if isinstance(elev_data.get("elevation"), list) else 1400

                temp = data.get("temperature_2m", 8.0)
                humidity = data.get("relative_humidity_2m", 65.0)
                wind_speed = data.get("wind_speed_10m", 15.0)

                return {
                    "status": "live",
                    "latitude": lat,
                    "longitude": lon,
                    "elevation_m": float(elevation),
                    "ambient_temp_c": float(temp),
                    "relative_humidity_pct": float(humidity),
                    "wind_speed_kmh": float(wind_speed)
                }
        except Exception as e:
            print(f"Wilderness weather error: {e}")

        return {
            "status": "fallback",
            "latitude": lat,
            "longitude": lon,
            "elevation_m": 1650.0,
            "ambient_temp_c": 6.5,
            "relative_humidity_pct": 72.0,
            "wind_speed_kmh": 22.0
        }

wilderness_weather = OpenMeteoWildernessWeather()
