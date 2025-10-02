import BaseController from "./BaseController";
import User from "../models/User";
import crypto from 'crypto';
import nodemailer from 'nodemailer';

class ResetPasswordController extends BaseController {
    /**
     * Sends a password reset link to the user's email
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            // 1. Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                });
            }

            // 2. Generate reset token and set expiry (1 hour from now)
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

            // 3. Save token and expiry to user
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            // 4. Send email with reset link
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            await this.sendResetEmail(user.email, resetUrl);

            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing forgot password request.'
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
            
            // 1. Find user by token and check if it's not expired
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Password reset token is invalid or has expired.'
                });
            }

            // 2. Update password and clear reset token
            user.password = password; // Password will be hashed by pre-save hook
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            // 3. Send confirmation email
            await this.sendPasswordChangedEmail(user.email);

            res.status(200).json({
                success: true,
                message: 'Your password has been reset successfully.'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting password.'
            });
        }
    }

    /**
     * Sends password reset email
     * @param {string} email - Recipient email
     * @param {string} resetUrl - Password reset URL
     */
    static async sendResetEmail(email, resetUrl) {
        // In a real app, you would use a proper email service
        // This is a basic example using nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    }

    /**
     * Sends password changed confirmation email
     * @param {string} email - Recipient email
     */
    static async sendPasswordChangedEmail(email) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    }
}

export default ResetPasswordController;
