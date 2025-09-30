import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword });
      
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email } 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        token, 
        user: { id: user._id, name: user.name, email: user.email } 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async logout(req, res) {
    res.json({ message: 'Logged out successfully' });
  }
}