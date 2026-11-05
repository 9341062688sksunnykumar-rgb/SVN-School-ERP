import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";

/** Set ADMIN_USER_ID and ADMIN_PASSWORD as Render secret environment variables. */
export async function prepareAdminLogin() {
  // Existing production databases are preserved; only the missing login table is created.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id text NOT NULL UNIQUE,
      name text NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL,
      status text NOT NULL DEFAULT 'Active',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      admission_number text NOT NULL UNIQUE,
      name text NOT NULL,
      date_of_birth date NOT NULL,
      gender text NOT NULL,
      class_name text NOT NULL,
      section text NOT NULL,
      admission_date date NOT NULL,
      father_name text NOT NULL DEFAULT '',
      mother_name text NOT NULL DEFAULT '',
      guardian_phone text NOT NULL,
      address text NOT NULL,
      status text NOT NULL DEFAULT 'Active',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const userId = process.env.ADMIN_USER_ID?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!userId || !password) {
    console.warn('Admin setup skipped: configure ADMIN_USER_ID and ADMIN_PASSWORD in Render Environment.');
    return;
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must have at least 8 characters.');
  }
  const name = process.env.ADMIN_NAME?.trim() || 'School Administrator';
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (user_id, name, password_hash, role, status)
     VALUES ($1, $2, $3, 'Admin', 'Active')
     ON CONFLICT (user_id) DO NOTHING`,
    [userId, name, hash],
  );
  console.info('Admin login database ready.');
}


