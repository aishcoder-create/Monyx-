import express from 'express';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendInvitationEmail } from '../utils/email.js';

const router = express.Router();
router.use(protect);

// Get all workspaces for the logged-in user
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .populate('owner', 'name email');
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch workspaces' });
  }
});

// Create a new workspace
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Workspace name is required' });

    const newWorkspace = new Workspace({
      name,
      owner: req.user._id,
      members: [req.user._id],
      isPersonal: false,
    });
    
    await newWorkspace.save();
    
    const populated = await Workspace.findById(newWorkspace._id)
      .populate('members', 'name email avatar')
      .populate('owner', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create workspace' });
  }
});

// Invite a user to a workspace
router.post('/:id/invite', async (req, res) => {
  try {
    const { email } = req.body;
    const workspaceId = req.params.id;
    
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    const isMember = workspace.members.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'You must be a member of this workspace to invite others' });
    }

    let userToInvite = await User.findOne({ email: email.toLowerCase() });
    let tempPassword = '';
    
    // Auto-create account if user doesn't exist yet
    if (!userToInvite) {
      const namePart = email.split('@')[0].replace(/[._]/g, ' ');
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      tempPassword = Math.random().toString(36).slice(-8) + '!';
      userToInvite = new User({
        name: displayName,
        email: email.toLowerCase(),
        password: tempPassword, // Will be hashed by pre-save hook
      });
      await userToInvite.save();
    }

    if (workspace.members.includes(userToInvite._id)) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    workspace.members.push(userToInvite._id);
    await workspace.save();

    // Send email invitation
    try {
      await sendInvitationEmail(
        email.toLowerCase(),
        userToInvite.name,
        req.user.name,
        workspace.name,
        tempPassword || null
      );
    } catch (mailErr) {
      console.error('SMTP Mail send failed, but member was added to DB:', mailErr);
    }

    const populated = await Workspace.findById(workspace._id)
      .populate('members', 'name email avatar')
      .populate('owner', 'name email');

    res.json({ workspace: populated, tempPassword });
  } catch (error) {
    res.status(500).json({ message: 'Failed to invite user: ' + error.message });
  }
});

export default router;
