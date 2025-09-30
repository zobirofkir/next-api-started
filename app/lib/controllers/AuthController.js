import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuthResource from '../resources/AuthResource.js';
import BaseController from './BaseController.js';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthController extends BaseController {
  static async register(req, res) {
    try {
      await this.withConnection;
      const { name, email, password } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });
      
      res.status(201).json({ 
        user: user
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      await connectDB();
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        token, 
        user: new AuthResource(user).toArray()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  }
}