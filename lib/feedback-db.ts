import { randomUUID } from 'node:crypto';
import { createClient, type Client } from '@libsql/client';

export type FeedbackInsert = {
  category: string;
  message: string;
  pair: number;
};

export type FeedbackRow = FeedbackInsert & {
  id: string;
  createdAt: string;
};

export type SqlClient = Pick<Client, 'execute'>;

export function createFeedbackStore(client: SqlClient) {
  const schemaReady = client.execute(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        message TEXT NOT NULL,
        pair INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

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

      await schemaReady;
      await client.execute(
        'INSERT INTO feedback (id, category, message, pair, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, category.slice(0, 100), message.slice(0, 1500), pair, createdAt]
      );

      return { id, category, message, pair, createdAt };
    },

    async list(): Promise<FeedbackRow[]> {
      await schemaReady;
      const result = await client.execute('SELECT id, category, message, pair, created_at AS createdAt FROM feedback ORDER BY created_at DESC');
      return result.rows.map((row) => ({
        id: String(row.id),
        category: String(row.category),
        message: String(row.message),
        pair: Number(row.pair),
        createdAt: String(row.createdAt),
      }));
    },
  };
}

let feedbackStore: ReturnType<typeof createFeedbackStore> | undefined;

export function getFeedbackStore() {
  if (feedbackStore) return feedbackStore;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not configured.');
  }

  feedbackStore = createFeedbackStore(createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }));
  return feedbackStore;
}
