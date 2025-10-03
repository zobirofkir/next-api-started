import Resource from './Resource';

class AuthGmailResource extends Resource {
    toArray() {
        return {
            id: this.resource._id,
            name: this.resource.name,
            email: this.resource.email,
            photoURL: this.resource.photoURL,
            provider: this.resource.provider,
            createdAt: this.resource.createdAt,
            updatedAt: this.resource.updatedAt
        };
    }
}

export default AuthGmailResource;