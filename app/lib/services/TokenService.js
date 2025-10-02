import crypto from 'crypto';

class TokenService {
    /**
     * Generates a secure random token
     * @returns {string} Random token string
     */
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Calculates token expiry time
     * @param {number} hours - Hours until expiry
     * @returns {Date} Expiry date
     */
    getExpiryTime(hours = 1) {
        return Date.now() + (hours * 60 * 60 * 1000);
    }

    /**
     * Checks if a token is expired
     * @param {Date} expiryTime - Token expiry time
     * @returns {boolean} True if token is expired
     */
    isTokenExpired(expiryTime) {
        return Date.now() > expiryTime;
    }

    /**
     * Generates a reset token and its expiry time
     * @returns {Object} Object containing token and expiry time
     */
    generateResetToken() {
        return {
            token: this.generateToken(),
            expiresAt: this.getExpiryTime(1) // 1 hour expiry by default
        };
    }
}

export default new TokenService();
