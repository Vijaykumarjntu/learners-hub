import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding({ user, setUser }) {
  const [guild, setGuild] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const guilds = [
    { id: 'fullstack', name: 'Full-Stack Web3', emoji: '🌐', desc: 'Build dApps with React + Solidity' },
    { id: 'defi', name: 'DeFi Engineer', emoji: '💰', desc: 'Build AMMs, Lending, and Yield protocols' },
    { id: 'security', name: 'Smart Contract Security', emoji: '🔴', desc: 'Hack and audit smart contracts' }
  ];

  const handleSubmit = async () => {
    if (!guild) return;
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ state: user.state, guild })
      });

      const data = await res.json();
      if (data.success) {
        // Refresh user data
        const meRes = await fetch('/api/me', { credentials: 'include' });
        const meData = await meRes.json();
        setUser(meData);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <h2>🎯 Choose Your Tribe</h2>
      <p className="subtitle">Pick the guild that matches your career goal</p>

      <div className="guild-grid">
        {guilds.map(g => (
          <div
            key={g.id}
            className={`guild-card ${guild === g.id ? 'selected' : ''}`}
            onClick={() => setGuild(g.id)}
          >
            <span className="emoji">{g.emoji}</span>
            <h4>{g.name}</h4>
            <p>{g.desc}</p>
          </div>
        ))}
      </div>

      <p style={{ color: '#888', fontSize: '14px', marginBottom: '16px' }}>
        📍 Your state: <strong>{user.state || 'Not set'}</strong>
      </p>

      <button
        onClick={handleSubmit}
        disabled={!guild || loading}
        style={{
          width: '100%',
          padding: '12px',
          background: guild ? '#6c5ce7' : '#2a2a4a',
          border: 'none',
          borderRadius: '8px',
          color: guild ? '#fff' : '#888',
          fontSize: '16px',
          fontWeight: '600',
          cursor: guild ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}
      >
        {loading ? 'Finding your buddy...' : 'Find My Tribe'}
      </button>
    </div>
  );
}

export default Onboarding;