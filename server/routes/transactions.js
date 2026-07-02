import express from 'express';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes protected
router.use(protect);

/* GET /api/transactions */
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });
    const txns = await Transaction.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* POST /api/transactions */
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });
    const { description, amount, category, account, date, notes } = req.body;
    
    const txn = await Transaction.create({
      workspace: workspaceId, addedBy: req.user._id, description, amount, category, account, date, notes,
    });
    
    res.status(201).json(txn);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* PUT /api/transactions/:id */
router.put('/:id', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const updateData = req.body;
    
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, workspace: workspaceId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    
    res.json(txn);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* DELETE /api/transactions/:id */
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, workspace: workspaceId });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
