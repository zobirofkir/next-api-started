import BaseSeeder from './BaseSeeder';
import Booking from '../models/Booking';
import Facility from '../models/Facility';
import User from '../models/User';

class BookingSeeder extends BaseSeeder {
  static async run() {
    // Get all facilities and users
    const facilities = await Facility.find({});
    const users = await User.find({});

    if (facilities.length === 0 || users.length === 0) {
      console.log('Please run FacilitySeeder and create some users first');
      return [];
    }

    // Delete existing bookings
    await Booking.deleteMany({});

    const bookings = [];
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    // Create bookings for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Create 1-3 bookings per day
      const bookingsPerDay = 1 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < bookingsPerDay; j++) {
        const facility = facilities[Math.floor(Math.random() * facilities.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        // Generate random time slots (9:00 - 21:00)
        const startHour = 9 + Math.floor(Math.random() * 12);
        const endHour = Math.min(21, startHour + 1 + Math.floor(Math.random() * 3));
        
        const startTime = `${startHour.toString().padStart(2, '0')}:00`;
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        
        // Calculate total price based on hours and facility price
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

    // Insert bookings
    const createdBookings = await Booking.insertMany(bookings);
    console.log(`Created ${createdBookings.length} bookings`);
    return createdBookings;
  }
}

export default BookingSeeder;
