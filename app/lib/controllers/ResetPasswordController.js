import BaseController from "./BaseController";
import UserService from '../services/UserService';
import EmailService from '../services/EmailService';
import TokenService from '../services/TokenService';

class ResetPasswordController extends BaseController {
    /**
     * Sends a password reset link to the user's email
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required.'
                });
            }

            console.log('Processing password reset request for email:', email);
            
            // 1. Find user by email
            const user = await UserService.findUserByEmail(email);
            if (!user) {
                // Return success even if user not found to prevent email enumeration
                return res.status(200).json({
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                });
            }

            console.log('User found, generating reset token for user ID:', user._id);

            // 2. Generate and save reset token
            const { token, expiresAt } = TokenService.generateResetToken();
            await UserService.setResetToken(user._id, token, expiresAt);
            console.log('Reset token saved for user:', user._id);

            // 3. Send reset email
            if (!process.env.FRONTEND_URL) {
                throw new Error('FRONTEND_URL is not configured');
            }

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            console.log('Sending reset email to:', user.email);
            
            await EmailService.sendPasswordResetEmail(user.email, resetUrl);
            console.log('Reset email sent successfully to:', user.email);

            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error processing forgot password request.',
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    /**
     * Resets the user's password using a valid token
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            
            if (!token || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Token and new password are required.'
                });
            }
            
            // 1. Find user by token and check if it's not expired
            const user = await UserService.findUserByResetToken(token);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Password reset token is invalid or has expired.'
                });
            }

            // 2. Update password and clear reset token
            await UserService.updatePassword(user._id, password);

            // 3. Send confirmation email
            await EmailService.sendPasswordChangedEmail(user.email);

            res.status(200).json({
                success: true,
                message: 'Your password has been reset successfully.'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting password.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default ResetPasswordController;
