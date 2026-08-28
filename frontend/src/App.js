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

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
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
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} />
        <Route path="/signup" element={user ? <Navigate to="/onboarding" /> : <Signup setUser={setUser} />} />
        <Route path="/onboarding" element={!user ? <Navigate to="/login" /> : <Onboarding user={user} setUser={setUser} />} />
        <Route path="/dashboard" element={!user ? <Navigate to="/login" /> : <Dashboard user={user} setUser={setUser} />} />
        <Route path="/workspace/:projectId" element={!user ? <Navigate to="/login" /> : <Workspace user={user} />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;