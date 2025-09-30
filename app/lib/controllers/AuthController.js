import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthResource from '../resources/AuthResource.js';
import BaseController from './BaseController.js';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthController extends BaseController {
  /**
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;

      const existingUser = await this.withConnection(() =>
        User.findOne({ email })
      );

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.withConnection(() =>
        User.create({ name, email, password: hashedPassword })
      );

      return res.status(201).json({
        user: new AuthResource(user).toArray(),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Login user and return token
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await this.withConnection(() =>
        User.findOne({ email })
      );

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({
        token,
        user: new AuthResource(user).toArray(),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Logout user
   */
  static async logout(req, res) {
    return res.json({ message: 'Logged out successfully' });
  }
}
