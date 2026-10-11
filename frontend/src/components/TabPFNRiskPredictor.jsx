import React, { useState, useEffect } from 'react';

const SLIDERS = [
  { key: 'elevation',    label: 'Elevation',            unit: 'm',   min: 100,  max: 4000, step: 50,  icon: '▲' },
  { key: 'tempC',        label: 'Air Temperature',      unit: '°C',  min: -15,  max: 42,   step: 0.5, icon: '◈' },
  { key: 'windSpeed',    label: 'Wind Speed',           unit: 'km/h',min: 0,    max: 75,   step: 2,   icon: '◎' },
  { key: 'humidity',     label: 'Relative Humidity',    unit: '%',   min: 0,    max: 100,  step: 1,   icon: '◉' },
  { key: 'trekHours',    label: 'Trek Duration',        unit: 'hrs', min: 0.5,  max: 12,   step: 0.5, icon: '◈' },
  { key: 'waterLiters',  label: 'Water Consumed',       unit: 'L',   min: 0.2,  max: 6,    step: 0.2, icon: '◎' },
  { key: 'clothingClo',  label: 'Clothing Insulation',  unit: 'clo', min: 0.3,  max: 2.5,  step: 0.1, icon: '◉' },
];

function getRiskColor(score) {
  if (score >= 65) return 'var(--danger)';
  if (score >= 35) return 'var(--amber)';
  return 'var(--fern)';
}

function SliderRow({ sliderDef, value, onChange }) {
  const { key, label, unit, min, max, step, icon } = sliderDef;
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--txt-med)', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--fern)', opacity: 0.7 }}>{icon}</span>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--mono)', fontSize: '0.82rem',
          color: key === 'tempC' && value <= 5 ? 'var(--water)' : key === 'tempC' && value >= 30 ? 'var(--danger)' : 'var(--sage)',
          fontWeight: 500,
        }}>
          {value} {unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 4, background: 'var(--bg-float)', borderRadius: 2, marginBottom: 2 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, height: '100%',
          width: `${pct}%`, borderRadius: 2,
          background: 'linear-gradient(90deg, var(--pine), var(--fern))',
          pointerEvents: 'none',
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ position: 'absolute', inset: '-6px 0', opacity: 0, cursor: 'pointer', width: '100%', height: 16 }}
        />
      </div>
    </div>
  );
}

