const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

const SALT_ROUNDS = 12;

class AuthService {
  async register({ name, email, phone, password }) {
    const exists = await userRepository.existsByEmail(email);
    if (exists) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({ name, email, phone, passwordHash, role: 'CUSTOMER' });
    const token = this._generateToken(user);
    return { user, token };
  }

  async login({ email, password, requiredRole = null }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      throw err;
    }

    if (requiredRole && user.role !== requiredRole) {
      const err = new Error('Access denied. Insufficient privileges.');
      err.statusCode = 403;
      throw err;
    }

    // Strip password hash from response
    const { password_hash, ...safeUser } = user;
    const token = this._generateToken(safeUser);
    return { user: safeUser, token };
  }

  async getMe(userId) {
    return userRepository.findById(userId);
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthService();
