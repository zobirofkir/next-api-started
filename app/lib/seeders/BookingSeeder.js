import BaseSeeder from './BaseSeeder.js';
import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import User from '../models/User.js';

/**
 * Seeder for generating booking data
 * @extends BaseSeeder
 */
class BookingSeeder extends BaseSeeder {
  /**
   * Run the database seeder
   * @returns {Promise<Array>} Array of created bookings
   */
  static async run() {
    // Find the first facility (Main Football Field)
    const facility = await Facility.findOne({ name: 'Main Football Field' });
    const adminUser = await User.findOne({ email: 'zobir@admin.com' });

    if (!facility || !adminUser) {
      console.log('Please run FacilitySeeder and ensure the admin user exists');
      return [];
    }

    await Booking.deleteMany({});
    
    // Create a booking for today at 14:00-16:00
    const bookingDate = new Date();
    const booking = {
      user: adminUser._id,
      facility: facility._id,
      date: bookingDate,
      startTime: '14:00',
      endTime: '16:00',
      totalPrice: 2 * facility.price, // 2 hours
      status: 'confirmed',
      paymentStatus: 'paid',
      notes: `Booking for ${facility.name}`
    };
    
    const createdBooking = await Booking.create(booking);
    console.log(`Created booking for ${facility.name}:`, createdBooking);
    
    return [createdBooking];

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`Created ${createdBookings.length} bookings`);
    return createdBookings;
  }
}

export default BookingSeeder;