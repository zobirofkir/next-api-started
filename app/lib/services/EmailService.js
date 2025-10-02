import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport(this.getEmailConfig());
    }

    getEmailConfig() {
        this.validateEmailConfig();
        
        return {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            },
            debug: process.env.NODE_ENV !== 'production',
            connectionTimeout: 10000,
            maxConnections: 5,
            maxMessages: 100
        };
    }

    validateEmailConfig() {
        const requiredEnvVars = ['EMAIL_USERNAME', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('SMTP server is ready to take our messages');
            return true;
        } catch (error) {
            console.error('SMTP connection error:', error);
            throw new Error(`Failed to connect to email server: ${error.message}`);
        }
    }

    async sendEmail(mailOptions) {
        try {
            mailOptions.from = mailOptions.from || process.env.EMAIL_FROM;
            const info = await this.transporter.sendMail(mailOptions);
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

    async sendPasswordResetEmail(email, resetUrl) {
        const mailOptions = {
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

        return this.sendEmail(mailOptions);
    }

    async sendPasswordChangedEmail(email) {
        const mailOptions = {
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <p>Your password has been successfully changed.</p>
                <p>If you didn't make this change, please contact support immediately.</p>
            `
        };

        return this.sendEmail(mailOptions);
    }
}

export default new EmailService();
