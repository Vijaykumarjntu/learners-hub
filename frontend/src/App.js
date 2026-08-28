import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  
  useEffect(() => {
    // CHANGE THIS LINE - use API_BASE_URL
    fetch(`${API_BASE_URL}/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} apiBaseUrl={API_BASE_URL} />} />
        <Route path="/signup" element={user ? <Navigate to="/onboarding" /> : <Signup setUser={setUser} apiBaseUrl={API_BASE_URL} />} />
        <Route path="/onboarding" element={!user ? <Navigate to="/login" /> : <Onboarding user={user} setUser={setUser} apiBaseUrl={API_BASE_URL} />} />
        <Route path="/dashboard" element={!user ? <Navigate to="/login" /> : <Dashboard user={user} setUser={setUser} apiBaseUrl={API_BASE_URL} />} />
        <Route path="/workspace/:projectId" element={!user ? <Navigate to="/login" /> : <Workspace user={user} apiBaseUrl={API_BASE_URL} />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;