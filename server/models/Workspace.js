import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPersonal: { type: Boolean, default: false } // Indicates if it's the user's default personal workspace
}, { timestamps: true });

export default mongoose.model('Workspace', workspaceSchema);
