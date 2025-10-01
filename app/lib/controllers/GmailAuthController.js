import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import GmailAuthResource from '../resources/GmailAuthResource.js';
import BaseController from './BaseController.js';
import GmailAuthRequest from '../requests/GmailAuthRequest.js';
import admin from 'firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET;

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export class GmailAuthController extends BaseController {
  /**
   * Login or Register user with Gmail via Firebase
   */
  static async loginWithGmail(req, res) {
    try {
      const request = GmailAuthRequest.from(req);
      if (!request.valid) {
        return res.status(422).json({ 
          success: false, 
          message: 'Invalid request data' 
        });
      }

      const { idToken } = request.validated();

      // Verify Firebase ID token
      let decodedToken;
      try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      } catch (error) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid Firebase token' 
        });
      }

      const { uid, email, name, picture } = decodedToken;

      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email not found in token' 
        });
      }

      // Check if user exists
      let user = await this.withConnection(() =>
        User.findOne({ $or: [{ email }, { firebaseUid: uid }] })
      );

      if (user) {
        // Update existing user with Firebase UID if not set
        if (!user.firebaseUid) {
          user = await this.withConnection(() =>
            User.findByIdAndUpdate(
              user._id,
              { 
                firebaseUid: uid, 
                photoURL: picture || user.photoURL,
                provider: 'google'
              },
              { new: true }
            )
          );
        }
      } else {
        // Create new user
        user = await this.withConnection(() =>
          User.create({
            name: name || email.split('@')[0],
            email,
            firebaseUid: uid,
            photoURL: picture,
            provider: 'google',
          })
        );
      }

      if (!JWT_SECRET) {
        return res.status(500).json({ 
          success: false, 
          message: 'JWT secret not configured' 
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({
        success: true,
        resource: { 
          token, 
          user: new GmailAuthResource(user).toArray() 
        },
      });
    } catch (error) {
      console.error('Gmail auth error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  /**
   * Register user with Gmail via Firebase
   * This is essentially the same as login for OAuth providers
   */
  static async registerWithGmail(req, res) {
    return this.loginWithGmail(req, res);
  }
}

export default GmailAuthController;
