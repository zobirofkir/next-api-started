import BaseController from './BaseController.js';
import RegisterRequest from '../requests/RegisterRequest.js';
import LoginRequest from '../requests/LoginRequest.js';
import UpdateMeRequest from '../requests/UpdateMeRequest.js';
import AuthService from '../services/AuthService.js';
import AuthResource from '../resources/AuthResource.js';

const authService = new AuthService();

export class AuthController extends BaseController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
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
        return res.status(401).json({ success: false });
      }

      const request = UpdateMeRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({ success: false });
      }

      const updates = request.validated();

      if (Object.keys(updates).length === 0) {
        return res.status(422).json({ success: false });
      }

      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      // If email is changing, ensure not taken by someone else
      if (updates.email && updates.email !== req.user.email) {
        const exists = await this.withConnection(() => User.findOne({ email: updates.email }));
        if (exists && String(exists._id) !== String(req.user._id)) {
          return res.status(400).json({ success: false });
        }
      }

      const user = await this.withConnection(() =>
        User.findByIdAndUpdate(req.user._id, updates, { new: true })
      );

      return res.json({ success: true, resource: new AuthResource(user).toArray() });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }
}
