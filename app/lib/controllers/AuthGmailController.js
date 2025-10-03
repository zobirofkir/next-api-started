import BaseController from "./BaseController";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";
import User from "../models/User";
import AuthGmailResource from "../resources/AuthGmailResource";

/**
 * @class AuthGmailController
 * @extends BaseController
 * @description Handles Google OAuth authentication using Firebase
 */
class AuthGmailController extends BaseController {
    /**
     * @constructor
     * @description Initializes the controller with the AuthGmailResource
     */
    constructor() {
        super();
        this.resource = AuthGmailResource;
    }

    /**
     * @async
     * @method login
     * @description Authenticates a user using Google OAuth
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<Object>} Returns user data with JWT token on success
     * @throws {Error} Throws error if authentication fails
     * 
     * @example
     * // Successful response
     * {
     *   success: true,
     *   message: 'Login successful',
     *   data: {
     *     user: {
     *       id: 'user_id',
     *       name: 'John Doe',
     *       email: 'john@example.com',
     *       photoURL: 'https://...',
     *       provider: 'google',
     *       createdAt: '2025-10-03T20:00:00.000Z',
     *       updatedAt: '2025-10-03T20:00:00.000Z'
     *     },
     *     token: 'jwt_token_here'
     *   }
     * }
     */
    async login(req, res) {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            let dbUser = await User.findOne({ email: user.email });
            
            if (!dbUser) {
                dbUser = new User({
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    firebaseUid: user.uid,
                    provider: 'google'
                });
                await dbUser.save();
            } else {
                dbUser.photoURL = user.photoURL;
                dbUser.firebaseUid = user.uid;
                await dbUser.save();
            }

            const token = this.jwtSign({
                id: dbUser._id,
                email: dbUser.email,
                name: dbUser.name
            });

            return this.response.success(
                res,
                {
                    user: new this.resource(dbUser).toArray(),
                    token
                },
                'Login successful'
            );
            
        } catch (error) {
            console.error('Google sign in error:', error);
            return this.response.error(
                res,
                { error: error.message },
                'Google sign in failed',
                400
            );
        }
    }
} 

export default new AuthGmailController();