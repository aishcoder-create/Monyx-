import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

import { sendOtpEmail } from '../utils/email.js';

const router = express.Router();
router.use(protect);

/* GET /api/user/profile */
router.get('/profile', (req, res) => {
  const { _id, name, email, plan, avatar } = req.user;
  res.json({ id: _id, name, email, plan, avatar });
});

/* PUT /api/user/avatar - Upload profile picture */
router.put('/avatar', async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findById(req.user._id);
    user.avatar = avatar;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* PUT /api/user/profile - Initiate Update with OTP */
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.pendingUpdate = { name, email };
    await user.save();

    console.log(`[OTP GENERATED for ${user.email}]: ${otp}`);

    // Try sending email, but don't fail if SMTP is misconfigured
    try {
      await sendOtpEmail(user.email, otp, user.name);
    } catch (err) {
      console.log('OTP Email failed to send, but OTP was generated:', err.message);
    }

    res.json({ message: 'Verification OTP sent to your email.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* POST /api/user/request-otp - Generic OTP generation */
router.post('/request-otp', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`[OTP GENERATED for ${user.email}]: ${otp}`);
    try {
      await sendOtpEmail(user.email, otp, user.name);
    } catch (err) {
      console.log('OTP Email failed to send, but OTP was generated:', err.message);
    }
    res.json({ message: 'OTP sent to your email.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* POST /api/user/profile/verify-otp - Verify and Apply Update */
router.post('/profile/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No pending update request found.' });
    }

    if (Date.now() > user.otpExpires.getTime()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    // Apply updates
    user.name = user.pendingUpdate.name || user.name;
    user.email = user.pendingUpdate.email || user.email;
    
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    user.pendingUpdate = undefined;

    await user.save();

    res.json({ id: user._id, name: user.name, email: user.email, plan: user.plan });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* PUT /api/user/password */
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

/* GET /api/user/stats — dashboard summary */
router.get('/stats', async (req, res) => {
  try {
    const Transaction = (await import('../models/Transaction.js')).default;
    const txns = await Transaction.find({ user: req.user._id });
    const totalBalance = txns.reduce((s, t) => s + t.amount, 0);
    const thisMonth = new Date().getMonth();
    const monthlySpend = txns
      .filter(t => t.amount < 0 && new Date(t.createdAt).getMonth() === thisMonth)
      .reduce((s, t) => s + t.amount, 0);
    res.json({
      totalBalance: totalBalance.toFixed(2),
      monthlySpend: Math.abs(monthlySpend).toFixed(2),
      savingsGoal: '68',
      investments: '11200.00',
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

export default router;
