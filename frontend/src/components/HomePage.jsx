import React from 'react';

const FEATURES = [
  {
    id: 'risk',
    icon: '⬡',
    tag: 'Prior Labs TabPFN',
    title: 'Survival Risk Engine',
    desc: 'Physiological risk scores for hypothermia, dehydration & altitude exposure.',
  },
  {
    id: 'ai',
    icon: '◉',
    tag: 'Google Gemma',
    title: 'Bushcraft AI Guide',
    desc: 'Ask anything. Fire, shelter, knots, water purification — voice-guided spoken audio.',
  },
  {
    id: 'plants',
    icon: '◈',
    tag: 'Offline Catalog',
    title: 'Field Manual',
    desc: 'Identify edible & toxic plants. No signal required. Built for the backcountry.',
  },
  {
    id: 'logbook',
    icon: '◎',
    tag: 'MongoDB Atlas',
    title: 'Trail Logbook',
    desc: 'Log shelter spots, water sources & risk readings. Synced or stored offline.',
  },
];

const STATS = [
  { val: '100%', lbl: 'Offline Capable',    color: 'var(--fern)'  },
  { val: '0G',   lbl: 'Signal Required',     color: 'var(--water)' },
  { val: '2B',   lbl: 'Gemma Params',         color: 'var(--gold)'  },
  { val: 'RAG',  lbl: 'Vector Field Guide',   color: 'var(--sage)'  },
];

export default function HomePage({ onTabSelect, liveConditions, gpsLoading, onRequestLocation, offlineBackcountryMode }) {
  return (
    <div className="hero-wrap">
      {/* Ambient orbs */}
      <div className="hero-orb" style={{ width: 450, height: 450, background: 'rgba(45, 106, 79, 0.22)', top: -80, left: -100 }} />
      <div className="hero-orb" style={{ width: 350, height: 350, background: 'rgba(82, 183, 136, 0.12)', bottom: -40, right: -40 }} />

      <div className="hero-inner anim-fade-up">
        {/* Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          <span className="badge badge--green">Open-Weight AI</span>
          <span className="badge badge--water">Edge Resilient</span>
          <span className="badge badge--amber">Spoken Audio</span>
        </div>

        {/* Headline */}
        <h1 className="hero-headline">
          <span className="grad-text">Stay safe</span>
          <br />
          in the wild.
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.08rem)',
          color: 'var(--txt-med)', lineHeight: 1.75,
          maxWidth: 580, margin: '0 auto 36px',
        }}>
          An intelligent wilderness co-pilot powered by <strong style={{ color: 'var(--mist)' }}>Google Gemma</strong> open-weight AI,
          {' '}<strong style={{ color: 'var(--mist)' }}>TabPFN</strong> physiological risk predictions,
          and <strong style={{ color: 'var(--mist)' }}>ElevenLabs</strong> voice narration.
          Put your phone in your pocket.
        </p>

        {/* GPS button */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
          <button
            className="hero-cta"
            id="btn-gps-hero"
            onClick={onRequestLocation}
          >
            <span>{gpsLoading ? '◌' : liveConditions ? '◉' : '◎'}</span>
            {gpsLoading
              ? 'Locating...'
              : liveConditions
                ? `${liveConditions.location || 'GPS synced'} · ${
                    (liveConditions.ambient_temp_c ?? liveConditions.temperature_c ?? liveConditions.temp_c) != null
                      ? `${Math.round(liveConditions.ambient_temp_c ?? liveConditions.temperature_c ?? liveConditions.temp_c)}°C`
                      : '—°C'
                  }`
                : 'Detect Location & Conditions'}
          </button>
          {offlineBackcountryMode && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: 'rgba(52,183,136,0.08)',
              border: '1px solid var(--line-mid)',
              fontSize: '0.82rem', color: 'var(--fern)', fontWeight: 600,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--fern)', boxShadow: '0 0 6px var(--fern)', display: 'inline-block' }} />
              Backcountry Mode Active
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="stat-bar" style={{ margin: '44px 0 0' }}>
          {STATS.map(s => (
            <div className="stat-item" key={s.lbl} style={{ textAlign: 'center' }}>
              <div className="val" style={{ color: s.color }}>{s.val}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--line)', margin: '44px auto', maxWidth: 480 }} />

        {/* Feature tiles */}
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', marginBottom: 16 }}>
          What's inside
        </p>
        <div className="feature-row">
          {FEATURES.map(f => (
            <div
              key={f.id}
              className="feature-tile"
              role="button"
              tabIndex={0}
              aria-label={`Open ${f.title}`}
              onClick={() => onTabSelect(f.id)}
              onKeyDown={e => e.key === 'Enter' && onTabSelect(f.id)}
            >
              <div className="feature-tile__icon">{f.icon}</div>
              <div className="feature-tile__tag">{f.tag}</div>
              <div className="feature-tile__title">{f.title}</div>
              <div className="feature-tile__desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
