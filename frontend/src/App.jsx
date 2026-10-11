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
        try {
          const res = await fetch(apiUrl(`/api/wilderness-weather?lat=${lat}&lon=${lon}`));
          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('application/json')) {
            throw new Error(`Backend unavailable or returned non-JSON (status: ${res.status})`);
          }
          const d = await res.json();
          setLiveConditions(d);
        } catch (e) {
          console.warn('Backend weather endpoint unavailable, querying live Open-Meteo directly:', e);
          try {
            // Direct client-side Open-Meteo query (no API key required, public CORS)
            const omRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
            );
            const omData = await omRes.json();
            const curr = omData.current || {};
            setLiveConditions({
              status: 'live',
              latitude: lat,
              longitude: lon,
              elevation_m: omData.elevation ?? 50,
              ambient_temp_c: curr.temperature_2m,
              temperature_c: curr.temperature_2m,
              relative_humidity_pct: curr.relative_humidity_2m ?? 65.0,
              wind_speed_kmh: curr.wind_speed_10m ?? 10.0,
            });
          } catch (omErr) {
            console.warn('Weather fallback to default baseline:', omErr);
            setLiveConditions({
              status: 'fallback',
              latitude: lat,
              longitude: lon,
              elevation_m: 1450.0,
              ambient_temp_c: 8.0,
              temperature_c: 8.0,
              relative_humidity_pct: 65.0,
              wind_speed_kmh: 18.0,
            });
          }
        } finally {
          setGpsLoading(false);
        }
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
        {renderContent()}
      </main>
    </>
  );
}
