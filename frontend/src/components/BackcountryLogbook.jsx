import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

const SAMPLE_LOG = {
  hiker_name: 'Alex Rivers',
  location_name: 'Desolation Wilderness Loop',
  risk_score: 32,
  notes: 'Constructed Debris A-Frame shelter near Granite Lake. Water filtered via bio-sand method.',
  timestamp: '2026-10-07 14:20',
};

function RiskPip({ score }) {
  const num = typeof score === 'number' ? score : (Number(score) || 0);
  const color = num >= 65 ? 'var(--danger)' : num >= 35 ? 'var(--amber)' : 'var(--fern)';
  return (
    <span style={{
      fontFamily: 'var(--mono)', fontSize: '0.78rem',
      color, fontWeight: 600,
    }}>
      {num}/100
    </span>
  );
}

export default function BackcountryLogbook({ riskData }) {
  const [hikerName, setHikerName] = useState('Alex Rivers');
  const [locationName, setLocationName] = useState('Sierra High Route Trail');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([SAMPLE_LOG]);

  // Load persisted logs from MongoDB Atlas
  useEffect(() => {
    fetch(apiUrl('/api/backcountry-logs'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      })
      .catch(() => {});
  }, []);

  const saveLog = async () => {
    if (!notes.trim()) return;
    setSaving(true);
    const entry = {
      hiker_name: hikerName, location_name: locationName,
      notes, risk_score: riskData?.risk_score_index ?? 28,
      timestamp: new Date().toLocaleString(),
    };
    try {
      await fetch(apiUrl('/api/backcountry-log'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch { /* offline fallback */ }
    setLogs([entry, ...logs]);
    setNotes('');
    setSaving(false);
  };

  const TEMPLATES = [
    '🏕️ Constructed A-Frame debris shelter with pine needle insulation.',
    '💧 Filtered 2.5L water from mountain stream using 3-stage sand system.',
    '⚠️ Trail hazard: fallen timber blocking pass at 2,400m elevation.',
    '🌤️ Weather shift: wind increasing from NW, temperature dropping rapidly.',
  ];

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wildcraft_trail_log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="section-wrap anim-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow">MongoDB Atlas Cloud Database</div>
        <h2 className="section-title">Trail Logbook</h2>
        <p className="section-sub">
          Record shelter spots, water sources & risk telemetry. Persisted to MongoDB Atlas.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Form */}
        <div className="wc-card" style={{ padding: '24px 24px 22px' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', marginBottom: 16 }}>
            New Entry
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--txt-low)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Hiker Name
              </label>
              <input className="field-input" value={hikerName} onChange={e => setHikerName(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--txt-low)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Trail / Location
              </label>
              <input className="field-input" value={locationName} onChange={e => setLocationName(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--txt-low)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Quick Note Templates
              </label>
              <div className="chip-strip" style={{ marginBottom: 10 }}>
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={idx}
                    className="chip"
                    onClick={() => setNotes(prev => (prev ? `${prev}\n${t}` : t))}
                  >
                    {t.slice(0, 22)}…
                  </button>
                ))}
              </div>

              <textarea
                className="field-input"
                rows={4} value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Shelter location, water source quality, trail condition…"
                style={{ resize: 'vertical', minHeight: 90 }}
              />
            </div>

            {riskData && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-void)', borderRadius: 8, border: '1px solid var(--line)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--txt-low)' }}>Current risk score</span>
                <RiskPip score={riskData.risk_score_index} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                className="btn-primary"
                style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}
                onClick={saveLog}
                disabled={saving || !notes.trim()}
              >
                {saving ? '◌ Saving…' : '↑ Save Entry to Atlas'}
              </button>
              <button
                className="btn-outline"
                style={{ borderRadius: 'var(--radius-sm)' }}
                onClick={exportLogs}
              >
                ↓ Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Log history */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)' }}>
              Logbook History — {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </div>
            <button
              className="btn-outline"
              style={{ fontSize: '0.72rem', padding: '4px 10px' }}
              onClick={exportLogs}
            >
              📥 Export JSON
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.map((log, i) => (
              <div key={i} className="log-entry">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--txt-high)' }}>
                    {log.hiker_name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--txt-ghost)', fontFamily: 'var(--mono)' }}>
                    {typeof log.timestamp === 'number' ? new Date(log.timestamp * 1000).toLocaleString() : (log.timestamp || 'Recent')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--txt-low)' }}>{log.location_name}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--txt-ghost)' }} />
                  <RiskPip score={log.risk_score} />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--txt-med)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{log.notes}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
