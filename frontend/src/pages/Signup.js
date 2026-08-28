import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup({ setUser, apiBaseUrl }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    state: '',
    guild: 'fullstack'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const states = ['Maharashtra', 'Bihar', 'Uttar Pradesh', 'Tamil Nadu', 'Karnataka', 'Delhi', 'Rajasthan', 'Gujarat', 'West Bengal', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${apiBaseUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        const meRes = await fetch(`${apiBaseUrl}/me`, { credentials: 'include' });
        const meData = await meRes.json();
        setUser(meData);
        navigate('/onboarding');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h1>🚀 Join Tribe</h1>
      <p className="subtitle">Find your learning buddy today</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <select
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          required
        >
          <option value="">Select your state</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit">Create Account</button>
      </form>
      <div className="link">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Signup;