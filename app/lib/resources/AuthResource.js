import Resource from './Resource';

class AuthResource extends Resource {
    toArray() {
        return {
            id: this.data._id,
            name: this.data.name,
            email: this.data.email
        };
    }
}

export default AuthResource;