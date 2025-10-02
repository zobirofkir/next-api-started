import BaseSeeder from './BaseSeeder.js';
import Facility from '../models/Facility.js';

const facilities = [
  {
    name: 'Football Field 1',
    sport: 'football',
    image: '/images/football-field-1.jpg',
    capacity: '22 players',
    price: 100,
    rating: 4.5,
    available: true,
    features: ['Floodlights', 'Changing rooms', 'Showers']
  },
  {
    name: 'Basketball Court 1',
    sport: 'basketball',
    image: '/images/basketball-court-1.jpg',
    capacity: '10 players',
    price: 50,
    rating: 4.2,
    available: true,
    features: ['Indoor', 'Air-conditioned', 'Scoreboard']
  },
  {
    name: 'Tennis Court 1',
    sport: 'tennis',
    image: '/images/tennis-court-1.jpg',
    capacity: '4 players',
    price: 40,
    rating: 4.0,
    available: true,
    features: ['Clay surface', 'Net provided', 'Seating area']
  },
  {
    name: 'Swimming Pool',
    sport: 'swimming',
    image: '/images/swimming-pool-1.jpg',
    capacity: '20 people',
    price: 30,
    rating: 4.7,
    available: true,
    features: ['25m length', 'Lane ropes', 'Lifeguard on duty']
  },
  {
    name: 'Gym',
    sport: 'gym',
    image: '/images/gym-1.jpg',
    capacity: '15 people',
    price: 25,
    rating: 4.3,
    available: true,
    features: ['Cardio machines', 'Free weights', 'Personal trainer available']
  }
];

class FacilitySeeder extends BaseSeeder {
  static async run() {
    // Delete existing facilities
    await Facility.deleteMany({});
    
    // Create new facilities
    const createdFacilities = await Facility.insertMany(facilities);
    
    console.log(`Created ${createdFacilities.length} facilities`);
    return createdFacilities;
  }
}

export default FacilitySeeder;
