import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthResource from '../resources/AuthResource.js';
import connect from '../db.js';

export default class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET;
  }

  /**
   * Register a new user
   * @param {Object} data - User registration data
   * @returns {Promise<Object>} - User data and token if successful
   * @throws {Error} - If registration fails
   */
  async registerUser({ name, email, password }) {
    const existingUser = await this.withConnection(() =>
      User.findOne({ email })
    );

    if (existingUser) {
      const error = new Error('Email already registered');
      error.status = 409;
      error.details = {
        success: false,
        error: 'Email already registered',
        message: 'An account with this email already exists. Please use a different email or try logging in.'
      };
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.withConnection(() =>
      User.create({ name, email, password: hashedPassword })
    );

    const token = this.generateToken(user._id);
    
    return {
      success: true,
      resource: {
        ...new AuthResource(user).toArray(),
        token
      }
    };
  }

  /**
   * Authenticate a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User data and token if authentication is successful
   * @throws {Error} - If authentication fails
   */
  async loginUser(email, password) {
    const user = await this.withConnection(() =>
      User.findOne({ email }).select('+password')
    );

    if (!user) {
      const error = new Error('Authentication failed');
      error.status = 401;
      error.details = {
        success: false,
        error: 'Authentication failed',
        message: 'No account found with this email. Please check your email or register for a new account.'
      };
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Authentication failed');
      error.status = 401;
      error.details = {
        success: false,
        error: 'Authentication failed',
        message: 'Incorrect password. Please try again.'
      };
      throw error;
    }

    if (!this.JWT_SECRET) {
      const error = new Error('JWT configuration error');
      error.status = 500;
      error.details = {
        success: false,
        error: 'Server configuration error',
        message: 'An internal server error occurred. Please try again later.'
      };
      throw error;
    }

    const token = this.generateToken(user._id);
    
    const userObject = user.toObject();
    delete userObject.password;

    return {
      success: true,
      resource: {
        token,
        user: new AuthResource(userObject).toArray()
      }
    };
  }

  /**
   * Generate JWT token
   * @private
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Wrapper for database operations with connection handling
   * @private
   */
  async withConnection(operation) {
    try {
      await connect();
      return await operation();
    } catch (error) {
      console.error('Database operation failed:', error);
      throw new Error('Database connection failed');
    }
  }
}
