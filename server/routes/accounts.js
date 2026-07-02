import express from 'express';
import Account from '../models/Account.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

/* GET /api/accounts */
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });
    const accounts = await Account.find({ workspace: workspaceId }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* POST /api/accounts */
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });
    const { name, type, mask, balance, rate, category, icon } = req.body;
    
    const account = await Account.create({
      workspace: workspaceId, name, type, mask, balance, rate, category, icon
    });
    
    res.status(201).json(account);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* PUT /api/accounts/:id */
router.put('/:id', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, workspace: workspaceId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* DELETE /api/accounts/:id */
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const account = await Account.findOneAndDelete({ _id: req.params.id, workspace: workspaceId });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
