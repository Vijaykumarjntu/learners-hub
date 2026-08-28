import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

function Workspace({ user }) {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [buddy, setBuddy] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchWorkspaceData();
    const interval = setInterval(fetchWorkspaceData, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchWorkspaceData = async () => {
    try {
      const res = await fetch(`/api/workspace/${projectId}`, { credentials: 'include' });
      const data = await res.json();
      setProject(data.project);
      setMessages(data.messages);
      setBuddy(data.buddy);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId: parseInt(projectId), message: newMessage })
      });
      setNewMessage('');
      fetchWorkspaceData(); // Refresh messages
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (loading) return <div className="loading">Loading workspace...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  return (
    <div className="workspace-container">
      {/* Top Bar */}
      <div className="workspace-topbar">
        <Link to="/dashboard" className="back-btn">← Back</Link>
        <span className="project-title">📝 {project.title}</span>
        <span className="buddy-name">
          {buddy ? `👤 ${buddy.name}` : 'No buddy assigned'}
        </span>
      </div>

      {/* Main Workspace */}
      <div className="workspace-main">
        {/* Code Editor */}
        <div className="workspace-editor">
          <iframe
            src="https://codesandbox.io/embed/github?view=editor"
            title="Code Editor"
          />
        </div>

        {/* Chat */}
        <div className="workspace-chat">
          <div className="chat-header">💬 Chat with your buddy</div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center', marginTop: '40px' }}>
                No messages yet. Say hello to your buddy!
              </p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="chat-message">
                  <span className="sender">
                    {msg.user_id === user.id ? 'You' : msg.name}
                  </span>
                  <span className="text">{msg.message}</span>
                  <span className="time">
                    {new Date(msg.sent_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Workspace;