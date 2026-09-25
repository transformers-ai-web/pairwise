import sqlite3 from 'sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

export type FeedbackInsert = {
  category: string;
  message: string;
  pair: number;
};

export type FeedbackRow = FeedbackInsert & {
  id: string;
  createdAt: string;
};

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'feedback.sqlite');

export function createFeedbackStore(options: { dbPath?: string } = {}) {
  const dbPath = options.dbPath ?? DEFAULT_DB_PATH;
  mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        pair INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  });

  return {
    async insert(input: FeedbackInsert): Promise<FeedbackRow> {
      const category = input.category.trim();
      const message = input.message.trim();
      const pair = Number.isFinite(input.pair) ? Math.max(0, Number(input.pair)) : 0;

      if (!category || !message) {
        throw new Error('Feedback requires both a category and a message.');
      }

      const id = randomUUID();
      const createdAt = new Date().toISOString();

      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO feedback (id, category, message, pair, created_at) VALUES (?, ?, ?, ?, ?)',
          [id, category.slice(0, 100), message.slice(0, 1500), pair, createdAt],
          (error) => error ? reject(error) : resolve()
        );
      });

      return { id, category, message, pair, createdAt };
    },

    async list(): Promise<FeedbackRow[]> {
      return new Promise((resolve, reject) => {
        db.all(
          'SELECT id, category, message, pair, created_at AS createdAt FROM feedback ORDER BY created_at DESC',
          (error, rows: Array<{ id: string; category: string; message: string; pair: number; createdAt: string }>) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(rows.map((row) => ({
              id: row.id,
              category: row.category,
              message: row.message,
              pair: row.pair,
              createdAt: row.createdAt,
            })));
          }
        );
      });
    },

    close(): Promise<void> {
      return new Promise((resolve, reject) => {
        db.close((error) => error ? reject(error) : resolve());
      });
    },
  };
}

export const feedbackStore = createFeedbackStore();
