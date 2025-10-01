import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthResource from '../resources/AuthResource.js';
import BaseController from './BaseController.js';
import RegisterRequest from '../requests/RegisterRequest.js';
import LoginRequest from '../requests/LoginRequest.js';
import UpdateMeRequest from '../requests/UpdateMeRequest.js';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthController extends BaseController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const request = RegisterRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({ success: false });
      }

      const { name, email, password } = request.validated();

      const existingUser = await this.withConnection(() =>
        User.findOne({ email })
      );

      if (existingUser) {
        return res.status(400).json({ success: false });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.withConnection(() =>
        User.create({ name, email, password: hashedPassword })
      );

      return res.status(201).json({
        success: true,
        resource: new AuthResource(user).toArray(),
      });
    } catch (error) {
      return res.status(500).json({ success: false });
    }
  }

  /**
   * Login user and return token
   */
  static async login(req, res) {
    try {
      const request = LoginRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({ success: false });
      }

      const { email, password } = request.validated();

      const user = await this.withConnection(() =>
        User.findOne({ email })
      );

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false });
      }

      if (!JWT_SECRET) {
        return res.status(500).json({ success: false });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({
        success: true,
        resource: { token, user: new AuthResource(user).toArray() },
      });
    } catch (error) {
      return res.status(500).json({ success: false });
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
