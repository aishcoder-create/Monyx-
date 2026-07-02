import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name:    { type: String, required: true, trim: true },
  spent:   { type: Number, default: 0 },
  limit:   { type: Number, required: true },
  color:   { type: String, default: '#1A1D27' },
  iconBg:  { type: String, default: '#F3F4F6' },
  month:   { type: String, default: () => new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) },
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
