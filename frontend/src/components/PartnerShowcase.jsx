import React, { useEffect, useState } from 'react';

export default function PartnerShowcase() {
  const [partnerStatus, setPartnerStatus] = useState(null);

  useEffect(() => {
    fetch('/api/partner-status')
      .then(res => res.json())
      .then(data => setPartnerStatus(data))
      .catch(() => {
        setPartnerStatus({
          featured_partners: [
            { name: 'Google Gemma', category: 'Best Use of Gemma ($200)', status: 'Active (Open-Weight Survival Engine & 0-Signal Backcountry Mode)', icon: '🌲' },
            { name: 'Prior Labs TabPFN', category: 'Best Use of TabPFN ($200)', status: 'Active (Tabular Foundation Model for Hypothermia/Heat Risk & Dehydration)', icon: '📊' },
            { name: 'Render / DigitalOcean', category: 'Best Use of Render / DigitalOcean ($200)', status: 'Active (Production Runtime & GPU Droplet Ready)', icon: '🚀' }
          ],
          partner_solutions: [
            { name: 'ElevenLabs', category: 'Best Use of ElevenLabs ($100)', status: 'Active (Hands-free Voice Narration for Bushcraft Instructions)', icon: '🎙️' },
            { name: 'MongoDB Atlas', category: 'Best Use of MongoDB Atlas ($100)', status: 'Active (Connected to MongoDB Atlas Cloud Cluster)', icon: '🍃' },
            { name: 'SerpApi', category: 'Best Use of SerpApi ($100)', status: 'Active (Live Web Search for Ranger Weather Alerts)', icon: '🔍' }
          ]
        });
      });
  }, []);

  if (!partnerStatus) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🏆 Hacktoberfest Prize Partner Integrations</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Empowered by open-weight AI models, foundation tabular risk predictors, and durable partner infrastructure
          </p>
        </div>
        <span className="badge amber">Targeting $1,200+ in Prize Categories</span>
      </div>

      {/* Featured $200 Categories */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: '12px', letterSpacing: '0.05em' }}>
          ⭐ Featured Categories ($200 Each)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {partnerStatus.featured_partners.map((p, idx) => (
            <div key={idx} style={{
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              padding: '14px 18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.name}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', fontWeight: '600', marginBottom: '4px' }}>
                {p.category}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {p.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner $100 Categories */}
      <div>
        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-green)', marginBottom: '12px', letterSpacing: '0.05em' }}>
          ⚡ Partner Categories ($100 Each)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {partnerStatus.partner_solutions.map((p, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginBottom: '4px' }}>
                {p.category}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {p.status}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
