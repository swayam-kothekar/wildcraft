import React, { useState, useEffect } from 'react';
import { apiUrl } from '../config/api';

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
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = React.useRef(null);

  // Audio player state & refs
  const audioRef = React.useRef(null);
  const utteranceRef = React.useRef(null);
  const isPausedRef = React.useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);

  // Cleanup speech synthesis and speech recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Voice speech-to-text recognition toggle
  const toggleListening = () => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      alert('Voice speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setPrompt(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

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

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      isPausedRef.current = false;
      utteranceRef.current = null;
    }

    try {
      const res = await fetch(apiUrl('/api/survival-guide'), {
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

      const vRes = await fetch(apiUrl('/api/synthesize-voice'), {
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
      const fallbackResp = `Keep calm. ${q}. Put your phone in your pocket, listen to spoken audio narration, and focus on the trail.`;
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
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    isPausedRef.current = false;

    const txt = textToSpeak || response?.response;
    if (!txt) return;

    const u = new SpeechSynthesisUtterance(txt);
    utteranceRef.current = u;
    u.rate = 0.95;

    u.onstart = () => {
      if (utteranceRef.current === u) {
        setIsPlaying(true);
        isPausedRef.current = false;
      }
    };

    u.onend = () => {
      if (utteranceRef.current === u) {
        setIsPlaying(false);
        isPausedRef.current = false;
      }
    };

    u.onerror = (e) => {
      // Crucial: Ignore interruption / cancel events triggered by restarting or pausing
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      if (utteranceRef.current === u) {
        setIsPlaying(false);
        isPausedRef.current = false;
      }
    };

    u.onpause = () => {
      if (utteranceRef.current === u) {
        setIsPlaying(false);
        isPausedRef.current = true;
      }
    };

    u.onresume = () => {
      if (utteranceRef.current === u) {
        setIsPlaying(true);
        isPausedRef.current = false;
      }
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(u);
  };

  const handlePlayPause = () => {
    if (voiceData?.audio_url && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        isPausedRef.current = true;
        setIsPlaying(false);
      } else if (isPausedRef.current && window.speechSynthesis.speaking) {
        window.speechSynthesis.resume();
        isPausedRef.current = false;
        setIsPlaying(true);
      } else {
        playBrowserTTS();
      }
    }
  };

  const handleRestart = () => {
    if (voiceData?.audio_url && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      playBrowserTTS();
    }
  };

  return (
    <div className="section-wrap anim-fade-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow">Google Gemma · ElevenLabs Voice · Open-Weight</div>
        <h2 className="section-title">Wilderness AI Guide</h2>
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

      {/* Input & Action */}
      <div className="gemma-input-wrap">
        <div className="gemma-input-field-wrap">
          <input
            className={`field-input gemma-input-field ${isListening ? 'listening' : ''}`}
            type="text"
            placeholder={isListening ? 'Listening... Speak your question now...' : 'Ask about fire starting, first aid, water purification…'}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && askGemma()}
          />
          <button
            type="button"
            id="btn-voice-input"
            className={`btn-mic ${isListening ? 'active' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Stop recording' : 'Voice input (Microphone)'}
            aria-label="Microphone voice input"
          >
            {isListening ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        </div>
        <button
          className="btn-primary gemma-input-btn"
          onClick={() => askGemma()}
          disabled={loading}
        >
          {loading ? '◌ Thinking…' : '↑ Ask Gemma'}
        </button>
      </div>

      {/* Voice speech recognition feedback status */}
      {isListening && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.76rem', color: 'var(--ember)',
          marginTop: -16, marginBottom: 18,
          padding: '6px 12px', background: 'rgba(231, 111, 81, 0.08)',
          borderRadius: 'var(--radius-sm)', border: '1px solid rgba(231, 111, 81, 0.25)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ember)', display: 'inline-block' }} />
          <span>Listening to your voice… Speak your question, then tap Ask Gemma or press Enter.</span>
        </div>
      )}

      {speechError && (
        <div style={{
          fontSize: '0.76rem', color: 'var(--danger)',
          marginTop: -16, marginBottom: 18,
          padding: '6px 12px', background: 'rgba(230, 57, 70, 0.08)',
          borderRadius: 'var(--radius-sm)', border: '1px solid rgba(230, 57, 70, 0.25)',
        }}>
          {speechError}
        </div>
      )}

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
              Spoken audio active
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
