// backend/server.js

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');

// Import database functions
const db = require('./database');

const app = express();
const PORT = 5000;

// ============ MIDDLEWARE ============
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'tribe-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

// Initialize database
db.initDatabase();

// ============ AUTH ROUTES ============

// Signup
app.post('/api/signup', async (req, res) => {
  const { email, password, name, state, guild } = req.body;

  // Validate
  if (!email || !password || !name || !state || !guild) {
    return res.status(400).json({ error: 'All fields required' });
  }

  // Check if user exists
  const existingUser = db.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userId = db.createUser(email, hashedPassword, name, state, guild);
    req.session.userId = userId;
    res.json({ success: true, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  res.json({ 
    success: true, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      state: user.state,
      guild: user.guild,
      projectLevel: user.project_level
    }
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get current user
app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.findUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    state: user.state,
    guild: user.guild,
    projectLevel: user.project_level
  });
});

// ============ ONBOARDING ROUTES ============

// Save onboarding data and find buddy
app.post('/api/onboarding', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { state, guild } = req.body;
  const userId = req.session.userId;

  // Update user
  db.updateUserState(userId, state, guild);

  // Find buddy
  const user = db.findUserById(userId);
  const buddy = db.findAvailableBuddy(userId, state, guild);

  let buddyId = null;
  if (buddy) {
    db.createBuddyPair(userId, buddy.id);
    buddyId = buddy.id;
  }

  res.json({ 
    success: true, 
    buddyId,
    message: buddy ? 'Buddy found!' : 'No buddy available. You are in waiting pool.'
  });
});

// ============ DASHBOARD ROUTES ============

// Get dashboard data
app.get('/api/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = req.session.userId;
  const user = db.findUserById(userId);
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Get buddy details
  const buddyData = db.getBuddyDetails(userId);
  let buddy = null;
  if (buddyData) {
    buddy = buddyData.buddy;
  }

  // Get projects
  const projects = db.getProjectsByGuild(user.guild);

  // Get completed projects (submissions)
  const submissions = projects.map(p => {
    const sub = db.getSubmission(userId, p.id);
    return {
      projectId: p.id,
      completed: !!sub,
      githubUrl: sub ? sub.github_url : null
    };
  });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      state: user.state,
      guild: user.guild,
      projectLevel: user.project_level
    },
    buddy,
    projects,
    submissions,
    hasBuddy: !!buddy
  });
});

// ============ WORKSPACE ROUTES ============

// Get project details + chat messages
app.get('/api/workspace/:projectId', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const projectId = parseInt(req.params.projectId);
  const userId = req.session.userId;

  const project = db.getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const messages = db.getMessages(projectId);
  const user = db.findUserById(userId);
  const buddyData = db.getBuddyDetails(userId);

  res.json({
    project,
    messages,
    user: { id: user.id, name: user.name },
    buddy: buddyData ? buddyData.buddy : null
  });
});

// Send chat message
app.post('/api/chat', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { projectId, message } = req.body;
  const userId = req.session.userId;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  db.saveMessage(projectId, userId, message.trim());
  res.json({ success: true });
});

// ============ SUBMISSION ROUTES ============

// Submit project
app.post('/api/submit', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { projectId, githubUrl } = req.body;
  const userId = req.session.userId;

  if (!githubUrl || !githubUrl.includes('github.com')) {
    return res.status(400).json({ error: 'Valid GitHub URL required' });
  }

  // Check if already submitted
  const existing = db.getSubmission(userId, projectId);
  if (existing) {
    return res.status(400).json({ error: 'Project already submitted' });
  }

  db.submitProject(userId, projectId, githubUrl);

  // Update user's project level
  const user = db.findUserById(userId);
  if (user.project_level <= projectId) {
    db.updateUserProjectLevel(userId, projectId + 1);
  }

  res.json({ success: true, message: 'Project submitted!' });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`🚀 Tribe server running on http://localhost:${PORT}`);
});