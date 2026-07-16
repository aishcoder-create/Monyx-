import User from './models/User.js';
import Transaction from './models/Transaction.js';
import Budget from './models/Budget.js';
import Workspace from './models/Workspace.js';

export async function seedDB() {
  const count = await User.countDocuments();
  if (count > 0 && !process.env.FORCE_SEED) {
    console.log('📦 DB already seeded — skipping');
    return;
  }

  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await User.create({
    name: 'Alex Chen',
    email: 'alex@walletflow.com',
    password: 'password123',
    plan: 'Professional',
  });

  // Create demo workspace
  const workspace = await Workspace.create({
    name: 'Alex Personal',
    owner: user._id,
    members: [user._id],
    isPersonal: true
  });

  // Seed transactions
  await Transaction.insertMany([
    { workspace: workspace._id, addedBy: user._id, description: 'Apple Store – MacBook Air', amount: -1299.00, category: 'Tech',          account: 'Checking (****4210)', date: 'Oct 24, 2023', notes: 'Work laptop replacement.' },
    { workspace: workspace._id, addedBy: user._id, description: 'Starbucks Coffee',          amount: -6.50,    category: 'Dining',        account: 'Checking (****4210)', date: 'Oct 24, 2023', notes: '' },
    { workspace: workspace._id, addedBy: user._id, description: 'Monthly Salary – TechCorp', amount: +6400.00, category: 'Income',        account: 'Savings (****8892)',  date: 'Oct 23, 2023', notes: '' },
    { workspace: workspace._id, addedBy: user._id, description: 'Shell Gasoline',            amount: -52.12,   category: 'Transport',     account: 'Checking (****4210)', date: 'Oct 22, 2023', notes: '' },
    { workspace: workspace._id, addedBy: user._id, description: 'Netflix Subscription',      amount: -15.99,   category: 'Entertainment', account: 'Checking (****4210)', date: 'Oct 21, 2023', notes: '' },
    { workspace: workspace._id, addedBy: user._id, description: 'Whole Foods Market',        amount: -87.34,   category: 'Dining',        account: 'Checking (****4210)', date: 'Oct 20, 2023', notes: '' },
    { workspace: workspace._id, addedBy: user._id, description: 'Freelance Payment',         amount: +850.00,  category: 'Income',        account: 'Savings (****8892)',  date: 'Oct 19, 2023', notes: '' },
    { workspace: workspace._id, addedBy: user._id, description: 'Uber Ride',                 amount: -12.50,   category: 'Transport',     account: 'Checking (****4210)', date: 'Oct 18, 2023', notes: '' },
  ]);

  // Seed budgets
  await Budget.insertMany([
    { workspace: workspace._id, name: 'Housing', spent: 2450, limit: 2500, color: '#3B82F6', iconBg: '#EFF6FF' },
    { workspace: workspace._id, name: 'Groceries', spent: 780, limit: 800, color: '#059669', iconBg: '#ECFDF5' },
    { workspace: workspace._id, name: 'Dining Out', spent: 510, limit: 500, color: '#DC2626', iconBg: '#FEF2F2' },
    { workspace: workspace._id, name: 'Personal Care', spent: 85, limit: 150, color: '#059669', iconBg: '#ECFDF5' },
    { workspace: workspace._id, name: 'Transportation', spent: 145, limit: 200, color: '#059669', iconBg: '#ECFDF5' },
    { workspace: workspace._id, name: 'Pets', spent: 120, limit: 100, color: '#DC2626', iconBg: '#FEF2F2' },
    { workspace: workspace._id, name: 'Software Subs', spent: 45, limit: 50, color: '#059669', iconBg: '#ECFDF5' },
  ]);

  console.log('✅ Seeded user: alex@walletflow.com / password123');
  console.log('✅ Seeded transactions and budgets');
}
