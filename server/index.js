const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { createHash, randomBytes, randomUUID, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
require('dotenv').config();

const scrypt = promisify(scryptCallback);
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;
const accountColumns = 'user_id, full_name, email, role, phone, business_name, farm_name, location, province, services';
const joinedAccountColumns = 'u.user_id, u.full_name, u.email, u.role, u.phone, u.business_name, u.farm_name, u.location, u.province, u.services';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

function publicAccount(row) {
  return {
    id: row.user_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    phone: row.phone || '',
    businessName: row.business_name || undefined,
    farmName: row.farm_name || undefined,
    location: row.location || '',
    province: row.province || '',
    services: row.services || [],
  };
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = await scrypt(password, salt, 64);
  return { salt, hash: Buffer.from(hash).toString('hex') };
}

async function passwordMatches(password, salt, expectedHash) {
  const { hash } = await hashPassword(password, salt);
  const actual = Buffer.from(hash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function createSession(userId) {
  const token = randomBytes(32).toString('base64url');
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + sessionLifetimeMs);
  await pool.query(
    'INSERT INTO app_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [tokenHash, userId, expiresAt],
  );
  return { token, tokenHash };
}

async function requireAccount(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sign in to continue.' });

  const tokenHash = hashSessionToken(token);
  const result = await pool.query(
    `SELECT ${joinedAccountColumns}, s.token_hash
     FROM app_sessions s JOIN app_users u ON u.user_id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [tokenHash],
  );
  if (!result.rowCount) return res.status(401).json({ error: 'Your session has expired. Sign in again.' });

  req.account = publicAccount(result.rows[0]);
  req.sessionHash = tokenHash;
  next();
}

app.post('/api/auth/register', async (req, res) => {
  const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const role = req.body?.role;

  if (fullName.length < 2 || fullName.length > 120) return res.status(400).json({ error: 'Enter a name between 2 and 120 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8 || password.length > 256) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (!['farmer', 'operator'].includes(role)) return res.status(400).json({ error: 'Choose a farm owner or operator account.' });

  try {
    const credentials = await hashPassword(password);
    const userId = randomUUID();
    const result = await pool.query(
      `INSERT INTO app_users (user_id, full_name, email, password_salt, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${accountColumns}`,
      [userId, fullName, email, credentials.salt, credentials.hash, role],
    );
    const session = await createSession(userId);
    res.status(201).json({ token: session.token, user: publicAccount(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account already uses that email address.' });
    console.error('Account registration failed:', error.message);
    res.status(500).json({ error: 'Could not create your account right now.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) return res.status(400).json({ error: 'Enter your email and password.' });

  try {
    const result = await pool.query(
      `SELECT ${accountColumns}, password_salt, password_hash
       FROM app_users WHERE email = $1`,
      [email],
    );
    const account = result.rows[0];
    if (!account || !(await passwordMatches(password, account.password_salt, account.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    const session = await createSession(account.user_id);
    res.json({ token: session.token, user: publicAccount(account) });
  } catch (error) {
    console.error('Account sign-in failed:', error.message);
    res.status(500).json({ error: 'Could not sign in right now.' });
  }
});

app.get('/api/account', requireAccount, (req, res) => {
  res.json({ user: req.account });
});

app.patch('/api/account', requireAccount, async (req, res) => {
  const allowedFields = {
    fullName: 'full_name',
    email: 'email',
    phone: 'phone',
    location: 'location',
    province: 'province',
    businessName: 'business_name',
    farmName: 'farm_name',
  };
  const updates = Object.entries(allowedFields)
    .filter(([key]) => Object.prototype.hasOwnProperty.call(req.body || {}, key))
    .map(([key, column]) => [column, req.body[key]]);

  if (!updates.length) return res.status(400).json({ error: 'There are no account details to update.' });
  for (const [column, value] of updates) {
    if (typeof value !== 'string' || value.length > (column === 'email' ? 254 : 160)) {
      return res.status(400).json({ error: 'Check the account details and try again.' });
    }
  }
  const name = updates.find(([column]) => column === 'full_name')?.[1];
  if (name !== undefined && name.trim().length < 2) return res.status(400).json({ error: 'Enter a name with at least 2 characters.' });
  const emailUpdate = updates.find(([column]) => column === 'email');
  if (emailUpdate) {
    emailUpdate[1] = emailUpdate[1].trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailUpdate[1])) return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  const values = [req.account.id];
  const assignments = updates.map(([column, value]) => {
    values.push(column === 'full_name' || column === 'email' ? value.trim() : value.trim());
    return `${column} = $${values.length}`;
  });
  try {
    const result = await pool.query(
      `UPDATE app_users SET ${assignments.join(', ')}, updated_at = NOW()
       WHERE user_id = $1 RETURNING ${accountColumns}`,
      values,
    );
    res.json({ user: publicAccount(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'An account already uses that email address.' });
    console.error('Account update failed:', error.message);
    res.status(500).json({ error: 'Could not update your account right now.' });
  }
});

app.post('/api/account/password', requireAccount, async (req, res) => {
  const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
  const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';
  if (newPassword.length < 8 || newPassword.length > 256) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

  try {
    const result = await pool.query('SELECT password_salt, password_hash FROM app_users WHERE user_id = $1', [req.account.id]);
    if (!(await passwordMatches(currentPassword, result.rows[0].password_salt, result.rows[0].password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const credentials = await hashPassword(newPassword);
    await pool.query(
      'UPDATE app_users SET password_salt = $2, password_hash = $3, updated_at = NOW() WHERE user_id = $1',
      [req.account.id, credentials.salt, credentials.hash],
    );
    await pool.query('DELETE FROM app_sessions WHERE user_id = $1 AND token_hash <> $2', [req.account.id, req.sessionHash]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Password update failed:', error.message);
    res.status(500).json({ error: 'Could not update your password right now.' });
  }
});

app.post('/api/auth/logout', requireAccount, async (req, res) => {
  await pool.query('DELETE FROM app_sessions WHERE token_hash = $1', [req.sessionHash]);
  res.json({ ok: true });
});

async function startDatabase() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        user_id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('farmer', 'operator')),
        phone TEXT NOT NULL DEFAULT '',
        business_name TEXT,
        farm_name TEXT,
        location TEXT NOT NULL DEFAULT '',
        province TEXT NOT NULL DEFAULT '',
        services JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS app_sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS app_sessions_user_id_idx ON app_sessions(user_id);
    `);
    console.log('Connected to Neon PostgreSQL database.');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as database_name');
    res.json({
      ok: true,
      timestamp: result.rows[0].now,
      database: result.rows[0].database_name,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Database query failed',
      error: error.message,
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as database_name');
    res.json({
      ok: true,
      timestamp: result.rows[0].now,
      database: result.rows[0].database_name,
      service: 'AgriDrone API',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Database query failed',
      error: error.message,
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'AgriDrone API',
    status: 'running',
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as database_name');
    res.json({
      ok: true,
      service: 'AgriDrone API',
      database: result.rows[0].database_name,
      timestamp: result.rows[0].now,
      mode: 'demo',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: 'AgriDrone API',
      error: error.message,
    });
  }
});

async function shutdown() {
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startDatabase();

app.listen(port, () => {
  console.log(`AgriDrone server running on http://localhost:${port}`);
});
