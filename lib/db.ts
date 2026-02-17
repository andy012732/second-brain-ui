import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 確保 data 目錄存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'mission-control.db');
const db = new Database(dbPath);

// 啟用 WAL 模式提升併發效能
db.pragma('journal_mode = WAL');

// 初始化資料表
db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL, -- task, note, research, system...
    title TEXT NOT NULL,
    description TEXT,
    details TEXT, -- JSON 格式
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cron_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    expression TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT 1,
    last_run DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
  CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at);
`);

export default db;
