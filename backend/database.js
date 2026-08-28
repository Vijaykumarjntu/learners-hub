// backend/database.js - CommonJS version

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const db = new Database(path.join(__dirname, 'tribe.db'));

// Initialize database with schema
function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  console.log('✅ Database initialized');
}

// User functions
function createUser(email, password, name, state, guild) {
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name, state, guild)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(email, password, name, state, guild);
  return info.lastInsertRowid;
}

function findUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

function findUserById(id) {
  const stmt = db.prepare('SELECT id, email, name, state, guild, project_level FROM users WHERE id = ?');
  return stmt.get(id);
}

function updateUserState(id, state, guild) {
  const stmt = db.prepare('UPDATE users SET state = ?, guild = ? WHERE id = ?');
  return stmt.run(state, guild, id);
}

function updateUserProjectLevel(userId, level) {
  const stmt = db.prepare('UPDATE users SET project_level = ? WHERE id = ?');
  return stmt.run(level, userId);
}

// Buddy functions
function findAvailableBuddy(userId, state, guild) {
  const stmt = db.prepare(`
    SELECT id FROM users 
    WHERE guild = ? 
      AND state != ? 
      AND id != ?
      AND id NOT IN (SELECT user1_id FROM buddy_pairs)
      AND id NOT IN (SELECT user2_id FROM buddy_pairs)
    LIMIT 1
  `);
  return stmt.get(guild, state, userId);
}

function createBuddyPair(user1Id, user2Id) {
  const stmt = db.prepare(`
    INSERT INTO buddy_pairs (user1_id, user2_id)
    VALUES (?, ?)
  `);
  return stmt.run(user1Id, user2Id);
}

function getBuddyPair(userId) {
  const stmt = db.prepare(`
    SELECT * FROM buddy_pairs 
    WHERE user1_id = ? OR user2_id = ?
  `);
  return stmt.get(userId, userId);
}

function getBuddyDetails(userId) {
  const pair = getBuddyPair(userId);
  if (!pair) return null;
  
  const buddyId = pair.user1_id === userId ? pair.user2_id : pair.user1_id;
  const buddy = findUserById(buddyId);
  
  return {
    buddy: buddy,
    pair: pair
  };
}

// Project functions
function getProjectsByGuild(guild) {
  const stmt = db.prepare(`
    SELECT * FROM projects WHERE guild = ? ORDER BY project_number
  `);
  return stmt.all(guild);
}

function getProjectById(id) {
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  return stmt.get(id);
}

// Chat functions
function saveMessage(projectId, userId, message) {
  const stmt = db.prepare(`
    INSERT INTO chat_messages (project_id, user_id, message)
    VALUES (?, ?, ?)
  `);
  return stmt.run(projectId, userId, message);
}

function getMessages(projectId) {
  const stmt = db.prepare(`
    SELECT cm.*, u.name 
    FROM chat_messages cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.project_id = ?
    ORDER BY cm.sent_at ASC
  `);
  return stmt.all(projectId);
}

// Submission functions
function submitProject(userId, projectId, githubUrl) {
  const stmt = db.prepare(`
    INSERT INTO submissions (user_id, project_id, github_url)
    VALUES (?, ?, ?)
  `);
  return stmt.run(userId, projectId, githubUrl);
}

function getSubmission(userId, projectId) {
  const stmt = db.prepare(`
    SELECT * FROM submissions 
    WHERE user_id = ? AND project_id = ?
  `);
  return stmt.get(userId, projectId);
}

function getSubmissionsByUser(userId) {
  const stmt = db.prepare(`
    SELECT s.*, p.title 
    FROM submissions s
    JOIN projects p ON s.project_id = p.id
    WHERE s.user_id = ?
  `);
  return stmt.all(userId);
}

module.exports = {
  db,
  initDatabase,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserState,
  updateUserProjectLevel,
  findAvailableBuddy,
  createBuddyPair,
  getBuddyPair,
  getBuddyDetails,
  getProjectsByGuild,
  getProjectById,
  saveMessage,
  getMessages,
  submitProject,
  getSubmission,
  getSubmissionsByUser
};