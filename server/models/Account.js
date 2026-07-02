import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  mask: { type: String }, // Last 4 digits
  balance: { type: Number, required: true, default: 0 },
  rate: { type: String }, // Optional APY or YTD string
  category: { type: String },
  icon: { type: String }
}, { timestamps: true });

export default mongoose.model('Account', accountSchema);
