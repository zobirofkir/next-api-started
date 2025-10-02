import BaseSeeder from './BaseSeeder.js';
import Facility from '../models/Facility.js';

class FacilitySeeder extends BaseSeeder {
  static async run() {
    const facilities = [
      // Football facilities
      {
        name: 'Main Football Field',
        sport: 'football',
        image: '/images/football-field-1.jpg',
        capacity: '22 players',
        price: 100,
        rating: 4.5,
        available: true,
        features: ['Floodlights', 'Changing rooms', 'Showers', 'Seating area']
      },
      {
        name: 'Training Football Field',
        sport: 'football',
        image: '/images/football-field-2.jpg',
        capacity: '20 players',
        price: 80,
        rating: 4.3,
        available: true,
        features: ['Floodlights', 'Changing rooms', 'Training equipment']
      },
      
      // Basketball facilities
      {
        name: 'Indoor Basketball Court',
        sport: 'basketball',
        image: '/images/basketball-court-1.jpg',
        capacity: '10 players',
        price: 50,
        rating: 4.2,
        available: true,
        features: ['Air-conditioned', 'Scoreboard', 'Bleachers']
      },
      {
        name: 'Outdoor Basketball Court',
        sport: 'basketball',
        image: '/images/basketball-court-2.jpg',
        capacity: '10 players',
        price: 40,
        rating: 4.0,
        available: true,
        features: ['Floodlights', 'Scoreboard', 'Benches']
      },
      
      // Tennis facilities
      {
        name: 'Clay Tennis Court',
        sport: 'tennis',
        image: '/images/tennis-court-1.jpg',
        capacity: '4 players',
        price: 40,
        rating: 4.2,
        available: true,
        features: ['Clay surface', 'Net provided', 'Seating area']
      },
      {
        name: 'Hard Court Tennis',
        sport: 'tennis',
        image: '/images/tennis-court-2.jpg',
        capacity: '4 players',
        price: 45,
        rating: 4.3,
        available: true,
        features: ['Hard surface', 'Net provided', 'Floodlights']
      },
      
      // Swimming facilities
      {
        name: 'Olympic Swimming Pool',
        sport: 'swimming',
        image: '/images/swimming-pool-1.jpg',
        capacity: '30 people',
        price: 35,
        rating: 4.7,
        available: true,
        features: ['50m length', 'Lane ropes', 'Diving boards', 'Lifeguard on duty']
      },
      {
        name: 'Training Pool',
        sport: 'swimming',
        image: '/images/swimming-pool-2.jpg',
        capacity: '20 people',
        price: 25,
        rating: 4.5,
        available: true,
        features: ['25m length', 'Lane ropes', 'Lifeguard on duty']
      },
      
      // Gym facilities
      {
        name: 'Premium Gym',
        sport: 'gym',
        image: '/images/gym-1.jpg',
        capacity: '20 people',
        price: 30,
        rating: 4.6,
        available: true,
        features: ['Cardio machines', 'Free weights', 'Personal trainers', 'Sauna', 'Steam room']
      },
      {
        name: 'Fitness Center',
        sport: 'gym',
        image: '/images/gym-2.jpg',
        capacity: '15 people',
        price: 20,
        rating: 4.3,
        available: true,
        features: ['Cardio machines', 'Weight machines', 'Free weights']
      }
    ];

    await Facility.deleteMany({});
    
    /**
     * Create new facilities
     */
    const createdFacilities = await Facility.insertMany(facilities);
    
    console.log(`Created ${createdFacilities.length} facilities`);
    return createdFacilities;
  }
}

export default FacilitySeeder;
