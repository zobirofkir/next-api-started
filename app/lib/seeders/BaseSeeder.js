import dbConnect from '../connection';

export default class BaseSeeder {
  static async connect() {
    await dbConnect();
  }

  static async run() {
    throw new Error('You must implement the run method in your seeder');
  }

  static async execute() {
    try {
      console.log(`Running ${this.name}...`);
      await this.connect();
      await this.run();
      console.log(`${this.name} completed successfully`);
    } catch (error) {
      console.error(`Error in ${this.name}:`, error);
      throw error;
    }
  }
}
