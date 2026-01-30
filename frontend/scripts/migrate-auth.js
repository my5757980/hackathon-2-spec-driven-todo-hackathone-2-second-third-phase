// Script to create Better Auth tables in PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_nvgU7XFKPl6e@ep-ancient-voice-a1xi0a8a-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

const migrationSQL = `
-- Better Auth Required Tables

-- Create user table
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create session table
CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id_idx ON "session"(user_id);

-- Create account table
CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMP,
    refresh_token_expires_at TIMESTAMP,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS account_user_id_idx ON "account"(user_id);

-- Create verification table
CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON "verification"(identifier);
`;

async function migrate() {
  console.log('Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('Running Better Auth migrations...');
    await client.query(migrationSQL);
    console.log('Better Auth tables created successfully!');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('user', 'session', 'account', 'verification')
      ORDER BY table_name;
    `);

    console.log('Created tables:', result.rows.map(r => r.table_name).join(', '));
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
