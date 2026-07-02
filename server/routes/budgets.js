import express from 'express';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

/* GET /api/budgets */
router.get('/', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });
    const budgets = await Budget.find({ workspace: workspaceId }).sort({ createdAt: 1 });
    res.json(budgets);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* POST /api/budgets */
router.post('/', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    if (!workspaceId) return res.status(400).json({ message: 'Workspace ID required' });
    const { name, limit, spent, color, iconBg, month } = req.body;
    const budget = await Budget.create({ workspace: workspaceId, name, limit, spent, color, iconBg, month });
    res.status(201).json(budget);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* PUT /api/budgets/:id */
router.put('/:id', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, workspace: workspaceId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* DELETE /api/budgets/:id */
router.delete('/:id', async (req, res) => {
  try {
    const workspaceId = req.headers['x-workspace-id'];
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, workspace: workspaceId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
