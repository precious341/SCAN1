import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';
import { validateRegister, validateLogin } from '../validators/schemas.js';

export async function register(req, res) {
  try {
    const validation = validateRegister(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: { message: validation.errors[0], errors: validation.errors }
      });
    }

    const { full_name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: 'An account with this email address already exists.' }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr_${uuidv4()}`;

    await query(
      `INSERT INTO users (id, full_name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [userId, full_name.trim(), normalizedEmail, passwordHash]
    );

    // Establish session
    req.session.userId = userId;

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          full_name: full_name.trim(),
          email: normalizedEmail,
        }
      }
    });
  } catch (err) {
    console.error('[AuthController] Registration error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error processing registration.' }
    });
  }
}

export async function login(req, res) {
  try {
    const validation = validateLogin(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: { message: validation.errors[0] }
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const { rows } = await query(
      'SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email address or password.' }
      });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email address or password.' }
      });
    }

    req.session.userId = user.id;

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          created_at: user.created_at,
        }
      }
    });
  } catch (err) {
    console.error('[AuthController] Login error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error processing sign in.' }
    });
  }
}

export async function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('[AuthController] Logout error:', err);
      return res.status(500).json({
        success: false,
        error: { message: 'Could not log out. Please try again.' }
      });
    }
    res.clearCookie('medscan_sid');
    return res.json({ success: true, message: 'Logged out successfully.' });
  });
}

export async function getMe(req, res) {
  return res.json({
    success: true,
    data: {
      user: req.user
    }
  });
}

export async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { message: 'Please provide a valid email address.' }
    });
  }

  // Explicit, honest report as mandated by specification section 8
  return res.json({
    success: true,
    data: {
      message: 'SMTP email delivery service is currently not configured in this environment. For demo access, please use the test account credentials or create a new local account.'
    }
  });
}
