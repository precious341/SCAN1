import bcrypt from 'bcryptjs';
import { query } from '../database/db.js';
import { validateProfileUpdate } from '../validators/schemas.js';

export async function getProfile(req, res) {
  try {
    const { rows } = await query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found.' }
      });
    }

    return res.json({
      success: true,
      data: {
        profile: rows[0]
      }
    });
  } catch (err) {
    console.error('[ProfileController] Get profile error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to retrieve profile.' }
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const validation = validateProfileUpdate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: { message: validation.errors[0] }
      });
    }

    const { full_name, current_password, new_password } = req.body;

    if (full_name) {
      await query(
        `UPDATE users SET full_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [full_name.trim(), req.user.id]
      );
    }

    // Password change verification
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password is required to change your password.' }
        });
      }
      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          error: { message: 'New password must be at least 8 characters long.' }
        });
      }

      const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      const valid = await bcrypt.compare(current_password, rows[0].password_hash);
      if (!valid) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password provided is incorrect.' }
        });
      }

      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash(new_password, salt);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user.id]);
    }

    const updated = await query('SELECT id, full_name, email, created_at FROM users WHERE id = $1', [req.user.id]);

    return res.json({
      success: true,
      data: {
        profile: updated.rows[0],
        message: 'Profile updated successfully.'
      }
    });
  } catch (err) {
    console.error('[ProfileController] Update error:', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error updating profile.' }
    });
  }
}
