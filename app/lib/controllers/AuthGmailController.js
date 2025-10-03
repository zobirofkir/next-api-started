import BaseController from "./BaseController";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "../firebase/admin";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
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
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    }

    /**
     * Sign JWT token
     * @param {Object} payload - The payload to sign
     * @returns {String} Signed JWT token
     */
    jwtSign(payload) {
        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
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
            const { idToken } = req.body;
            
            if (!idToken) {
                return this.response.error(
                    res,
                    { error: 'ID token is required' },
                    'Authentication failed',
                    400
                );
            }

            // Verify the Firebase ID token
            const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
            const { uid, email, name, picture } = decodedToken;

            if (!email) {
                throw new Error('Email not found in token');
            }
            
            // Ensure database connection is established
            let dbConnection;
            try {
                dbConnection = await import('../connection/db').then(module => module.default());
                await dbConnection; // Ensure the connection is fully established
            } catch (dbError) {
                console.error('Database connection error:', dbError);
                throw new Error('Unable to connect to the database. Please try again later.');
            }

            // Use a transaction to ensure data consistency
            const session = await mongoose.startSession();
            session.startTransaction();
            
            try {
                let dbUser = await User.findOne({ email }).session(session);
                
                if (!dbUser) {
                    // Only include fields that exist in the User model
                    const userData = {
                        name: name || email.split('@')[0],
                        email,
                        photoURL: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random`,
                        firebaseUid: uid,
                        provider: 'google'
                    };
                    
                    dbUser = new User(userData);
                    await dbUser.save({ session });
                } else {
                    // Update only the fields that exist in the User model
                    if (picture) dbUser.photoURL = picture;
                    if (uid) dbUser.firebaseUid = uid;
                    dbUser.provider = 'google';
                    
                    await dbUser.save({ session });
                }
                
                // Generate JWT token with user data
                const token = this.jwtSign({
                    id: dbUser._id,
                    email: dbUser.email,
                    name: dbUser.name
                });

                // Prepare user data for response using only the fields that exist in the model
                const userData = {
                    id: dbUser._id,
                    name: dbUser.name,
                    email: dbUser.email,
                    photoURL: dbUser.photoURL,
                    provider: dbUser.provider || 'google',
                    createdAt: dbUser.createdAt,
                    updatedAt: dbUser.updatedAt
                };

                // Commit the transaction before sending the response
                await session.commitTransaction();
                
                // End the session after successful commit
                session.endSession();

                // Return the success response
                if (res && typeof res.json === 'function') {
                    return res.status(200).json({
                        success: true,
                        message: 'Login successful',
                        data: {
                            user: userData,
                            token
                        }
                    });
                }
                
                return this.response?.success?.(
                    res,
                    {
                        user: new this.resource(dbUser).toArray(),
                        token
                    },
                    'Login successful'
                ) || {
                    success: true,
                    message: 'Login successful',
                    data: {
                        user: new this.resource(dbUser).toArray(),
                        token
                    }
                };
                
            } catch (error) {
                // Only abort if the transaction is still active
                if (session.inTransaction()) {
                    await session.abortTransaction();
                }
                throw error;
            } finally {
                // End the session if it's still active
                if (session.inTransaction()) {
                    await session.abortTransaction();
                }
                if (session.id) {
                    session.endSession().catch(e => console.error('Error ending session:', e));
                }
            }
            
        } catch (error) {
            console.error('Google sign in error:', error);
            const statusCode = error.statusCode || 500;
            const errorMessage = error.message || 'Authentication failed';
            
            // For Next.js API routes, we'll return the response directly
            if (res && typeof res.json === 'function') {
                return res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                    error: errorMessage,
                    code: error.code
                });
            }
            
            // Fallback to the base controller's error response
            return this.response?.error?.(
                res,
                { 
                    error: errorMessage,
                    code: error.code
                },
                errorMessage,
                statusCode
            ) || {
                success: false,
                message: errorMessage,
                error: errorMessage,
                code: error.code
            };
        }
    }
} 

export default new AuthGmailController();