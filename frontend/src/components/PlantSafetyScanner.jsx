import React, { useEffect, useState } from 'react';

const FALLBACK = [
  { id: 'plant_blackberry', category: 'Edible Plant',    name: 'Wild Blackberry',   safety_status: 'EDIBLE & SAFE',    identification_features: 'Compound serrated leaves, aggregate berries, no latex sap.', audio_guide: 'Aggregate drupelets with no white sap are safe to eat.' },
  { id: 'plant_sorrel',     category: 'Edible Plant',    name: 'Wood Sorrel',        safety_status: 'EDIBLE & SAFE',    identification_features: 'Clover-like leaves in groups of 3, small yellow/white flowers.', audio_guide: 'Sour lemony taste. Safe in moderate amounts. High oxalate.' },
  { id: 'plant_hemlock',    category: 'Poisonous Plant', name: 'Poison Hemlock',     safety_status: 'DEADLY POISONOUS', identification_features: 'Smooth green stems with purple spots, musty parsnip odor.', audio_guide: 'WARNING: Hairless purple-spotted stem. Do not touch or ingest.' },
  { id: 'plant_nettle',     category: 'Edible Plant',    name: 'Stinging Nettle',   safety_status: 'EDIBLE COOKED',    identification_features: 'Serrated leaves with tiny hollow stinging hairs.', audio_guide: 'Boil or steam for 10 min to neutralise sting. Rich in iron.' },
  { id: 'plant_elderberry', category: 'Edible Fruit',    name: 'Elderberry',         safety_status: 'COOK REQUIRED',    identification_features: 'Flat clusters of dark purple berries, compound leaves, hollow stems.', audio_guide: 'Never eat raw. Boil to destroy toxins. Flowers are safe raw.' },
];

const isToxic = s => s?.includes('POISONOUS') || s?.includes('DEADLY');

export default function PlantSafetyScanner({ onSelectTopic }) {
  const [catalog, setCatalog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch('/api/survival-catalog')
      .then(r => r.json())
      .then(d => { setCatalog(d); setSelected(d[0] ?? null); })
      .catch(() => { setCatalog(FALLBACK); setSelected(FALLBACK[0]); });
  }, []);

  const handleSearch = q => {
    setSearchQuery(q);
    fetch(`/api/survival-catalog?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setCatalog(d); if (d.length) setSelected(d[0]); })
      .catch(() => {});
  };

  const pick = item => { setSelected(item); if (onSelectTopic) onSelectTopic(item); };

  const statusColor = s => isToxic(s) ? 'var(--danger)' : s?.includes('COOK') ? 'var(--amber)' : 'var(--fern)';

  const CATEGORIES = ['All', 'Edible Plant', 'Poisonous Plant', 'Edible Fruit'];
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredCatalog = catalog.filter(item => {
    const catMatch = selectedCat === 'All' || item.category === selectedCat;
    const qMatch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.identification_features?.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && qMatch;
  });

  return (
    <div className="section-wrap anim-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-eyebrow">MongoDB Atlas Vector RAG · Offline Catalog</div>
        <h2 className="section-title">Field Manual</h2>
        <p className="section-sub">
          Identify edible & toxic plants, knots, shelters and water sources. Works without signal.
        </p>
      </div>

      {/* Poison Warning Alert */}
      <div style={{
        padding: '12px 16px', borderRadius: 'var(--radius-md)',
        background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.25)',
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
      }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--danger)' }}>⚠️</span>
        <div style={{ fontSize: '0.8rem', color: 'var(--txt-high)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--danger)' }}>Universal Foraging Rule: </strong>
          Never ingest any wild plant unless positive of identification. Always cross-check 3 distinct botanical features (leaves, stems, flowers/fruit).
        </div>
      </div>

      {/* Category Chips & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <input
          className="field-input"
          style={{ borderRadius: 'var(--radius-sm)' }}
          type="text"
          placeholder="Search plants, knots, shelter techniques…"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
        <div className="chip-strip">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip${selectedCat === cat ? ' active' : ''}`}
              onClick={() => setSelectedCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredCatalog.map(item => (
            <div
              key={item.id}
              className={`plant-item${selected?.id === item.id ? ' selected' : ''}`}
              onClick={() => pick(item)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && pick(item)}
            >
              <div className="plant-item__dot" style={{ background: statusColor(item.safety_status) }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: statusColor(item.safety_status), marginBottom: 2 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--txt-low)' }}>{item.category}</div>
              </div>
              <span className={isToxic(item.safety_status) ? 'badge badge--danger' : item.safety_status?.includes('COOK') ? 'badge badge--amber' : 'badge badge--green'}
                style={{ fontSize: '0.6rem' }}>
                {item.safety_status}
              </span>
            </div>
          ))}
          {filteredCatalog.length === 0 && (
            <div style={{ color: 'var(--txt-low)', fontSize: '0.82rem', padding: '20px 0', textAlign: 'center' }}>
              No results matching your filter.
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="wc-card" style={{ padding: '24px 24px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span className="badge badge--ghost" style={{ textTransform: 'none', fontSize: '0.7rem' }}>{selected.category}</span>
              <span className={isToxic(selected.safety_status) ? 'badge badge--danger' : selected.safety_status?.includes('COOK') ? 'badge badge--amber' : 'badge badge--green'}>
                {selected.safety_status}
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: statusColor(selected.safety_status), marginBottom: 20, letterSpacing: '-0.01em' }}>
              {selected.name}
            </h3>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', marginBottom: 8 }}>
                Identification Features
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--txt-med)', lineHeight: 1.7 }}>
                {selected.identification_features}
              </p>
            </div>

            <div className="divider" />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', marginBottom: 8 }}>
                Field Audio Guide
              </div>
              <div className="response-block" style={{
                borderLeftColor: isToxic(selected.safety_status) ? 'var(--danger)' : 'var(--fern)',
                background: isToxic(selected.safety_status) ? 'rgba(230,57,70,0.04)' : 'rgba(52,183,136,0.04)',
              }}>
                {selected.audio_guide}
              </div>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', borderRadius: 'var(--radius-sm)' }}
              onClick={() => onSelectTopic && onSelectTopic(selected)}
            >
              Ask AI Guide About This →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
