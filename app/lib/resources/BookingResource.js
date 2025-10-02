import Resource from './Resource';
import UserResource from './UserResource';
import FacilityResource from './FacilityResource';

class BookingResource extends Resource {
    toArray() {
        const result = {
            id: this.resource._id,
            date: this.resource.date,
            startTime: this.resource.startTime,
            endTime: this.resource.endTime,
            totalPrice: this.resource.totalPrice,
            status: this.resource.status,
            paymentStatus: this.resource.paymentStatus,
            notes: this.resource.notes,
            created_at: this.resource.createdAt,
            updated_at: this.resource.updatedAt
        };

        // Include user data if populated
        if (this.resource.user && typeof this.resource.user === 'object') {
            result.user = UserResource.make(this.resource.user).toArray();
        } else {
            result.user = this.resource.user; // Just the ID if not populated
        }

        // Include facility data if populated
        if (this.resource.facility && typeof this.resource.facility === 'object') {
            result.facility = FacilityResource.make(this.resource.facility).toArray();
        } else {
            result.facility = this.resource.facility; // Just the ID if not populated
        }

        return result;
    }
}

export default BookingResource;