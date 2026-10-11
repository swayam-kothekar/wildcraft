import React, { useState, useEffect } from 'react';
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
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        fetch(`/api/wilderness-weather?lat=${lat}&lon=${lon}`)
          .then(r => r.json())
          .then(d => setLiveConditions(d))
          .catch(e => console.warn('Weather fetch:', e))
          .finally(() => setGpsLoading(false));
      },
      (err) => { console.warn('GPS error:', err); setGpsLoading(false); }
    );
  };

  // Initial data load
  useEffect(() => {
    requestLocation();
    fetch('/api/trail-alerts')
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