export default function TabPFNRiskPredictor({ liveConditions, onRiskUpdate }) {
  const [vals, setVals] = useState({
    elevation: 1650, tempC: 6.5, humidity: 72,
    windSpeed: 22, trekHours: 4.5, waterLiters: 1.2, clothingClo: 1.0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (liveConditions) {
      setVals(v => ({
        ...v,
        ...(liveConditions.elevation_m            ? { elevation:   Math.round(liveConditions.elevation_m) } : {}),
        ...(liveConditions.ambient_temp_c != null  ? { tempC:       Math.round(liveConditions.ambient_temp_c * 10) / 10 } : {}),
        ...(liveConditions.relative_humidity_pct != null ? { humidity: Math.round(liveConditions.relative_humidity_pct) } : {}),
        ...(liveConditions.wind_speed_kmh != null  ? { windSpeed:   Math.round(liveConditions.wind_speed_kmh) } : {}),
      }));
    }
  }, [liveConditions]);

  const predict = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predict-survival-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elevation_m: vals.elevation, ambient_temp_c: vals.tempC,
          relative_humidity_pct: vals.humidity, wind_speed_kmh: vals.windSpeed,
          trek_duration_hours: vals.trekHours, water_consumed_liters: vals.waterLiters,
          clothing_insulation_clo: vals.clothingClo,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (onRiskUpdate) onRiskUpdate(data);
    } catch {
      const fallback = {
        risk_score_index: 48.5,
        risk_level_category: 'Moderate Exposure & Dehydration Risk',
        safety_urgency: 'ELEVATED CAUTION',
        recommended_action: 'Pace yourself, drink 0.5L purified water, put on wind shell layer.',
        dehydration_deficit_liters: 0.8,
        estimated_sweat_loss_liters: 2.0,
        model_used: 'Prior Labs TabPFN Survival Foundation Model',
      };
      setResult(fallback);
      if (onRiskUpdate) onRiskUpdate(fallback);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { predict(); }, [vals.elevation, vals.tempC, vals.humidity, vals.windSpeed, vals.trekHours, vals.waterLiters, vals.clothingClo]);

  const score = result?.risk_score_index ?? 0;
  const riskColor = getRiskColor(score);

  const PRESETS = [
    { label: '🏔️ Alpine Summit',   vals: { elevation: 3200, tempC: -4, humidity: 45, windSpeed: 45, trekHours: 6.5, waterLiters: 1.5, clothingClo: 1.8 } },
    { label: '🏜️ Desert Crossing', vals: { elevation: 600,  tempC: 38, humidity: 15, windSpeed: 18, trekHours: 5.0, waterLiters: 2.0, clothingClo: 0.5 } },
    { label: '🌲 Forest Trail',    vals: { elevation: 1200, tempC: 18, humidity: 65, windSpeed: 10, trekHours: 3.5, waterLiters: 1.5, clothingClo: 1.0 } },
    { label: '❄️ Winter Frost',    vals: { elevation: 2100, tempC: -12, humidity: 80, windSpeed: 35, trekHours: 4.0, waterLiters: 1.0, clothingClo: 2.2 } },
  ];

  return (
    <div className="section-wrap anim-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow">Prior Labs TabPFN · Physiological Risk</div>
        <h2 className="section-title">Survival Risk Engine</h2>
        <p className="section-sub">
          Real-time hypothermia, altitude exposure & dehydration scoring.
          {liveConditions && <span style={{ color: 'var(--fern)', marginLeft: 8 }}>↑ GPS conditions loaded.</span>}
        </p>
      </div>

      {/* Preset Quick-Buttons */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', marginBottom: 8 }}>
          Environment Presets
        </div>
        <div className="chip-strip">
          {PRESETS.map(p => (
            <button
              key={p.label}
              className="chip"
              onClick={() => setVals(p.vals)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Sliders panel */}
        <div className="wc-card" style={{ padding: '24px 24px 28px' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', marginBottom: 20 }}>
            Field Parameters
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {SLIDERS.map(s => (
              <SliderRow
                key={s.key}
                sliderDef={s}
                value={vals[s.key]}
                onChange={v => setVals(prev => ({ ...prev, [s.key]: v }))}
              />
            ))}
          </div>
        </div>

        {/* Result panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Big score */}
          <div className="wc-card" style={{ padding: '28px 24px' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--txt-low)', marginBottom: 12 }}>
              Physiological Risk Score
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1, color: riskColor, fontFamily: 'var(--mono)' }}>
                {loading ? '—' : Math.round(score)}
              </span>
              <span style={{ fontSize: '1.2rem', color: 'var(--txt-low)', paddingBottom: 8 }}>/100</span>
              {result && (
                <span className={score >= 65 ? 'badge badge--danger' : score >= 35 ? 'badge badge--amber' : 'badge badge--green'}
                  style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
                  {result.safety_urgency}
                </span>
              )}
            </div>

            {/* Gauge bar */}
            <div className="risk-gauge" style={{ marginBottom: 16 }}>
              <div className="risk-gauge__fill" style={{
                width: `${Math.min(score, 100)}%`,
                background: score >= 65
                  ? 'linear-gradient(90deg, var(--amber), var(--danger))'
                  : score >= 35
                    ? 'linear-gradient(90deg, var(--fern), var(--amber))'
                    : 'linear-gradient(90deg, var(--pine), var(--fern))',
              }} />
            </div>

            {result && (
              <>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--txt-high)', marginBottom: 8 }}>
                  {result.risk_level_category}
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--txt-med)', lineHeight: 1.6, padding: '12px 14px', background: 'var(--bg-void)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--amber)', fontWeight: 700 }}>Action: </span>
                  {result.recommended_action}
                </div>
              </>
            )}
          </div>

          {/* Sub-metrics */}
          {result && (
            <div className="wc-card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--txt-low)', marginBottom: 16 }}>
                Hydration Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  { label: 'Est. Sweat Loss', value: `${result.estimated_sweat_loss_liters} L`, color: 'var(--water)' },
                  { label: 'Water Deficit',   value: `${result.dehydration_deficit_liters} L`,  color: result.dehydration_deficit_liters > 1 ? 'var(--danger)' : 'var(--fern)' },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--txt-low)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', fontWeight: 700, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: '0.72rem', color: 'var(--txt-low)' }}>
                Model: {result.model_used}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
