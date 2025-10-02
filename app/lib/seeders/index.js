import UserSeeder from './UserSeeder';
import FacilitySeeder from './FacilitySeeder';
import BookingSeeder from './BookingSeeder';

export async function seed() {
  try {
    console.log('Starting database seeding...\n');
    
    // Run seeders in sequence
    await UserSeeder.execute();
    console.log(''); // Add a newline for better readability
    
    await FacilitySeeder.execute();
    console.log(''); // Add a newline for better readability
    
    await BookingSeeder.execute();
    
    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seed();
}
