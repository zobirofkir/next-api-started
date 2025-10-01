import bcrypt from 'bcryptjs';
import BaseController from './BaseController.js';
import RegisterRequest from '../requests/RegisterRequest.js';
import LoginRequest from '../requests/LoginRequest.js';
import UpdateMeRequest from '../requests/UpdateMeRequest.js';
import AuthService from '../services/AuthService.js';
import AuthResource from '../resources/AuthResource.js';
import User from '../models/User.js';
import { sanitizeEmail, sanitizePassword, sanitizeName } from '../utils/sanitize.js';

const authService = new AuthService();

export class AuthController extends BaseController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      /**
       * Sanitize input data before validation
       */
      if (req.body) {
        req.body = {
          ...req.body,
          email: sanitizeEmail(req.body.email),
          password: sanitizePassword(req.body.password),
          name: sanitizeName(req.body.name)
        };
      }

      const request = RegisterRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({
          success: false,
          error: 'Validation failed',
          details: request.errors || 'Invalid input data'
        });
      }

      const result = await authService.registerUser(request.validated());
      return res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(error.status || 500).json(
        error.details || {
          success: false,
          error: 'Internal server error',
          message: 'An error occurred while processing your registration. Please try again later.'
        }
      );
    }
  }

  /**
   * Login user and return token
   */
  static async login(req, res) {
    try {
      /**
       * Sanitize login input
       */
      if (req.body) {
        req.body = {
          ...req.body,
          email: sanitizeEmail(req.body.email),
          password: sanitizePassword(req.body.password)
        };
      }

      const request = LoginRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({
          success: false,
          error: 'Validation failed',
          details: request.errors || 'Please provide both email and password'
        });
      }

      const { email, password } = request.validated();
      const result = await authService.loginUser(email, password);
      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json(
        error.details || {
          success: false,
          error: 'Authentication failed',
          message: 'An error occurred during login. Please try again.'
        }
      );
    }
  }

  /**
   * Logout user
   */
  static async logout(req, res) {
    try {
      if (!req || !req.token || !req.payload) {
        return res.status(400).json({ success: false });
      }

      const { exp } = req.payload;
      const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

      const { default: RevokedToken } = await import('../models/RevokedToken.js');
      await this.withConnection(() => RevokedToken.create({ token: req.token, expiresAt }));

      return res.json({ success: true, resource: null });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  /**
   * Get current authenticated user
   */
  static async me(req, res) {
    try {
      if (!req || !req.user) {
        return res.status(401).json({ success: false });
      }
      return res.json({ success: true, resource: new AuthResource(req.user).toArray() });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  /**
   * Update current authenticated user
   */
  static async updateMe(req, res) {
    try {
      if (!req || !req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const request = UpdateMeRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({ 
          success: false,
          error: 'Validation failed',
          details: request.errors || 'Invalid input data'
        });
      }

      const updates = request.validated();
      const result = await authService.updateUser(req.user._id, updates);
      return res.json(result);
    } catch (error) {
      console.error('Update error:', error);
      return res.status(error.status || 500).json(
        error.details || {
          success: false,
          error: 'Update failed',
          message: 'An error occurred while updating your profile. Please try again.'
        }
      );
    }
  }
}
