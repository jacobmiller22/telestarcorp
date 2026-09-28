-- Sample database seed for local development and preview environments
INSERT OR IGNORE INTO items (id, title, description, created_at, updated_at) VALUES
('item-1', 'First Edge Entity', 'Created automatically by template seeder.', datetime('now'), datetime('now')),
('item-2', 'Second Edge Entity', 'Demonstrating D1 SQLite relational queries on Workers.', datetime('now'), datetime('now')),
('item-3', 'Third Edge Entity', 'Verified via local SQLite and Miniflare emulation.', datetime('now'), datetime('now'));
