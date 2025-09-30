import Resource from './Resource';

class AuthResource extends Resource {
    toArray() {
        return {
            id: this.resource._id,
            name: this.resource.name,
            email: this.resource.email
        };
    }
}

export default AuthResource;