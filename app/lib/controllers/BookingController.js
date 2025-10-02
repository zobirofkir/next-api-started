import BaseController from "./BaseController";
import Booking from "@/app/lib/models/Booking";
import BookingResource from "@/app/lib/resources/BookingResource";

class BookingController extends BaseController {
    /**
     * List all bookings
     */
    static async index() {
        const bookings = await this.withConnection(() => 
            Booking.find().populate('user').populate('facility')
        );
        return BookingResource.collection(bookings).toArray();
    }

    /**
     * Find booking by id
     */
    static async show(id) {
        const booking = await this.withConnection(() => 
            Booking.findById(id).populate('user').populate('facility')
        );
        return BookingResource.make(booking).toArray();
    }

    /**
     * Create a new booking
     */
    static async store(bookingData) {
        // Check for existing bookings at the same time
        const existingBooking = await this.withConnection(() => 
            Booking.findOne({
                facility: bookingData.facility,
                date: bookingData.date,
                $or: [
                    { 
                        $and: [
                            { startTime: { $lte: bookingData.startTime } },
                            { endTime: { $gt: bookingData.startTime } }
                        ]
                    },
                    { 
                        $and: [
                            { startTime: { $lt: bookingData.endTime } },
                            { endTime: { $gte: bookingData.endTime } }
                        ]
                    },
                    { 
                        $and: [
                            { startTime: { $gte: bookingData.startTime } },
                            { endTime: { $lte: bookingData.endTime } }
                        ]
                    }
                ]
            })
        );

        if (existingBooking) {
            throw new Error('The selected time slot is already booked');
        }

        const booking = await this.withConnection(() => Booking.create(bookingData));
        return BookingResource.make(booking).toArray();
    }

    /**
     * Update booking
     */
    static async update(id, bookingData) {
        const booking = await this.withConnection(() => 
            Booking.findByIdAndUpdate(id, bookingData, { new: true })
                .populate('user')
                .populate('facility')
        );
        return BookingResource.make(booking).toArray();
    }

    /**
     * Delete booking
     */
    static async delete(id) {
        return await this.withConnection(() => Booking.findByIdAndDelete(id));
    }

    /**
     * Get user's bookings
     */
    static async getUserBookings(userId) {
        const bookings = await this.withConnection(() => 
            Booking.find({ user: userId })
                .populate('facility')
                .sort({ date: -1, startTime: 1 })
        );
        return BookingResource.collection(bookings).toArray();
    }

    /**
     * Get facility's bookings for a specific date
     */
    static async getFacilityBookings(facilityId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await this.withConnection(() => 
            Booking.find({
                facility: facilityId,
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: { $ne: 'cancelled' }
            }).sort({ startTime: 1 })
        );

        return BookingResource.collection(bookings).toArray();
    }

    /**
     * Update booking status
     */
    static async updateStatus(id, status) {
        const booking = await this.withConnection(() => 
            Booking.findByIdAndUpdate(
                id, 
                { status },
                { new: true }
            ).populate('user').populate('facility')
        );
        return BookingResource.make(booking).toArray();
    }
}

export default BookingController;
