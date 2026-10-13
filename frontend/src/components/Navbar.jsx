import React, { useState, useEffect } from 'react';

const TABS = [
  { id: 'home',    icon: '◈', label: 'Overview'       },
  { id: 'risk',    icon: '◉', label: 'Risk Engine'    },
  { id: 'ai',      icon: '◎', label: 'AI Guide'       },
  { id: 'plants',  icon: '◈', label: 'Field Manual'   },
  { id: 'logbook', icon: '◉', label: 'Logbook'        },
  { id: 'about',   icon: '◎', label: 'About'          },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  lightMode,
  setLightMode,
  offlineBackcountryMode,
  setOfflineBackcountryMode,
  trailAlerts,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile drawer on Escape key press or screen resize to desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* ── Top Bar ── */}
      <header className="nav-bar">
        {/* Brand Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
        >
          <img
            src="/favicon.svg"
            alt="WildCraft AI Logo"
            className="nav-logo-icon"
          />
          <div>
            <div
              style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}
              className="grad-text"
            >
              WildCraft AI
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--txt-low)', marginTop: 2, letterSpacing: '0.04em' }}>
              WILDERNESS INTELLIGENCE
            </div>
          </div>
        </div>

        {/* Ranger Alert Ticker (Desktop only) */}
        {trailAlerts && (
          <div
            className="alert-ticker"
            style={{
              flex: 1, maxWidth: 420, overflow: 'hidden',
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '5px 12px',
              background: 'rgba(231,111,81,0.06)',
              border: '1px solid rgba(231,111,81,0.2)',
              borderRadius: 8,
              marginLeft: 16,
            }}
          >
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

        {/* ── Desktop Controls (Shown only on Desktop > 768px) ── */}
        <div className="nav-desktop-controls">
          {/* Backcountry / Online Toggle */}
          <button
            id="btn-backcountry"
            onClick={() => setOfflineBackcountryMode(!offlineBackcountryMode)}
            style={{
              padding: '7px 13px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: offlineBackcountryMode ? 'var(--line-bright)' : 'var(--line)',
              background: offlineBackcountryMode ? 'rgba(52,183,136,0.12)' : 'transparent',
              color: offlineBackcountryMode ? 'var(--fern)' : 'var(--txt-low)',
              fontFamily: 'var(--font)',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: offlineBackcountryMode ? 'var(--fern)' : 'var(--txt-ghost)',
              boxShadow: offlineBackcountryMode ? '0 0 6px var(--fern)' : 'none',
            }} />
            {offlineBackcountryMode ? 'Backcountry' : 'Online'}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="btn-lightmode"
            onClick={() => setLightMode(!lightMode)}
            style={{
              padding: '7px 13px',
              borderRadius: 8,
              border: '1px solid',
              borderColor: lightMode ? 'var(--fern)' : 'var(--line)',
              background: lightMode ? 'rgba(45, 106, 79, 0.12)' : 'var(--bg-raised)',
              color: lightMode ? 'var(--fern)' : 'var(--txt-high)',
              fontFamily: 'var(--font)',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{lightMode ? '☀️ Light' : '🌙 Dark'}</span>
          </button>
        </div>

        {/* ── Mobile Hamburger Toggle (Shown only on Mobile <= 768px) ── */}
        <button
          id="btn-nav-menu"
          className="nav-mobile-toggle"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label="Toggle mobile navigation menu"
          style={{
            alignItems: 'center',
            gap: 6,
            padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            background: isMenuOpen ? 'var(--moss)' : 'var(--bg-raised)',
            border: '1px solid',
            borderColor: isMenuOpen ? 'var(--fern)' : 'var(--line-mid)',
            color: isMenuOpen ? '#fff' : 'var(--txt-high)',
            fontFamily: 'var(--font)',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>{isMenuOpen ? '✕' : '☰'}</span>
          <span>{isMenuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </header>

      {/* ── Standard Desktop Tab Bar (Shown only on Desktop > 768px) ── */}
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

      {/* ── Mobile Drawer Menu Overlay (STRICTLY for Mobile <= 768px) ── */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="mobile-menu-backdrop"
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              zIndex: 195,
            }}
          />

          {/* Drawer */}
          <div
            className="mobile-menu-drawer"
            style={{
              position: 'fixed',
              top: 'var(--nav-h)',
              right: 0,
              left: 0,
              background: lightMode ? '#ffffff' : 'rgba(12, 17, 14, 0.98)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)',
              borderBottom: '1px solid var(--line-mid)',
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              zIndex: 198,
              padding: '20px 18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              maxHeight: 'calc(100vh - var(--nav-h))',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--txt-low)', fontWeight: 700 }}>
              Navigation & Modes
            </div>

            {/* Navigation Tabs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {TABS.map(t => {
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    id={`menu-tab-${t.id}`}
                    onClick={() => {
                      setActiveTab(t.id);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--fern)' : 'var(--line)',
                      background: isActive ? 'rgba(52, 183, 136, 0.14)' : 'var(--bg-raised)',
                      color: isActive ? 'var(--fern)' : 'var(--txt-high)',
                      fontFamily: 'var(--font)',
                      fontSize: '0.86rem',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '1rem', color: isActive ? 'var(--fern)' : 'var(--txt-low)' }}>
                      {t.icon}
                    </span>
                    <span style={{ flex: 1 }}>{t.label}</span>
                    {isActive && (
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: 'var(--fern)', boxShadow: '0 0 6px var(--fern)'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Field Mode Toggles inside Mobile Menu */}
            <div style={{
              padding: '14px',
              background: 'var(--bg-void)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--txt-low)', fontWeight: 700 }}>
                Survival System Modes
              </div>

              {/* Online / Backcountry Mode Button */}
              <button
                id="btn-backcountry-menu"
                onClick={() => setOfflineBackcountryMode(!offlineBackcountryMode)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: offlineBackcountryMode ? 'var(--fern)' : 'var(--line)',
                  background: offlineBackcountryMode ? 'rgba(52, 183, 136, 0.16)' : 'var(--bg-raised)',
                  color: offlineBackcountryMode ? 'var(--fern)' : 'var(--txt-high)',
                  fontFamily: 'var(--font)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: offlineBackcountryMode ? 'var(--fern)' : 'var(--txt-ghost)',
                    boxShadow: offlineBackcountryMode ? '0 0 8px var(--fern)' : 'none',
                  }} />
                  <div style={{ textAlign: 'left' }}>
                    <div>{offlineBackcountryMode ? 'Backcountry Mode' : 'Online Cloud Mode'}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--txt-low)', fontWeight: 400, marginTop: 1 }}>
                      {offlineBackcountryMode ? '0 Signal · Local edge AI' : 'Cell Connected · Cloud AI'}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--txt-med)' }}>
                  {offlineBackcountryMode ? 'ACTIVE' : 'SWITCH'}
                </span>
              </button>

              {/* Light / Dark Mode Button */}
              <button
                id="btn-lightmode-menu"
                onClick={() => setLightMode(!lightMode)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: lightMode ? 'var(--fern)' : 'var(--line)',
                  background: lightMode ? 'rgba(45, 106, 79, 0.14)' : 'var(--bg-raised)',
                  color: lightMode ? 'var(--fern)' : 'var(--txt-high)',
                  fontFamily: 'var(--font)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1rem' }}>{lightMode ? '☀️' : '🌙'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div>{lightMode ? 'Light Mode (Active)' : 'Dark Mode (Active)'}</div>
                    <div style={{ fontSize: '0.67rem', color: 'var(--txt-low)', fontWeight: 400, marginTop: 1 }}>
                      {lightMode ? 'Switch to Dark Mode' : 'Switch to Clean Light Mode'}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--txt-med)' }}>
                  {lightMode ? 'LIGHT' : 'DARK'}
                </span>
              </button>
            </div>

            {/* Ranger Advisory in Mobile Drawer */}
            {trailAlerts && (
              <div style={{
                padding: '11px 13px',
                background: 'rgba(231,111,81,0.08)',
                border: '1px solid rgba(231,111,81,0.25)',
                borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ fontSize: '0.66rem', color: 'var(--ember)', fontWeight: 800, marginBottom: 2 }}>
                  ▲ RANGER ADVISORY
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--txt-med)', lineHeight: 1.4 }}>
                  {trailAlerts.ranger_advisory || 'High Wind Warning Above 2,500m Elevation'}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
