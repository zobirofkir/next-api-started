import BaseController from "./BaseController";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/config";
import User from "../models/User";
import AuthGmailResource from "../resources/AuthGmailResource";

class AuthGmailController extends BaseController {
    constructor() {
        super();
        this.resource = AuthGmailResource;
    }

    async login(req, res) {
        try {
            // Sign in with Google Popup
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            
            // Check if user exists in database
            let dbUser = await User.findOne({ email: user.email });
            
            // If user doesn't exist, create a new one
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
                // Update user data if they exist
                dbUser.photoURL = user.photoURL;
                dbUser.firebaseUid = user.uid;
                await dbUser.save();
            }

            // Generate JWT token
            const token = this.jwtSign({
                id: dbUser._id,
                email: dbUser.email,
                name: dbUser.name
            });

            // Return user data with token
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