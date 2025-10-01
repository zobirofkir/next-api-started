import Resource from './Resource';

class GmailAuthResource extends Resource {
    toArray() {
        const user = this.resource || {};

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            photoURL: user.photoURL,
            provider: user.provider,
            firebaseUid: user.firebaseUid,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
}

export default GmailAuthResource;