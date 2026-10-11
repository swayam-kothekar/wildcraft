import React, { useState, useEffect } from 'react';

const QUICK_TOPICS = [
  { label: 'Bow Drill Fire',    q: 'How do I carve and build a Bow Drill friction fire?' },
  { label: 'A-Frame Shelter',   q: 'Step-by-step debris A-frame shelter insulation guide' },
  { label: 'Water Filter',      q: 'How to make a 3-stage bio-sand water filter in the wild' },
  { label: 'Bowline Knot',      q: 'How to tie a Bowline knot for rescue lines and bear bags' },
  { label: 'Poison Hemlock',    q: 'How to distinguish Poison Hemlock from Wild Carrot?' },
];

export default function GemmaBushcraftWhisperer({ riskData, offlineBackcountryMode, selectedTopic }) {
  const [prompt, setPrompt] = useState('');
  const [activeChip, setActiveChip] = useState(null);
  const [response, setResponse] = useState(null);
  const [voiceData, setVoiceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Audio player state & refs
  const audioRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);

  // Auto-fill if a plant topic was selected from Field Manual
  useEffect(() => {
    if (selectedTopic) {
      setPrompt(`Tell me about ${selectedTopic.name}: ${selectedTopic.identification_features}`);
    }
  }, [selectedTopic]);

  const askGemma = async (overridePrompt) => {
    const q = overridePrompt || prompt || 'Guide me through emergency wilderness shelter building';
    setLoading(true);
    setVoiceData(null);
    setIsPlaying(false);
    setUseFallbackTTS(false);

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    try {
      const res = await fetch('/api/survival-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_prompt: q,
          focus_topic: selectedTopic?.name ?? null,
          risk_data: riskData,
          offline_mode: offlineBackcountryMode,
        }),
      });
      const data = await res.json();
      setResponse(data);

      const vRes = await fetch('/api/synthesize-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.response }),
      });
      const vData = await vRes.json();
      setVoiceData(vData);

      if (vData.audio_url) {
        setIsPlaying(true);
      } else {
        setUseFallbackTTS(true);
        playBrowserTTS(data.response);
      }
    } catch {
      const fallbackResp = `Keep calm. ${q}. Put your phone in your pocket, listen to hands-free spoken audio, and focus on the trail.`;
      setResponse({
        response: fallbackResp,
        model: 'Gemma 2B (On-Device Edge)',
        execution: 'Offline Backcountry Mode',
        status: 'offline_backcountry',
      });
      setUseFallbackTTS(true);
      playBrowserTTS(fallbackResp);
    } finally {
      setLoading(false);
    }
  };

  const playBrowserTTS = (textToSpeak) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const txt = textToSpeak || response?.response;
      if (!txt) return;
      const u = new SpeechSynthesisUtterance(txt);
      u.rate = 0.95;
      u.onend = () => setIsPlaying(false);
      u.onerror = () => setIsPlaying(false);
      setIsPlaying(true);
      window.speechSynthesis.speak(u);
    }
  };

  const handlePlayPause = () => {
    if (voiceData?.audio_url && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (window.speechSynthesis) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        playBrowserTTS();
      }
    }
  };

  const handleRestart = () => {
    if (voiceData?.audio_url && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else if (window.speechSynthesis) {
      playBrowserTTS();
    }
  };

  return (
    <div className="section-wrap anim-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow">Google Gemma · ElevenLabs Voice · Open-Weight</div>
        <h2 className="section-title">Bushcraft AI Guide</h2>
        <p className="section-sub">
          Ask anything about survival, knots, shelter or foraging.
          {offlineBackcountryMode && <span style={{ color: 'var(--fern)', marginLeft: 8 }}>↑ Running on-device Gemma 2B.</span>}
        </p>
      </div>

      {/* Quick-topic chips */}
      <div className="chip-strip" style={{ marginBottom: 20 }}>
        {QUICK_TOPICS.map((t, i) => (
          <button
            key={i}
            className={`chip${activeChip === i ? ' active' : ''}`}
            onClick={() => {
              setActiveChip(i);
              setPrompt(t.q);
              askGemma(t.q);
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          className="field-input"
          style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}
          type="text"
          placeholder="Ask about fire starting, first aid, water purification…"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && askGemma()}
        />
        <button className="btn-primary" onClick={() => askGemma()} disabled={loading}
          style={{ minWidth: 130, borderRadius: 'var(--radius-sm)' }}>
          {loading ? '◌ Thinking…' : '↑ Ask Gemma'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="wc-card" style={{ padding: '24px 24px 20px' }}>
          {/* Model info row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="badge badge--green">{response.model}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--txt-low)', fontFamily: 'var(--mono)' }}>
              {response.execution}
            </span>
          </div>

          {/* Response text */}
          <div className="response-block" style={{ marginBottom: 20 }}>
            {response.response}
          </div>

          {/* Hidden audio element for ElevenLabs */}
          {voiceData?.audio_url && (
            <audio
              ref={audioRef}
              src={voiceData.audio_url}
              autoPlay
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}

          {/* Audio Transcript Controls Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 18px',
            background: 'var(--bg-void)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)',
            flexWrap: 'wrap',
          }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--txt-low)', marginBottom: 2 }}>
                Audio Transcript
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--fern)' }}>
                {voiceData?.provider || 'ElevenLabs / Browser Voice Stream'}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Play / Pause Button */}
            <button
              className="btn-primary"
              onClick={handlePlayPause}
              style={{ padding: '7px 16px', fontSize: '0.8rem', minWidth: 90 }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            {/* Restart Button */}
            <button
              className="btn-outline"
              onClick={handleRestart}
              style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            >
              ↺ Restart
            </button>

            <div style={{ fontSize: '0.7rem', color: 'var(--txt-ghost)', fontStyle: 'italic', maxWidth: 170, textAlign: 'right' }}>
              Hands-free audio mode
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
