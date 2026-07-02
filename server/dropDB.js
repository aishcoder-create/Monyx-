import mongoose from 'mongoose';
import { seedDB } from './seed.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/walletflow');
  await mongoose.connection.dropDatabase();
  console.log('Database dropped');
  await seedDB();
  process.exit(0);
}

run().catch(console.error);
