/**
 * Input validation helpers for MedScan API
 */

export function validateRegister(body) {
  const errors = [];
  const { full_name, email, password, confirm_password } = body || {};

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  if (password !== confirm_password) {
    errors.push('Passwords do not match.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLogin(body) {
  const errors = [];
  const { email, password } = body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateProfileUpdate(body) {
  const errors = [];
  const { full_name } = body || {};

  if (full_name !== undefined) {
    if (typeof full_name !== 'string' || full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
