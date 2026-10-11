import React from 'react';

const TABS = [
  { id: 'home',    icon: '◈', label: 'Overview'       },
  { id: 'risk',    icon: '◉', label: 'Risk Engine'    },
  { id: 'ai',      icon: '◎', label: 'AI Guide'       },
  { id: 'plants',  icon: '◈', label: 'Field Manual'   },
  { id: 'logbook', icon: '◉', label: 'Logbook'        },
  { id: 'about',   icon: '◎', label: 'About'          },
];

export default function Navbar({
  activeTab, setActiveTab,
  highVisMode, setHighVisMode,
  offlineBackcountryMode, setOfflineBackcountryMode,
  trailAlerts,
}) {
  return (
    <>
      {/* ── Top Nav ── */}
      <header className="nav-bar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div className="nav-logo-icon">🌲</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}
              className={highVisMode ? '' : 'grad-text'}>
              WildCraft AI
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--txt-low)', marginTop: 2, letterSpacing: '0.04em' }}>
              WILDERNESS INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Alert ticker */}
        {trailAlerts && (
          <div style={{
            flex: 1, maxWidth: 400, overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '5px 12px',
            background: 'rgba(231,111,81,0.06)',
            border: '1px solid rgba(231,111,81,0.2)',
            borderRadius: 8,
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--ember)', fontWeight: 700, flexShrink: 0 }}>
              ▲ ALERT
            </span>
            <span style={{
              fontSize: '0.72rem', color: 'var(--txt-med)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {trailAlerts.ranger_advisory || 'High Wind Warning Above 2,500m Elevation'}
            </span>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
          <button
            id="btn-backcountry"
            onClick={() => setOfflineBackcountryMode(!offlineBackcountryMode)}
            style={{
              padding: '7px 13px',
              borderRadius: 8, border: '1px solid',
              borderColor: offlineBackcountryMode ? 'var(--line-bright)' : 'var(--line)',
              background: offlineBackcountryMode ? 'rgba(52,183,136,0.12)' : 'transparent',
              color: offlineBackcountryMode ? 'var(--fern)' : 'var(--txt-low)',
              fontFamily: 'var(--font)', fontSize: '0.76rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: offlineBackcountryMode ? 'var(--fern)' : 'var(--txt-ghost)',
              boxShadow: offlineBackcountryMode ? '0 0 6px var(--fern)' : 'none',
            }} />
            {offlineBackcountryMode ? 'Backcountry' : 'Online'}
          </button>

          <button
            id="btn-highvis"
            onClick={() => setHighVisMode(!highVisMode)}
            style={{
              padding: '7px 13px',
              borderRadius: 8, border: '1px solid',
              borderColor: highVisMode ? '#000' : 'rgba(231,111,81,0.4)',
              background: highVisMode ? '#ffe600' : 'rgba(231,111,81,0.08)',
              color: highVisMode ? '#000' : 'var(--ember)',
              fontFamily: 'var(--font)', fontSize: '0.76rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            ◐ {highVisMode ? 'High-Vis ON' : 'Sunlight'}
          </button>
        </div>
      </header>

      {/* ── Tab Bar ── */}
      <nav className="tab-bar" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
