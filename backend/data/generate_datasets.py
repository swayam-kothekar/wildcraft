import pandas as pd
import numpy as np
import json
import os

np.random.seed(101)

def generate_survival_tabular_dataset(filename="wildcraft/data/wilderness_survival_tabular.csv", n_samples=400):
    """
    Generates a realistic wilderness survival & human physiological risk tabular dataset for TabPFN.
    Contains weather metrics, clothing insulation, trek duration, and water intake to predict
    hypothermia, heat stroke, and dehydration risk levels.
    """
    elevations = np.random.uniform(100, 3800, n_samples)
    temperatures = np.random.uniform(-18, 42, n_samples)
    humidity = np.random.uniform(15, 95, n_samples)
    wind_speeds = np.random.uniform(0, 75, n_samples)
    trek_hours = np.random.uniform(1.0, 12.0, n_samples)
    water_liters = np.random.uniform(0.3, 5.5, n_samples)
    clothing_clo = np.random.uniform(0.3, 2.8, n_samples)

    # Compute physiological stress score (0 - 100)
    cold_stress = np.maximum(0, 15 - temperatures) * 2.2 + wind_speeds * 0.45 - clothing_clo * 12.0
    heat_stress = np.maximum(0, temperatures - 26) * 2.5 + humidity * 0.25 - (water_liters / np.maximum(0.5, trek_hours)) * 15.0
    dehydration_stress = (trek_hours * 0.4 - water_liters) * 12.0

    raw_risk = np.maximum(0, cold_stress) + np.maximum(0, heat_stress) + np.maximum(0, dehydration_stress)
    raw_risk += np.random.normal(0, 3.0, n_samples)
    risk_score = np.clip(raw_risk, 2, 98).round(1)

    categories = []
    for i in range(n_samples):
        t = temperatures[i]
        r = risk_score[i]
        if r < 25:
            categories.append("Safe / Optimal")
        elif r < 45:
            categories.append("Mild Fatigue Risk")
        elif r < 65 and t > 28:
            categories.append("Moderate Dehydration Risk")
        elif r >= 65 and t <= 10:
            categories.append("Severe Hypothermia Risk")
        elif r >= 65 and t > 32:
            categories.append("Extreme Heat Stroke Risk")
        else:
            categories.append("Elevated Environmental Risk")

    df = pd.DataFrame({
        "elevation_m": elevations.round(1),
        "ambient_temp_c": temperatures.round(1),
        "relative_humidity_pct": humidity.round(1),
        "wind_speed_kmh": wind_speeds.round(1),
        "trek_duration_hours": trek_hours.round(1),
        "water_consumed_liters": water_liters.round(1),
        "clothing_insulation_clo": clothing_clo.round(1),
        "hypothermia_heat_risk_score": risk_score,
        "risk_level_category": categories
    })

    os.makedirs(os.path.dirname(filename), exist_ok=True)
    df.to_csv(filename, index=False)
    print(f"Generated WildCraft TabPFN survival dataset at {filename} with {len(df)} rows.")

def generate_survival_catalog(filename="wildcraft/data/survival_manual_catalog.json"):
    catalog = [
        {
            "id": "plant_blackberry",
            "category": "Edible Plant",
            "name": "Wild Blackberry (Rubus fruticosus)",
            "safety_status": "EDIBLE & SAFE",
            "identification_features": "Compound leaves with 3-5 serrated leaflets, thorny stems, aggregate black berries with no milky sap.",
            "edibility_notes": "Berries are rich in Vitamin C and sugar. Leaves can be steeped into anti-inflammatory tea.",
            "audio_guide": "Wild blackberries have distinct aggregate drupelets. Ensure the vine has no milky latex white sap. All aggregate berries in North America with multiple small beads are edible.",
            "tags": ["plant", "edible", "berry", "foraging"]
        },
        {
            "id": "plant_hemlock",
            "category": "Poisonous Plant",
            "name": "Poison Hemlock (Conium maculatum)",
            "safety_status": "DEADLY POISONOUS",
            "identification_features": "Smooth green stems with distinct purple spots/blotches, lacy fern-like leaves, musty parsnip odor.",
            "edibility_notes": "Contains toxic coniine alkaloids. Ingestion causes respiratory paralysis. DO NOT TOUCH OR EAT.",
            "audio_guide": "WARNING: Poison Hemlock can be mistaken for wild carrot. Look closely at the stem: poison hemlock stems are completely hairless with distinct purple spots. Never consume lacy green umbel plants without 100% positive ID.",
            "tags": ["plant", "toxic", "poisonous", "danger"]
        },
        {
            "id": "shelter_aframe",
            "category": "Bushcraft Shelter",
            "name": "Debris A-Frame Shelter",
            "safety_status": "HYPOTHERMIA PREVENTION",
            "identification_features": "Ridge pole supported by Y-sticks, rib sticks laid at 45 degrees, covered with 3 feet of dry leaves and pine needles.",
            "edibility_notes": "Traps body heat to prevent hypothermia down to freezing temperatures without a fire.",
            "audio_guide": "Find a sturdy ridge pole slightly longer than your body height. Prop one end up 3 feet on a stump or Y-stick. Lean ribs along both sides, then pile dry leaves and pine needles at least waist-deep. The trapped air pockets act as natural insulation.",
            "tags": ["shelter", "bushcraft", "warmth", "survival"]
        },
        {
            "id": "fire_bowdrill",
            "category": "Firecraft",
            "name": "Bow Drill Friction Fire",
            "safety_status": "RESCUE & WARMTH",
            "identification_features": "Spindle, hearth board with V-notch, bow with paracord string, bearing block socket.",
            "edibility_notes": "Generates glowing ember without matches or lighter.",
            "audio_guide": "Carve a notch in your hearth board. Place your spindle into the socket with your bow cord wrapped once around it. Apply steady downward pressure on your hand socket while sawing the bow back and forth until heavy wood smoke billows from the notch.",
            "tags": ["fire", "friction fire", "warmth", "bushcraft"]
        },
        {
            "id": "knot_bowline",
            "category": "Rigging & Knots",
            "name": "The Bowline Knot (King of Knots)",
            "safety_status": "RESCUE & BEAR BAG",
            "identification_features": "Fixed loop at the end of a rope that will not slip under load or jam under high tension.",
            "edibility_notes": "Essential for bear bag hanging, tarp ridge lines, and emergency cliff rescue harnesses.",
            "audio_guide": "Make a small loop in the standing line. Remember the story: The rabbit comes out of the hole, goes around the big tree, and goes back down into the hole. Pull tight to set the knot.",
            "tags": ["knot", "rigging", "rescue", "bushcraft"]
        },
        {
            "id": "water_solarstill",
            "category": "Water Purification",
            "name": "Solar Still & Bio-Sand Filter",
            "safety_status": "DEHYDRATION PREVENTION",
            "identification_features": "3-stage filter made from plastic bottle/bark tube filled with charcoal, sand, and gravel, followed by boiling.",
            "edibility_notes": "Removes sediment, heavy metals, and pathogens from stagnant water sources.",
            "audio_guide": "Layer crushed wood charcoal at the bottom of your filter, followed by fine sand, then coarse gravel on top. Pour murky water through to remove particulate matter, then boil vigorously for at least one minute to kill pathogens.",
            "tags": ["water", "purification", "hydration", "survival"]
        }
    ]

    with open(filename, "w") as f:
        json.dump(catalog, f, indent=2)
    print(f"Generated WildCraft survival manual catalog at {filename} with {len(catalog)} entries.")

if __name__ == "__main__":
    generate_survival_tabular_dataset()
    generate_survival_catalog()
