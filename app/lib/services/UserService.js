import User from '../models/User';
import connect from '../connection/db';

export default class UserService {
    /**
     * Find user by email
     * @param {string} email - User's email
     * @returns {Promise<Object>} User document or null if not found
     */
    static async findUserByEmail(email) { 
        try {
            await connect();
            return await User.findOne({ email });
        } catch (error) {
            console.error('Error in findUserByEmail:', error);
            throw error;
        }
    }

    /**
     * Find user by reset token
     * @param {string} token - Reset token
     * @returns {Promise<Object>} User document or null if not found or token expired
     */
    static async findUserByResetToken(token) {
        try {
            await connect();
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            return user;
        } catch (error) {
            console.error('Error in findUserByResetToken:', error);
            throw error;
        }
    }

    /**
     * Set reset token for user
     * @param {string} userId - User ID
     * @param {string} token - Reset token
     * @param {Date} expiresAt - Token expiry date
     * @returns {Promise<Object>} Updated user document
     */
    static async setResetToken(userId, token, expiresAt) {
        try {
            await connect();
            return await User.findByIdAndUpdate(
                userId,
                {
                    resetPasswordToken: token,
                    resetPasswordExpires: expiresAt
                },
                { new: true }
            );
        } catch (error) {
            console.error('Error in setResetToken:', error);
            throw error;
        }
    }

    /**
     * Update user password and clear reset token
     * @param {string} userId - User ID
     * @param {string} newPassword - New password (will be hashed by pre-save hook)
     * @returns {Promise<Object>} Updated user document
     */
    static async updatePassword(userId, newPassword) {
        try {
            await connect();
            return await User.findByIdAndUpdate(
                userId,
                {
                    password: newPassword,
                    resetPasswordToken: undefined,
                    resetPasswordExpires: undefined
                },
                { new: true }
            );
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw error;
        }
    }
}
