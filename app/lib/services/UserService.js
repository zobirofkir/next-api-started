import User from '../models/User';
import connectDB from '../connection/db';

export default class UserService {
    /**
     * Find user by email
     * @param {string} email - User's email
     * @returns {Promise<Object>} User document or null if not found
     */
    static async findUserByEmail(email) {
        await connectDB();
        return User.findOne({ email });
    }

    /**
     * Find user by reset token
     * @param {string} token - Reset token
     * @returns {Promise<Object>} User document or null if not found or token expired
     */
    static async findUserByResetToken(token) {
        await connectDB();
        return User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
    }

    /**
     * Set reset token for user
     * @param {string} userId - User ID
     * @param {string} token - Reset token
     * @param {Date} expiresAt - Token expiry date
     * @returns {Promise<Object>} Updated user document
     */
    static async setResetToken(userId, token, expiresAt) {
        await connectDB();
        return User.findByIdAndUpdate(
            userId,
            {
                resetPasswordToken: token,
                resetPasswordExpires: expiresAt
            },
            { new: true }
        );
    }

    /**
     * Update user password and clear reset token
     * @param {string} userId - User ID
     * @param {string} newPassword - New password (will be hashed by pre-save hook)
     * @returns {Promise<Object>} Updated user document
     */
    static async updatePassword(userId, newPassword) {
        await connectDB();
        return User.findByIdAndUpdate(
            userId,
            {
                password: newPassword,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            },
            { new: true }
        );
    }
}
