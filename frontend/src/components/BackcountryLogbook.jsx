import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

const TEMPLATES = [
  '⛺ Constructed A-Frame tarp shelter with paracord ridge line.',
  '💧 Filtered 2.5L water from mountain stream using Sawyer Mini.',
  '🔥 Bow drill fire started using dried cedar hearth board.',
  '🧭 Bearing drift observed due to magnetic anomaly on ridge.',
  '⚠️ Sighted fresh bear tracks heading south toward creek bed.',
];

function RiskPip({ score }) {
  let color = '#22c55e';
  let label = 'Low';
  if (score > 65) { color = '#ef4444'; label = 'High'; }
  else if (score > 35) { color = '#f59e0b'; label = 'Moderate'; }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 9999,
      background: `${color}18`, border: `1px solid ${color}44`,
      fontSize: '0.72rem', fontWeight: 700, color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {label} · {typeof score === 'number' ? score.toFixed(1) : score}
    </span>
  );
}

export default function BackcountryLogbook({ riskData }) {
  const [logs, setLogs] = useState([]);
  const [hikerName, setHikerName] = useState('Alex Rivers');
  const [locationName, setLocationName] = useState('Sierra High Route Trail');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch(apiUrl('/api/backcountry-logs'));
      if (res.ok) {
        const d = await res.json();
        const list = Array.isArray(d) ? d : (d.entries || []);
        if (list) {
          setLogs(list);
        }
      }
    } catch {
      // Offline fallback: keep local
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const saveLog = async () => {
    if (!notes.trim()) return;
    setSaving(true);
    const payload = {
      hiker_name: hikerName || 'Backcountry Hiker',
      location_name: locationName || 'Cascade Wilderness',
      risk_score: riskData?.risk_score_index ?? 42.0,
      notes: notes.trim(),
      gear_items: ['Tarp', 'Paracord', 'Sawyer Mini', 'Ferro Rod'],
      timestamp: Date.now() / 1000,
    };

    try {
      const res = await fetch(apiUrl('/api/backcountry-log'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNotes('');
        await fetchLogs();
      } else {
        // Optimistic/fallback update
        setLogs(prev => [payload, ...prev]);
        setNotes('');
      }
    } catch {
      // Local fallback append
      setLogs(prev => [payload, ...prev]);
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wildcraft-logbook-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-wrap anim-fade-up" style={{ width: '100%', maxWidth: 1080, margin: '0 auto', minWidth: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow">MongoDB Atlas Cloud Database</div>
        <h2 className="section-title">Trail Logbook</h2>
        <p className="section-sub">
          Record shelter spots, water sources & risk telemetry. Persisted to MongoDB Atlas.
        </p>
      </div>

      <div className="grid-2 logbook-grid" style={{ alignItems: 'start', minWidth: 0, width: '100%' }}>
        {/* Form Card */}
        <div className="wc-card logbook-form-card" style={{ minWidth: 0, width: '100%' }}>
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
              <div className="chip-strip" style={{ marginBottom: 10, maxWidth: '100%', minWidth: 0 }}>
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={idx}
                    className="chip"
                    onClick={() => setNotes(prev => (prev ? `${prev}\n${t}` : t))}
                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-void)', borderRadius: 8, border: '1px solid var(--line)', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--txt-low)' }}>Current risk score</span>
                <RiskPip score={riskData.risk_score_index} />
              </div>
            )}

            {/* Mobile Responsive Action Buttons Row */}
            <div className="logbook-btn-row">
              <button
                className="btn-primary logbook-save-btn"
                onClick={saveLog}
                disabled={saving || !notes.trim()}
              >
                {saving ? '◌ Saving…' : '↑ Save Entry to Atlas'}
              </button>
              <button
                className="btn-outline logbook-export-btn"
                onClick={exportLogs}
              >
                ↓ Export Logs
              </button>
            </div>
          </div>
        </div>

        {/* Log history Card */}
        <div style={{ minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)' }}>
              Logbook History — {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </div>
            <button
              className="btn-outline"
              style={{ fontSize: '0.72rem', padding: '5px 12px' }}
              onClick={exportLogs}
            >
              📥 Export JSON
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.map((log, i) => (
              <div key={i} className="log-entry" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--txt-high)' }}>
                    {log.hiker_name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--txt-ghost)', fontFamily: 'var(--mono)' }}>
                    {typeof log.timestamp === 'number' ? new Date(log.timestamp * 1000).toLocaleString() : (log.timestamp || 'Recent')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
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
