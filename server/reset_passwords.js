import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

mongoose.connect('mongodb://localhost:27017/walletflow').then(async () => {
  const db = mongoose.connection.collection('users');
  const hash = await bcrypt.hash('password123', 12);
  const result = await db.updateMany({}, { $set: { password: hash } });
  console.log('Reset passwords for', result.modifiedCount, 'users');
  process.exit(0);
});
