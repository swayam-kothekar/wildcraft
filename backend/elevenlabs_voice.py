import os
import httpx
import base64

class ElevenLabsSurvivalVoice:
    """
    Interfaces with ElevenLabs for hands-free audio narration of bushcraft instructions,
    survival safety warnings, and step-by-step knot tying.
    """
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        # Default to George (pre-made voice supported on both Free and Paid tiers)
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")

    async def generate_speech(self, text: str) -> dict:
        if self.api_key:
            try:
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": self.api_key
                }
                payload = {
                    "text": text,
                    "model_id": "eleven_flash_v2_5",
                    "voice_settings": { "stability": 0.75, "similarity_boost": 0.85 }
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code == 200:
                        audio_b64 = base64.b64encode(res.content).decode("utf-8")
                        return {
                            "status": "success",
                            "provider": "ElevenLabs AI Survival Voice Engine",
                            "audio_url": f"data:audio/mp3;base64,{audio_b64}",
                            "character_count": len(text)
                        }
                    else:
                        print(f"[WildCraft] ElevenLabs returned HTTP {res.status_code}: {res.text[:120]}")
            except Exception as e:
                print(f"[WildCraft] ElevenLabs API exception: {e}")

        return {
            "status": "fallback",
            "provider": "ElevenLabs Voice Stream (Native Audio Synthesizer)",
            "text": text,
            "character_count": len(text)
        }

elevenlabs_voice = ElevenLabsSurvivalVoice()
