import BaseController from "./BaseController";
import User from "../models/User";
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import connectDB from '../connection/db';

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
                console.error('No email provided in request');
                return res.status(400).json({
                    success: false,
                    message: 'Email is required.'
                });
            }

            console.log('Processing password reset request for email:', email);
            
            // 0. Ensure database connection
            await connectDB();
            
            // 1. Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                console.log('User not found for email:', email);
                return res.status(200).json({
                    success: true,
                    message: 'If an account with that email exists, a password reset link has been sent.'
                });
            }

            console.log('User found, generating reset token for user ID:', user._id);

            // 2. Generate reset token and set expiry (1 hour from now)
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

            // 3. Save token and expiry to user
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();
            console.log('Reset token saved for user:', user._id);

            // 4. Send email with reset link
            if (!process.env.FRONTEND_URL) {
                console.error('FRONTEND_URL is not set in environment variables');
                throw new Error('FRONTEND_URL is not configured');
            }

            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            console.log('Sending reset email to:', user.email);
            
            try {
                await this.sendResetEmail(user.email, resetUrl);
                console.log('Reset email sent successfully to:', user.email);
            } catch (emailError) {
                console.error('Failed to send reset email:', emailError);
                throw new Error(`Failed to send reset email: ${emailError.message}`);
            }

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
            
            // 0. Ensure database connection
            await connectDB();
            
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
        try {
            // Validate required environment variables
            const requiredEnvVars = ['EMAIL_USERNAME', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
            const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
            
            if (missingVars.length > 0) {
                throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
            }

            console.log('Configuring email transport...');
            
            // Enhanced email configuration with better error handling
            const emailConfig = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
                // For Gmail, you might need to enable less secure apps or use an App Password
                tls: {
                    // Do not fail on invalid certs in development
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                },
                // Add debug logging
                debug: process.env.NODE_ENV !== 'production',
                // Connection timeout
                connectionTimeout: 10000, // 10 seconds
                // Add some retry logic
                maxConnections: 5,
                maxMessages: 100
            };

            console.log('Email config:', {
                ...emailConfig,
                auth: { user: emailConfig.auth.user } // Don't log the password
            });

            const transporter = nodemailer.createTransport(emailConfig);
            
            // Verify connection configuration
            try {
                await transporter.verify();
                console.log('Server is ready to take our messages');
            } catch (error) {
                console.error('SMTP connection error:', error);
                throw new Error(`Failed to connect to email server: ${error.message}`);
            }

            console.log('Preparing email for:', email);
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Click the button below to set a new password:</p>
                    <div style="margin: 20px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #4CAF50; color: white; padding: 12px 20px; 
                                  text-align: center; text-decoration: none; display: inline-block; 
                                  border-radius: 4px;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>${resetUrl}</p>
                    <p>This link will expire in 1 hour.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        If you didn't request this password reset, please ignore this email or contact support 
                        if you have any concerns about your account's security.
                    </p>
                `
            };

            console.log('Sending email...');
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.messageId);
            return info;
        } catch (error) {
            console.error('Email sending error:', error);
            if (error.response) {
                console.error('SMTP Error:', error.response);
            }
            throw new Error(`Failed to send email: ${error.message}`);
        }
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
