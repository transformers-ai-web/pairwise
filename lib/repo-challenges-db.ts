import { getPool } from './progress-db';
import { sampleRepoChallenge, type RepoChallenge } from './repo-challenges';

const globalForRepoChallenges = globalThis as typeof globalThis & {
  repoChallengesSchemaReady?: Promise<void>;
};

function isLocalPreview() {
  return !process.env.DATABASE_URL?.trim()
    && !['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'].some(key => process.env[key]);
}

async function ensureSchema() {
  if (!globalForRepoChallenges.repoChallengesSchemaReady) {
    globalForRepoChallenges.repoChallengesSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS repo_challenges (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK (type = 'repo_challenge'),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
          skills TEXT[] NOT NULL,
          repo_url TEXT NOT NULL,
          base_commit TEXT NOT NULL,
          duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
          status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived'))
        )
      `);
      const challenge = sampleRepoChallenge;
      await pool.query(
        `INSERT INTO repo_challenges
          (id, type, title, description, difficulty, skills, repo_url, base_commit, duration_minutes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [challenge.id, challenge.type, challenge.title, challenge.description, challenge.difficulty,
          challenge.skills, challenge.repo_url, challenge.base_commit, challenge.duration_minutes, challenge.status],
      );
    })().catch(error => {
      globalForRepoChallenges.repoChallengesSchemaReady = undefined;
      throw error;
    });
  }
  await globalForRepoChallenges.repoChallengesSchemaReady;
}

export async function listRepoChallenges(): Promise<RepoChallenge[]> {
  if (isLocalPreview()) return [sampleRepoChallenge];
  await ensureSchema();
  const result = await getPool().query<RepoChallenge>(
    "SELECT * FROM repo_challenges WHERE status = 'published' ORDER BY title, id",
  );
  return result.rows;
}

export async function getRepoChallenge(id: string): Promise<RepoChallenge | null> {
  if (isLocalPreview()) return id === sampleRepoChallenge.id ? sampleRepoChallenge : null;
  await ensureSchema();
  const result = await getPool().query<RepoChallenge>(
    "SELECT * FROM repo_challenges WHERE id = $1 AND status = 'published'",
    [id],
  );
  return result.rows[0] ?? null;
}
