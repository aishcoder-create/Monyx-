import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  workspace:   { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true },          // negative = expense, positive = income
  category:    { type: String, required: true },
  account:     { type: String, required: true },
  date:        { type: String, required: true },
  notes:       { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
