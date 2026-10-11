import httpx

class OpenMeteoWildernessWeather:
    """
    Fetches real-time weather & elevation for backcountry coordinates via Open-Meteo API,
    with automatic fallback to wttr.in if cloud provider IPs are challenged.
    """
    async def get_wilderness_conditions(self, lat: float, lon: float) -> dict:
        headers = {
            "User-Agent": "WildCraft-AI/1.0 (wilderness-safety-telemetry)"
        }

        # 1. Primary: Open-Meteo
        try:
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,surface_pressure"
            elev_url = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}"

            async with httpx.AsyncClient(timeout=6.0, headers=headers) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    json_data = res.json()
                    current = json_data.get("current")
                    if current and "temperature_2m" in current:
                        temp = float(current["temperature_2m"])
                        humidity = float(current.get("relative_humidity_2m", 60.0))
                        wind = float(current.get("wind_speed_10m", 12.0))

                        # Fetch elevation
                        elev_m = 50.0
                        try:
                            elev_res = await client.get(elev_url)
                            if elev_res.status_code == 200:
                                edata = elev_res.json()
                                raw_elev = edata.get("elevation")
                                if isinstance(raw_elev, list) and len(raw_elev) > 0:
                                    elev_m = float(raw_elev[0])
                        except Exception:
                            pass

                        return {
                            "status": "live",
                            "provider": "Open-Meteo",
                            "latitude": lat,
                            "longitude": lon,
                            "elevation_m": elev_m,
                            "ambient_temp_c": temp,
                            "temperature_c": temp,
                            "relative_humidity_pct": humidity,
                            "wind_speed_kmh": wind
                        }
                    else:
                        print(f"Open-Meteo missing 'current' field: {json_data}")
                else:
                    print(f"Open-Meteo HTTP {res.status_code}: {res.text}")
        except Exception as e:
            print(f"Open-Meteo error on backend: {e}")

        # 2. Secondary fallback: wttr.in (CORS & cloud-friendly)
        try:
            wttr_url = f"https://wttr.in/{lat},{lon}?format=j1"
            async with httpx.AsyncClient(timeout=5.0, headers=headers) as client:
                wres = await client.get(wttr_url)
                if wres.status_code == 200:
                    wdata = wres.json()
                    conds = wdata.get("current_condition", [])
                    if conds:
                        c = conds[0]
                        temp = float(c.get("temp_C", 20.0))
                        humidity = float(c.get("humidity", 60.0))
                        wind = float(c.get("windspeedKmph", 12.0))
                        return {
                            "status": "live",
                            "provider": "wttr.in",
                            "latitude": lat,
                            "longitude": lon,
                            "elevation_m": 50.0,
                            "ambient_temp_c": temp,
                            "temperature_c": temp,
                            "relative_humidity_pct": humidity,
                            "wind_speed_kmh": wind
                        }
        except Exception as e:
            print(f"wttr.in fallback error: {e}")

        # 3. Final safety fallback
        return {
            "status": "fallback",
            "provider": "offline_baseline",
            "latitude": lat,
            "longitude": lon,
            "elevation_m": 1200.0,
            "ambient_temp_c": 18.0,
            "temperature_c": 18.0,
            "relative_humidity_pct": 65.0,
            "wind_speed_kmh": 15.0
        }

wilderness_weather = OpenMeteoWildernessWeather()
