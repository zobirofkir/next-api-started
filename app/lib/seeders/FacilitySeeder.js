import BaseSeeder from './BaseSeeder.js';
import Facility from '../models/Facility.js';

class FacilitySeeder extends BaseSeeder {
  static async run() {
    const facilities = [
      // Football facilities
      {
        name: 'Main Football Field',
        sport: 'football',
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        capacity: '22 players',
        price: 100,
        rating: 4.5,
        available: true,
        features: ['Floodlights', 'Changing rooms', 'Showers', 'Seating area']
      },
      {
        name: 'Training Football Field',
        sport: 'football',
        image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        capacity: '10 players',
        price: 50,
        rating: 4.2,
        available: true,
        features: ['Air-conditioned', 'Scoreboard', 'Bleachers']
      },
      {
        name: 'Outdoor Basketball Court',
        sport: 'basketball',
        image: 'https://images.unsplash.com/photo-1543357480-c60d400e2ad9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        capacity: '4 players',
        price: 40,
        rating: 4.2,
        available: true,
        features: ['Clay surface', 'Net provided', 'Seating area']
      },
      {
        name: 'Hard Court Tennis',
        sport: 'tennis',
        image: 'https://images.unsplash.com/photo-1544298621-35c01eb000e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1584119164246-292db8231aac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        capacity: '30 people',
        price: 35,
        rating: 4.7,
        available: true,
        features: ['50m length', 'Lane ropes', 'Diving boards', 'Lifeguard on duty']
      },
      {
        name: 'Training Pool',
        sport: 'swimming',
        image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
        image: 'https://images.unsplash.com/photo-1534438327276-14e6d8fbf7b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        capacity: '20 people',
        price: 30,
        rating: 4.6,
        available: true,
        features: ['Cardio machines', 'Free weights', 'Personal trainers', 'Sauna', 'Steam room']
      },
      {
        name: 'Fitness Center',
        sport: 'gym',
        image: 'https://images.unsplash.com/photo-1534438327276-14e6d8fbf7b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
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
