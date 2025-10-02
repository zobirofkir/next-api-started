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
    const facilities = await Facility.find({});
    const users = await User.find({});

    if (facilities.length === 0 || users.length === 0) {
      console.log('Please run FacilitySeeder and create some users first');
      return [];
    }

    await Booking.deleteMany({});

    const bookings = [];
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const bookingsPerDay = 1 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < bookingsPerDay; j++) {
        const facility = facilities[Math.floor(Math.random() * facilities.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        const startHour = 9 + Math.floor(Math.random() * 12);
        const endHour = Math.min(21, startHour + 1 + Math.floor(Math.random() * 3));
        
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        
        const hours = endHour - startHour;
        const totalPrice = hours * facility.price;
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        
        const booking = {
          user: user._id,
          facility: facility._id,
          date: date,
          startTime: startTime,
          endTime: endTime,
          totalPrice: totalPrice,
          status: status,
          paymentStatus: paymentStatus,
          notes: `Booking for ${facility.name}`
        };
        
        bookings.push(booking);
      }
    }

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`Created ${createdBookings.length} bookings`);
    return createdBookings;
  }
}

export default BookingSeeder;