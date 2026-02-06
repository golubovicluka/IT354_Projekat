import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

function initDb() {
    const creatingTables = db.transaction(() => {
        db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('USER', 'ADMIN')) NOT NULL DEFAULT 'USER',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS scenarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                difficulty TEXT CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
                constraints TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS designs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                scenario_id INTEGER NOT NULL,
                diagram_data TEXT,
                text_explanation TEXT,
                status TEXT CHECK(status IN ('DRAFT', 'SUBMITTED', 'GRADED')) DEFAULT 'DRAFT',
                submitted_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS capacity_plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                design_id INTEGER NOT NULL,
                total_users INTEGER,
                daily_active_users INTEGER,
                storage_per_user_kb INTEGER,
                calculated_storage_tb REAL,
                calculated_servers_needed INTEGER,
                FOREIGN KEY (design_id) REFERENCES designs(id)
            )
        `).run();

        db.prepare(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                design_id INTEGER NOT NULL,
                admin_id INTEGER NOT NULL,
                rating INTEGER CHECK(rating BETWEEN 1 AND 5),
                comments TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (design_id) REFERENCES designs(id),
                FOREIGN KEY (admin_id) REFERENCES users(id)
            )
        `).run();
    });

    creatingTables();
}

export { db, initDb };
