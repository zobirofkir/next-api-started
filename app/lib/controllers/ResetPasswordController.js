import BaseController from "./BaseController";
import User from "@/app/models/User";
import ResetPasswordRequest from "@/app/lib/requests/ResetPasswordRequest";
import ResetPasswordResource from "@/app/lib/resources/ResetPasswordResource";
import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

class ResetPasswordController extends BaseController {
    async sendResetLink(req) {
        return await ResetPasswordController.withConnection(async () => {
            const { email } = req.body;
            
            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return { 
                    success: false, 
                    message: 'If your email exists in our system, you will receive a password reset link.' 
                };
            }

            // Generate reset token
            const resetToken = uuidv4();
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

            // Save token to user
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            // Send email with reset link
            await this.sendResetEmail(user.email, resetToken);

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

            // Find user by email and token
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

            // Update password
            user.password = await hash(password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            // Generate new JWT token
            const authToken = sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return { 
                success: true, 
                data: new ResetPasswordResource(user).toArray(),
                token: authToken
            };
        });
    }

    async sendResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        
        // Create transporter using environment variables
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // Send mail with defined transport object
        await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
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