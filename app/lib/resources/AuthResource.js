import Resource from './Resource.js';

class AuthResource extends Resource {
    toArray() {
        const result = {
            id: this.resource._id,
            name: this.resource.name,
            email: this.resource.email
        };

        /**
         * Include bookings if they exist
         */
        if (Array.isArray(this.resource.bookings)) {
            result.books = this.resource.bookings.map(booking => ({
                id: booking._id,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
                totalPrice: booking.totalPrice,
                notes: booking.notes,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt
            }));
        }

        return result;
    }
}

export default AuthResource;