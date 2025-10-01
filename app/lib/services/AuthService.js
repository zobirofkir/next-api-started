import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthResource from '../resources/AuthResource.js';
import connect from '../connection/db.js';
import { sanitizeEmail, sanitizeName, sanitizePassword } from '../utils/sanitize.js';

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
  /**
   * Sanitize user input data
   * @private
   */
  _sanitizeUserInput(data) {
    const sanitized = { ...data };
    
    if (sanitized.email) sanitized.email = sanitizeEmail(sanitized.email);
    if (sanitized.password) sanitized.password = sanitizePassword(sanitized.password);
    if (sanitized.name) sanitized.name = sanitizeName(sanitized.name);
    
    return sanitized;
  }

  async registerUser(userData) {
    // Sanitize input data
    const sanitizedData = this._sanitizeUserInput(userData);
    const { name, email, password } = sanitizedData;

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
  /**
   * Revoke a JWT token by adding it to the blacklist
   * @param {string} token - The JWT token to revoke
   * @param {Object} payload - The decoded JWT payload
   * @returns {Promise<void>}
   */
  async revokeToken(token, payload) {
    try {
      const { exp } = payload;
      const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
      
      const { default: RevokedToken } = await import('../models/RevokedToken.js');
      await this.withConnection(() => 
        RevokedToken.create({ token, expiresAt })
      );
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedPassword = sanitizePassword(password);

    const user = await this.withConnection(() =>
      User.findOne({ email: sanitizedEmail }).select('+password')
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

    const isPasswordValid = await bcrypt.compare(sanitizedPassword, user.password);
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

  /**
   * Update user information
   * @param {string} userId - The ID of the user to update
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object>} - Updated user data
   * @throws {Error} - If update fails
   */
  async updateUser(userId, updates) {
    // Sanitize update fields
    if (updates.email) updates.email = sanitizeEmail(updates.email);
    if (updates.name) updates.name = sanitizeName(updates.name);
    if (updates.password) updates.password = sanitizePassword(updates.password);

    // Remove any undefined or empty values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined && v !== '')
    );

    if (Object.keys(cleanUpdates).length === 0) {
      const error = new Error('No valid updates provided');
      error.status = 400;
      error.details = {
        success: false,
        error: 'No updates provided',
        message: 'Please provide valid fields to update'
      };
      throw error;
    }

    // Handle password hashing if password is being updated
    if (cleanUpdates.password) {
      cleanUpdates.password = await bcrypt.hash(cleanUpdates.password, 10);
    }

    // Check if email is being changed and if it's already in use
    if (cleanUpdates.email) {
      const existingUser = await this.withConnection(() =>
        User.findOne({ email: cleanUpdates.email, _id: { $ne: userId } })
      );

      if (existingUser) {
        const error = new Error('Email already in use');
        error.status = 400;
        error.details = {
          success: false,
          error: 'Email already in use',
          message: 'The provided email is already registered to another account'
        };
        throw error;
      }
    }

    // Perform the update
    const updatedUser = await this.withConnection(() =>
      User.findByIdAndUpdate(
        userId,
        { $set: cleanUpdates },
        { new: true, runValidators: true }
      )
    );

    if (!updatedUser) {
      const error = new Error('User not found');
      error.status = 404;
      error.details = {
        success: false,
        error: 'User not found',
        message: 'The requested user could not be found'
      };
      throw error;
    }

    return {
      success: true,
      resource: new AuthResource(updatedUser).toArray()
    };
  }
}
