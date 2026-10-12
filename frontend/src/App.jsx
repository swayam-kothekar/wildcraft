import React, { useState, useEffect } from 'react';
import { apiUrl } from './config/api';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import TabPFNRiskPredictor from './components/TabPFNRiskPredictor';
import GemmaBushcraftWhisperer from './components/GemmaBushcraftWhisperer';
import PlantSafetyScanner from './components/PlantSafetyScanner';
import BackcountryLogbook from './components/BackcountryLogbook';
import AboutPage from './components/AboutPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('WildCraft UI Error:', error, errorInfo);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.activeTab !== this.props.activeTab && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="section-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="wc-card" style={{ maxWidth: 460, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌲</div>
            <h3 style={{ color: 'var(--txt-high)', marginBottom: 8, fontSize: '1.1rem' }}>Display Recovery</h3>
            <p style={{ color: 'var(--txt-med)', fontSize: '0.84rem', marginBottom: 20, lineHeight: 1.5 }}>
              This tab encountered a temporary rendering issue.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onReset) this.props.onReset();
              }}
              style={{ padding: '8px 20px', fontSize: '0.82rem' }}
            >
              Return to Overview
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [lightMode, setLightMode] = useState(false);
  const [offlineBackcountryMode, setOfflineBackcountryMode] = useState(false);
  const [trailAlerts, setTrailAlerts] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [liveConditions, setLiveConditions] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationDeniedModal, setLocationDeniedModal] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isSmall = window.innerWidth <= 768;
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
    return isSmall || isMobileDevice;
  });
  const [mobilePlatform, setMobilePlatform] = useState(() => {
    if (typeof navigator === 'undefined') return 'android';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || '') || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isIOS ? 'ios' : 'android';
  });

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth <= 768;
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '');
      setIsMobileMode(isSmall || isMobileDevice);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Light mode body class
  useEffect(() => {
    document.body.classList.toggle('light-mode', lightMode);
  }, [lightMode]);

  // Memoized risk telemetry handler to prevent render loops
  const handleRiskUpdate = React.useCallback((data) => {
    setRiskData(data);
  }, []);

  // GPS + weather fetch
  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationDeniedModal(true);
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationDeniedModal(false);
        const { latitude: lat, longitude: lon } = pos.coords;
        let gotLive = false;

        // 1. Try configured backend API first
        try {
          const res = await fetch(apiUrl(`/api/wilderness-weather?lat=${lat}&lon=${lon}`));
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const d = await res.json();
            if (d && d.status === 'live' && d.ambient_temp_c != null) {
              setLiveConditions(d);
              gotLive = true;
            }
          }
        } catch (e) {
          console.warn('Backend weather endpoint error:', e);
        }

        // 2. Direct client-side Open-Meteo query (no API key required, public CORS)
        if (!gotLive) {
          try {
            const omRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
            );
            if (omRes.ok) {
              const omData = await omRes.json();
              const curr = omData.current || {};
              if (curr.temperature_2m != null) {
                setLiveConditions({
                  status: 'live',
                  provider: 'Open-Meteo (Client Edge)',
                  latitude: lat,
                  longitude: lon,
                  elevation_m: omData.elevation ?? 50,
                  ambient_temp_c: curr.temperature_2m,
                  temperature_c: curr.temperature_2m,
                  relative_humidity_pct: curr.relative_humidity_2m ?? 65.0,
                  wind_speed_kmh: curr.wind_speed_10m ?? 10.0,
                });
                gotLive = true;
              }
            }
          } catch (omErr) {
            console.warn('Direct Open-Meteo query failed:', omErr);
          }
        }

        // 3. Fallback only if device is completely offline
        if (!gotLive) {
          setLiveConditions({
            status: 'fallback',
            latitude: lat,
            longitude: lon,
            elevation_m: 1450.0,
            ambient_temp_c: 18.0,
            temperature_c: 18.0,
            relative_humidity_pct: 65.0,
            wind_speed_kmh: 18.0,
          });
        }

        setGpsLoading(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsLoading(false);
        if (err && (err.code === err.PERMISSION_DENIED || err.code === 1)) {
          setLocationDeniedModal(true);
        }
      }
    );
  };

  // Initial data load
  useEffect(() => {
    requestLocation();
    fetch(apiUrl('/api/trail-alerts'))
      .then(r => r.json())
      .then(d => setTrailAlerts(d))
      .catch(() => {});
  }, []);

  // When a feature card is clicked on the Home tab, navigate to that tab
  const handleTabSelect = (tabId) => setActiveTab(tabId);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onTabSelect={handleTabSelect}
            liveConditions={liveConditions}
            gpsLoading={gpsLoading}
            onRequestLocation={requestLocation}
            offlineBackcountryMode={offlineBackcountryMode}
          />
        );

      case 'risk':
        return (
          <div className="section-container animate-fade-up">
            <TabPFNRiskPredictor
              liveConditions={liveConditions}
              onRiskUpdate={handleRiskUpdate}
            />
          </div>
        );

      case 'ai':
        return (
          <div className="section-container animate-fade-up">
            <GemmaBushcraftWhisperer
              riskData={riskData}
              offlineBackcountryMode={offlineBackcountryMode}
              selectedTopic={selectedTopic}
            />
          </div>
        );

      case 'plants':
        return (
          <div className="section-container animate-fade-up">
            <PlantSafetyScanner onSelectTopic={(topic) => {
              setSelectedTopic(topic);
              setActiveTab('ai');   // jump to AI tab after selecting a plant topic
            }} />
          </div>
        );

      case 'logbook':
        return (
          <div className="section-container animate-fade-up">
            <BackcountryLogbook riskData={riskData} />
          </div>
        );

      case 'about':
        return <AboutPage />;

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lightMode={lightMode}
        setLightMode={setLightMode}
        offlineBackcountryMode={offlineBackcountryMode}
        setOfflineBackcountryMode={setOfflineBackcountryMode}
        trailAlerts={trailAlerts}
      />

      <main className="page-content" role="main">
        <ErrorBoundary activeTab={activeTab} onReset={() => setActiveTab('home')}>
          {renderContent()}
        </ErrorBoundary>
      </main>

      {/* ── Location Denied / Required Modal ── */}
      {locationDeniedModal && (
        <div
          id="location-permission-modal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div
            className="wc-card"
            style={{
              maxWidth: 460,
              width: '100%',
              padding: isMobileMode ? '22px 18px' : '28px 22px',
              textAlign: 'center',
              border: '1px solid rgba(231, 111, 81, 0.45)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 20px rgba(231, 111, 81, 0.2)',
              borderRadius: 'var(--radius-lg)',
              animation: 'fade-up 0.3s ease',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'rgba(231, 111, 81, 0.12)',
              border: '1px solid rgba(231, 111, 81, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
            }}>
              📍
            </div>

            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              marginBottom: 6,
            }}>
              Location Access Required
            </div>

            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--txt-high)',
              marginBottom: 10,
              lineHeight: 1.25,
            }}>
              We Can't Work Without Your Location
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: 'var(--txt-med)',
              lineHeight: 1.55,
              marginBottom: 16,
            }}>
              WildCraft AI relies on real-time GPS coordinates to compute your live elevation, wilderness weather, and survival physiological risk. Without location permission, vital safety calculations cannot run.
            </p>

            {isMobileMode ? (
              <div style={{
                background: 'var(--bg-void)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                border: '1px solid var(--line)',
                fontSize: '0.78rem',
                color: 'var(--txt-med)',
                textAlign: 'left',
                lineHeight: 1.45,
                marginBottom: 18,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: 8,
                }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    color: 'var(--fern)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}>
                    📱 Mobile Device Steps
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => setMobilePlatform('android')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid',
                        borderColor: mobilePlatform === 'android' ? 'var(--fern)' : 'var(--line)',
                        background: mobilePlatform === 'android' ? 'rgba(52, 183, 136, 0.16)' : 'transparent',
                        color: mobilePlatform === 'android' ? 'var(--fern)' : 'var(--txt-low)',
                        cursor: 'pointer',
                      }}
                    >
                      🤖 Android
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobilePlatform('ios')}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid',
                        borderColor: mobilePlatform === 'ios' ? 'var(--fern)' : 'var(--line)',
                        background: mobilePlatform === 'ios' ? 'rgba(52, 183, 136, 0.16)' : 'transparent',
                        color: mobilePlatform === 'ios' ? 'var(--fern)' : 'var(--txt-low)',
                        cursor: 'pointer',
                      }}
                    >
                      🍏 iPhone
                    </button>
                  </div>
                </div>

                {mobilePlatform === 'android' ? (
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: 'var(--txt-med)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li>
                      Tap the <strong>tune / lock icon 🔒</strong> in Chrome's address bar (or tap <strong>⋮</strong> menu ➔ <em>Site settings</em>).
                    </li>
                    <li>
                      Tap <strong>Permissions</strong> ➔ <strong>Location</strong> ➔ select <strong>Allow</strong>.
                    </li>
                    <li>
                      Make sure your phone's <strong>Location (GPS)</strong> is turned ON in Android Quick Settings.
                    </li>
                    <li>
                      Tap <strong>Enable Location / Try Again</strong> below.
                    </li>
                  </ol>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', color: 'var(--txt-med)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li>
                      Tap the <strong>aA</strong> icon on the left side of Safari's address bar.
                    </li>
                    <li>
                      Tap <strong>Website Settings</strong> ➔ <strong>Location</strong> ➔ select <strong>Allow</strong>.
                    </li>
                    <li>
                      If prompted or blocked, check iPhone <strong>Settings</strong> ➔ <strong>Privacy & Security</strong> ➔ <strong>Location Services</strong> ➔ ensure <em>Safari Websites</em> is enabled.
                    </li>
                    <li>
                      Tap <strong>Enable Location / Try Again</strong> below.
                    </li>
                  </ol>
                )}
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-void)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                border: '1px solid var(--line)',
                fontSize: '0.78rem',
                color: 'var(--txt-low)',
                textAlign: 'left',
                lineHeight: 1.45,
                marginBottom: 20,
              }}>
                <strong style={{ color: 'var(--fern)' }}>How to enable:</strong> Click the lock 🔒 or tune icon in your browser's address bar, set <em>Location</em> to <em>Allow</em>, and click <strong>Enable Location / Try Again</strong> below.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                id="btn-retry-location"
                className="btn-primary"
                onClick={() => {
                  requestLocation();
                }}
                style={{ width: '100%', padding: '12px 18px', fontSize: '0.88rem' }}
              >
                🔄 Enable Location / Try Again
              </button>
              <button
                id="btn-dismiss-location"
                className="btn-outline"
                onClick={() => setLocationDeniedModal(false)}
                style={{ width: '100%', padding: '9px 16px', fontSize: '0.78rem', opacity: 0.8 }}
              >
                Continue with Simulated Trailhead (Restricted)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
