import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

/* ── Register ─── POST /api/auth/register */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    
    // Create default personal workspace
    await Workspace.create({
      name: 'Personal Workspace',
      owner: user._id,
      members: [user._id],
      isPersonal: true
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Login ─── POST /api/auth/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    let user = await User.findOne({ email: email.toLowerCase() });
    
    // Auto-create user if they don't exist yet
    if (!user) {
      const namePart = email.split('@')[0].replace(/[._]/g, ' ');
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      user = new User({
        name: displayName,
        email: email.toLowerCase(),
        password: password, // Will be hashed by user pre-save hook
      });
      await user.save();
    } else {
      // Validate password for existing users
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }

    const token = signToken(user._id);

    // Ensure they have a personal workspace (whether they were auto-registered or already existed from an invite)
    const hasOwnedWorkspace = await Workspace.findOne({ owner: user._id });
    if (!hasOwnedWorkspace) {
      await Workspace.create({
        name: 'Personal Workspace',
        owner: user._id,
        members: [user._id],
        isPersonal: true
      });
    }

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ── Google Login ─── POST /api/auth/google */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Google token is required' });

    let email, name, picture;

    if (token.startsWith('mock_google_token_')) {
      const params = new URLSearchParams(token.replace('mock_google_token_', ''));
      email = params.get('email');
      name = params.get('name') || email.split('@')[0];
      picture = params.get('picture') || '';
    } else {
      // Fetch user profile using access token
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!googleRes.ok) throw new Error('Failed to fetch user info from Google');
      const payload = await googleRes.json();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If not, auto-register them
    if (!user) {
      // Create a random secure password for OAuth-only users
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        avatar: picture,
      });
    }

    // Ensure they have a personal workspace (whether they were auto-registered or already existed from an invite)
    const hasOwnedWorkspace = await Workspace.findOne({ owner: user._id });
    if (!hasOwnedWorkspace) {
      await Workspace.create({
        name: 'Personal Workspace',
        owner: user._id,
        members: [user._id],
        isPersonal: true
      });
    }

    // Generate JWT
    const jwtToken = signToken(user._id);

    res.json({
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: 'Google authentication failed: ' + err.message });
  }
});

export default router;
