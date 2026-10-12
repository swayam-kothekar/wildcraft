import React, { useState, useEffect } from 'react';
import { apiUrl } from './config/api';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import TabPFNRiskPredictor from './components/TabPFNRiskPredictor';
import GemmaBushcraftWhisperer from './components/GemmaBushcraftWhisperer';
import PlantSafetyScanner from './components/PlantSafetyScanner';
import BackcountryLogbook from './components/BackcountryLogbook';
import AboutPage from './components/AboutPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [highVisMode, setHighVisMode] = useState(false);
  const [offlineBackcountryMode, setOfflineBackcountryMode] = useState(false);
  const [trailAlerts, setTrailAlerts] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [liveConditions, setLiveConditions] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // High-vis body class
  useEffect(() => {
    document.body.classList.toggle('high-vis-mode', highVisMode);
  }, [highVisMode]);

  // GPS + weather fetch
  const requestLocation = () => {
    if (!('geolocation' in navigator)) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
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
      (err) => { console.warn('GPS error:', err); setGpsLoading(false); }
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
              onRiskUpdate={setRiskData}
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

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        highVisMode={highVisMode}
        setHighVisMode={setHighVisMode}
        offlineBackcountryMode={offlineBackcountryMode}
        setOfflineBackcountryMode={setOfflineBackcountryMode}
        trailAlerts={trailAlerts}
      />

      <main className="page-content" role="main">
        <ErrorBoundary activeTab={activeTab} onReset={() => setActiveTab('home')}>
          {renderContent()}
        </ErrorBoundary>
      </main>
    </>
  );
}
