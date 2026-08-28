-- backend/schema.sql

DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS buddy_pairs;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  guild TEXT NOT NULL,
  project_level INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buddy_pairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  project_id INTEGER DEFAULT 1,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id),
  FOREIGN KEY (user2_id) REFERENCES users(id)
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild TEXT NOT NULL,
  project_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_link TEXT,
  github_starter TEXT
);

CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  github_url TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed BOOLEAN DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert default projects
INSERT OR IGNORE INTO projects (guild, project_number, title, description) VALUES
('fullstack', 1, 'Web3 Login', 'Build a "Sign in with Ethereum" button using MetaMask'),
('fullstack', 2, 'Wallet Dashboard', 'Show ETH balance and transaction history'),
('fullstack', 3, 'ERC-20 Token Dashboard', 'Transfer tokens and approve spending'),
('fullstack', 4, 'NFT Minting dApp', 'Connect wallet, mint NFT, view image'),
('fullstack', 5, 'Crowdfunding Platform', 'Create campaigns, donate, withdraw'),
('fullstack', 6, 'DAO Proposal Dashboard', 'Create proposals, vote, execute'),
('fullstack', 7, 'Transaction Simulator', 'Simulate a swap before signing'),
('fullstack', 8, 'NFT Marketplace', 'Full marketplace with listing and buying'),
('defi', 1, 'AMM (x*y=k)', 'Build a barebones Uniswap clone'),
('defi', 2, 'Liquidity Pool + LP Token', 'Add/remove liquidity, earn rewards'),
('defi', 3, 'Stablecoin', 'Over-collateralized stablecoin like DAI'),
('defi', 4, 'Lending Protocol', 'Supply assets, earn interest'),
('defi', 5, 'Borrowing + Liquidation', 'Borrow against collateral, health factor'),
('defi', 6, 'Yield Aggregator', 'Auto-compound rewards'),
('defi', 7, 'Token Vesting Contract', 'Linear cliff/unlock for team tokens'),
('defi', 8, 'DeFi Protocol', 'Combine AMM + Lending'),
('security', 1, 'Re-entrancy Attack Lab', 'Vulnerable vault + Exploit script'),
('security', 2, 'Oracle Manipulation Lab', 'Flashloan attack to manipulate price'),
('security', 3, 'Access Control Exploit', 'Role-based hacking simulation'),
('security', 4, 'Secure Protocol Rewrite', 'Audit + patch a vulnerable protocol');