import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard({ user, setUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard', { credentials: 'include' });
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  const handleSubmit = async (projectId, githubUrl) => {
    const url = prompt('Enter your GitHub repository URL:');
    if (!url) return;

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId, githubUrl: url })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboard(); // Refresh
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  if (loading) return <div className="loading">Loading your dashboard...</div>;
  if (!dashboardData) return <div className="loading">No data found</div>;

  const { buddy, projects, submissions, hasBuddy } = dashboardData;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="logo">🏕️ Tribe</div>
        <div className="user-info">
          <span className="name">👋 {user.name}</span>
          <span className="state-badge">{user.state}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Buddy Section */}
      {hasBuddy ? (
        <div className="buddy-section">
          <div className="buddy-info">
            <div className="buddy-avatar">
              {buddy.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="buddy-name">🤝 {buddy.name}</div>
              <div className="buddy-state">📍 {buddy.state}</div>
            </div>
            <div className="status">● Online</div>
          </div>
        </div>
      ) : (
        <div className="no-buddy">
          <p>⏳ Waiting for a buddy to join...</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            We'll notify you when someone from another state joins your guild.
          </p>
        </div>
      )}

      {/* Projects */}
      <h2 style={{ marginBottom: '8px' }}>📚 Your Projects</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>
        Complete all 8 projects to become job-ready
      </p>

      <div className="projects-grid">
        {projects.map((project, index) => {
          const isCompleted = submissions.find(s => s.projectId === project.id)?.completed;
          const isLocked = index > 0 && !submissions.find(s => s.projectId === projects[index - 1].id)?.completed;

          return (
            <div key={project.id} className="project-card" style={{ opacity: isLocked ? 0.5 : 1 }}>
              <div className="number">Project {project.project_number}</div>
              <h4>{project.title}</h4>
              <p>{project.description}</p>

              {isCompleted ? (
                <div className="completed-badge">✅ Completed</div>
              ) : isLocked ? (
                <div style={{ color: '#888', fontSize: '13px' }}>
                  🔒 Complete previous project first
                </div>
              ) : (
                <div className="actions">
                  <Link to={`/workspace/${project.id}`} className="btn btn-primary">
                    Open Workspace
                  </Link>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleSubmit(project.id)}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;