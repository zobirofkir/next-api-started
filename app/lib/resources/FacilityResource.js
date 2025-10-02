import Resource from './Resource';

class FacilityResource extends Resource {
    toArray() {
        return {
            id: this.resource._id,
            name: this.resource.name,
            sport: this.resource.sport,
            image: "https://university-frontend-eight.vercel.app/" + this.resource.image,
            capacity: this.resource.capacity,
            price: this.resource.price,
            rating: this.resource.rating,
            available: this.resource.available,
            features: this.resource.features || [],
            created_at: this.resource.createdAt,
            updated_at: this.resource.updatedAt
        };
    }
}

export default FacilityResource;