import BaseController  from "./BaseController";
import ResetPasswordRequest from "@/app/lib/requests/ResetPasswordRequest";
import ResetPasswordResource from "@/app/lib/resources/ResetPasswordResource";
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import User from "../models/User";

class ResetPasswordController extends BaseController {
    async sendResetLink(req) {
        return await ResetPasswordController.withConnection(async () => {
            const { email } = req.body;
            
            /**
             * Find user by email
             */
            const user = await User.findOne({ email });
            if (!user) {
                return { 
                    success: false, 
                    message: 'If your email exists in our system, you will receive a password reset link.' 
                };
            }

            /**
             * Generate reset token
             */
            const passwordResetToken = uuidv4();
            const resetTokenExpiry = Date.now() + 3600000; 

            /**
             * Save token to user
             */
            user.resetPasswordToken = passwordResetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            /**
             * Send email with reset link
             */
            await this.sendResetEmail(user.email, passwordResetToken);

            return { 
                success: true, 
                message: 'Password reset link sent to your email' 
            };
        });
    }

    async resetPassword(req) {
        return await ResetPasswordController.withConnection(async () => {
            const request = new ResetPasswordRequest(req);
            
            if (!await request.validate()) {
                return { 
                    success: false, 
                    errors: request.errors,
                    message: 'Validation failed'
                };
            }

            const { email, token, password } = request.cleaned;

            /**
             * Find user by email and token
             */
            const user = await User.findOne({
                email,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return { 
                    success: false, 
                    message: 'Invalid or expired reset token' 
                };
            }

            /**
             * Update password
             * Using findOneAndUpdate to ensure the pre-save hook is triggered
             */
            const hashedPassword = await hash(password, 10);
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { 
                    password: hashedPassword,
                    resetPasswordToken: undefined,
                    resetPasswordExpires: undefined 
                },
                { new: true }
            );
            
            if (!updatedUser) {
                return { 
                    success: false, 
                    message: 'Failed to update password' 
                };
            }

            /**
             * Generate new JWT token using the same logic as AuthService
             */
            const authToken = sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Convert user to plain object and remove sensitive data
            const userObject = user.toObject();
            delete userObject.password;
            delete userObject.resetPasswordToken;
            delete userObject.resetPasswordExpires;

            return { 
                success: true, 
                resource: {
                    token: authToken,
                    user: new ResetPasswordResource(userObject).toArray()
                },
                message: 'Password has been reset successfully'
            };
        });
    }

    async sendResetEmail(email, passwordResetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/update-password?token=${passwordResetToken}&email=${encodeURIComponent(email)}`;
        
        /**
         * Create transporter using environment variables
         */
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        /**
         * Send mail with defined transport object
         */
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <p><a href="${resetUrl}">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
    }
}

export default new ResetPasswordController();