# 🌲 WildCraft AI — Offline Wilderness Survival & Bushcraft Whisperer

> **Hacktoberfest Challenge Entry**: *Touch Grass*  
> **Built with Open-Weight AI at its Core**: Google Gemma 2, Prior Labs TabPFN, ElevenLabs, MongoDB Atlas, SerpApi, and Vercel / Cloud Run.

---

## 🍃 Why Open Innovation Matters for WildCraft AI

Deep backcountry mountain canyons, dense forests, and alpine wilderness trails have **zero cellular reception or internet signal**. Closed proprietary cloud APIs are completely useless when you step off the grid into nature.

**WildCraft AI** brings open-weight AI and tabular foundation intelligence directly onto the trail:
1. **Offline On-Device Backcountry Execution**: Runs quantized **Google Gemma 2B/7B** open-weight models locally on edge devices with 0 cell towers or cloud servers required.
2. **Complete Data Privacy**: Your hiker trek logs, emergency SOS check-ins, and exact GPS coordinates remain strictly under your control.
3. **Zero Running Cost**: 100% open-source software stack that costs $0 to run in the wild.
4. **Model Freedom**: Fine-tune or customize Gemma weights as a wilderness paramedic, bushcraft instructor, or plant safety expert.

---

## 🎧 Touch Grass Philosophy: Hands-Free Wilderness Intelligence

When pitching a shelter, carving a friction fire bow drill, tying knots, or filtering river water, your hands are dirty and busy in nature!

**WildCraft keeps the screen to a minimum**:
- **Hands-Free Audio Narrator**: Spoken step-by-step instructions via **ElevenLabs**. Put your phone in your pocket, listen through headphones, and stay focused on your outdoor tasks.
- **High-Visibility Outdoor Sunlight Mode**: Converts the UI to high-contrast yellow/black (`#ffea00` / `#000000`) for direct sunlight visibility or emergency SOS situations.

---

## 🏆 Partner Category Breakdown

### Featured Prize Categories
- **Google Gemma (`Best Use of Gemma`)**: Open-weight model engine providing step-by-step bushcraft skills, knot-tying, shelter blueprints, and 0-signal offline backcountry execution.
- **Prior Labs TabPFN (`Best Use of TabPFN`)**: Prior Labs' tabular foundation model predicts **Hypothermia / Heat Stroke Risk Index (0-100)**, **Water Deficit**, and **Sweat Loss Rate** from trek tabular inputs (elevation, ambient temp °C, humidity %, wind speed, trek hours, water consumed).

### Partner Solutions
- **MongoDB Atlas (`Best Use of MongoDB Atlas`)**: Cloud database cluster storing plant safety & toxicity RAG catalogs and persisting backcountry field logbooks as long-term agent memory.
- **ElevenLabs (`Best Use of ElevenLabs`)**: Converts Gemma survival guides into realistic voice audio narration for hands-free, screen-free bushcraft instruction.
- **SerpApi (`Best Use of SerpApi`)**: Real-time web search grounding for live park ranger advisories, wildfire warnings, and flash flood alerts.

---

## 🚀 Quick Start

### 1. Backend Setup (FastAPI + Gemma Agent)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start Backend API
python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
