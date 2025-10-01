import BaseController from './BaseController.js';
import RegisterRequest from '../requests/RegisterRequest.js';
import LoginRequest from '../requests/LoginRequest.js';
import UpdateMeRequest from '../requests/UpdateMeRequest.js';
import AuthService from '../services/AuthService.js';
import AuthResource from '../resources/AuthResource.js';

const authService = new AuthService();

/**
 * Controller handling authentication-related operations including
 * user registration, login, logout, and profile management.
 * 
 * @class AuthController
 * @extends {BaseController}
 */
export class AuthController extends BaseController {
  /**
   * Registers a new user with the provided information.
   * 
   * @static
   * @async
   * @param {Object} req - Express request object containing user registration data
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with registration result or error details
   * @throws {Error} If registration fails due to server error
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

      const result = await authService.registerUser(req.body);
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
   * Authenticates a user and returns an access token upon successful login.
   * 
   * @static
   * @async
   * @param {Object} req - Express request object containing login credentials
   * @param {string} req.body.email - User's email address
   * @param {string} req.body.password - User's password
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response with authentication token or error details
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

      const result = await authService.loginUser(req.body.email, req.body.password);
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
   * Logs out the currently authenticated user by revoking their access token.
   * 
   * @static
   * @async
   * @param {Object} req - Express request object containing authentication token
   * @param {string} req.token - JWT token to be revoked
   * @param {Object} req.payload - Decoded JWT payload
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Success response or error details
   */
  static async logout(req, res) {
    try {
      if (!req || !req.token || !req.payload) {
        return res.status(400).json({ success: false });
      }

      await authService.revokeToken(req.token, req.payload);
      return res.json({ success: true, resource: null });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  /**
   * Retrieves the profile information of the currently authenticated user.
   * 
   * @static
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} User profile data or error response
   */
  static async me(req, res) {
    try {
      if (!req || !req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'No authenticated user found'
        });
      }
      
      const userData = req.user.toObject ? req.user.toObject() : req.user;
      
      return res.json({ 
        success: true, 
        resource: new AuthResource(userData).toArray() 
      });
    } catch (error) {
      console.error('Error in /me endpoint:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while fetching user data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Updates the profile information of the currently authenticated user.
   * 
   * @static
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Authenticated user object
   * @param {string} req.user._id - User ID
   * @param {Object} req.body - Updated user data
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Updated user profile or error response
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

      const result = await authService.updateUser(req.user._id, req.body);
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
