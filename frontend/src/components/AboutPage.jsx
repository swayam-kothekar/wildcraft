import React from 'react';

const OPEN_REASONS = [
  { icon: '📵', title: 'Built for the Backcountry',  body: 'Gemma open-weight intelligence runs at the edge. When cloud connectivity fades, graceful offline fallbacks keep critical survival guidance available.' },
  { icon: '🔒', title: 'Your Data Stays Yours', body: 'Open-weight architecture means no proprietary black boxes. Your survival queries are never used to train third-party models.' },
  { icon: '🔧', title: 'Swap & Fine-Tune',       body: 'Open-weight architecture lets you fine-tune for your biome, altitude range, or region.' },
  { icon: '💸', title: 'Low Inference Cost',     body: 'Open-weight Gemma keeps costs minimal. Survival intelligence that scales without a per-token price tag at every trailhead.' },
];

const PARTNERS = [
  { name: 'Google Gemma',       role: 'Open-weight LLM, on-device survival AI',               color: 'var(--fern)',  dot: 'var(--fern)' },
  { name: 'Prior Labs TabPFN',  role: 'Tabular Foundation Model for physiological risk',       color: 'var(--water)', dot: 'var(--water)' },
  { name: 'ElevenLabs',         role: 'Cinematic voice narration, spoken outdoor audio guide', color: 'var(--amber)', dot: 'var(--amber)' },
  { name: 'MongoDB Atlas',      role: 'Cloud-synced vector store, trail log persistence',      color: '#a78bfa',      dot: '#a78bfa' },
  { name: 'SerpApi',            role: 'Real-time trail alerts, weather & emergency broadcasts',color: 'var(--ember)', dot: 'var(--ember)' },
];

export default function AboutPage() {
  return (
    <div className="section-wrap anim-fade-up">
      {/* Hero blurb */}
      <div style={{ marginBottom: 48, maxWidth: 640 }}>
        <div className="section-eyebrow">Architecture & Philosophy</div>
        <h2 className="section-title">Why open-source AI?</h2>
        <p className="section-sub" style={{ fontSize: '1rem', lineHeight: 1.8 }}>
          Life-saving wilderness intelligence should be free, private, and available 20 miles
          from the nearest cell tower. Open-weight models make that possible — not a pricing tier.
        </p>
      </div>

      {/* Why Open grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginBottom: 52 }}>
        {OPEN_REASONS.map(r => (
          <div key={r.title} className="why-card">
            <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--mist)', marginBottom: 8 }}>{r.title}</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--txt-med)', lineHeight: 1.65 }}>{r.body}</p>
          </div>
        ))}
      </div>

      {/* Partners */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-eyebrow" style={{ marginBottom: 6 }}>Built with</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--txt-high)', marginBottom: 20 }}>
          Open-source & partner stack
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {PARTNERS.map(p => (
            <div key={p.name} className="partner-tile">
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.dot, flexShrink: 0, marginTop: 3 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: p.color, marginBottom: 3 }}>{p.name}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--txt-med)', lineHeight: 1.5 }}>{p.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Specs */}
      <div style={{ marginBottom: 48 }}>
        <div className="section-eyebrow" style={{ marginBottom: 6 }}>Architecture</div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--txt-high)', marginBottom: 20 }}>
          Local Edge Engine Specifications
        </h3>
        <div className="wc-card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--txt-low)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>LLM Backbone</div>
            <div style={{ fontWeight: 700, color: 'var(--fern)' }}>Gemma 2B (INT4 Quantized)</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-med)', marginTop: 2 }}>~1.3 GB VRAM requirement</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--txt-low)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Tabular Predictor</div>
            <div style={{ fontWeight: 700, color: 'var(--water)' }}>Prior Labs TabPFN v2</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-med)', marginTop: 2 }}>In-context survival risk inference</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--txt-low)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Vector Engine</div>
            <div style={{ fontWeight: 700, color: 'var(--gold)' }}>Atlas Vector Search / HNSW</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--txt-med)', marginTop: 2 }}>500+ plant & survival vector chunks</div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: '0.74rem', color: 'var(--txt-low)', lineHeight: 1.6 }}>
          <strong>Operational Note:</strong> WildCraft is architected for resilience. When cloud services are unavailable, the system gracefully degrades to edge-hosted open-weight inference and pre-computed survival heuristics — ensuring guidance remains accessible in low-connectivity environments. Live weather and cloud sync resume on reconnection.
        </div>
      </div>

      <div className="divider" />
      <div style={{ fontSize: '0.72rem', color: 'var(--txt-ghost)', textAlign: 'center', paddingBottom: 8 }}>
        WildCraft AI · Engineered with Open-Weight AI & Foundation Models
      </div>
    </div>
  );
}
