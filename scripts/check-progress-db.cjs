const { loadEnvConfig } = require('@next/env');
const { Pool } = require('pg');
loadEnvConfig(process.cwd());
const e = process.env;
const pool = new Pool(e.DATABASE_URL ? { connectionString: e.DATABASE_URL, ssl: true, connectionTimeoutMillis: 5000 } : { host: e.DB_HOST, port: Number(e.DB_PORT || 5432), database: e.DB_NAME, user: e.DB_USER, password: e.DB_PASSWORD, connectionTimeoutMillis: 5000 });
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection OK');
    const result = await pool.query("SELECT conname, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conrelid=to_regclass('user_progress')");
    console.log(result.rows);
  } catch (error) {
    console.error({ code: error.code, message: error.message });
    process.exitCode = 1;
  } finally { await pool.end(); }
})();
