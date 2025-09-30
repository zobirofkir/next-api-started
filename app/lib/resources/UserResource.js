import Resource from './Resource';

class UserResource extends Resource {
    toArray() {
        return {
            id: this.resource._id,
            name: this.resource.name,
            email: this.resource.email,
            created_at: this.resource.createdAt,
            updated_at: this.resource.updatedAt
        };
    }
}

export default UserResource;