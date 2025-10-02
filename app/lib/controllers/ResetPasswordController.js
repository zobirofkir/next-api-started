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

            const user = await UserService.findUserByEmail(email);
            if (!user) {
                return res.status(200).json({
                    success: true,
                });
            }

            const { token, expiresAt } = TokenService.generateResetToken();
            await UserService.setResetToken(user._id, token, expiresAt);

            if (!process.env.FRONTEND_URL) {
                throw new Error('FRONTEND_URL is not configured');
            }

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await EmailService.sendPasswordResetEmail(user.email, resetUrl);

            res.status(200).json({
                success: true,
            });
        } catch (error) {
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
            
            const user = await UserService.findUserByResetToken(token);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Password reset token is invalid or has expired.'
                });
            }

            await UserService.updatePassword(user._id, password);
            await EmailService.sendPasswordChangedEmail(user.email);

            res.status(200).json({
                success: true,
                message: 'Your password has been reset successfully.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error resetting password.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

export default ResetPasswordController;
