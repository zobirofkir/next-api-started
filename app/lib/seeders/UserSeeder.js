import BaseSeeder from './BaseSeeder';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Zobir',
    email: 'zobir@admin.com',
    password: 'zobir123',
    role: 'admin',
    phone: '+1234567890',
    isVerified: true
  }
];

class UserSeeder extends BaseSeeder {
  static async run() {
    // Delete existing users (except the one you're currently logged in with)
    await User.deleteMany({ email: { $nin: users.map(u => u.email) } });
    
    // Hash passwords and create users
    const userPromises = users.map(async (userData) => {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        return User.create({
          ...userData,
          password: hashedPassword
        });
      }
      
      return existingUser;
    });
    
    const createdUsers = await Promise.all(userPromises);
    console.log(`Seeded ${createdUsers.filter(Boolean).length} users`);
    
    return createdUsers;
  }
}

export default UserSeeder;
