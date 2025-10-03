import BaseController from "./BaseController";
import { getAuth, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/config";
import User from "../models/User";
import AuthGmailResource from "../resources/AuthGmailResource";

class AuthGmailController extends BaseController {
    constructor() {
        super();
        this.resource = AuthGmailResource;
    }

    async login(req, res) {
        try {
            const { idToken, accessToken } = req.body;
            
            if (!idToken || !accessToken) {
                return this.response.error(
                    res,
                    { error: 'Missing ID token or access token' },
                    'Authentication failed',
                    400
                );
            }

            // Create a credential using the Google ID token and access token
            const credential = GoogleAuthProvider.credential(idToken, accessToken);
            const authResult = await signInWithCredential(auth, credential);
            const user = authResult.user;
            
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