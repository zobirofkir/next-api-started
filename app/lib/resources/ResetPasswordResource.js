import Resource from './Resource.js';

class ResetPasswordResource extends Resource {
    toArray() {
        return {
            message: 'Password has been reset successfully',
            user: {
                id: this.resource._id,
                email: this.resource.email,
                name: this.resource.name
            }
        };
    }
}

export default ResetPasswordResource;