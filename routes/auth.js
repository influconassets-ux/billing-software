const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require(path.join(__dirname, '..', 'firebase-service-account.json'));
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
}

const AUTHORIZED_PHONE_NUMBER = '+917679275382'; // The client's specific number


// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using Firebase Phone Auth token
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { idToken, newPassword, email } = req.body;

  try {
    // 1. Verify the token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // 2. Double check that the phone number matches the hardcoded authorized number
    if (decodedToken.phone_number !== AUTHORIZED_PHONE_NUMBER) {
      return res.status(403).json({ message: "Unauthorized phone number." });
    }

    // 3. Find user. Since this is a single-user system and the phone number is hardcoded/verified,
    // we simply update the primary user in the database.
    const user = await User.findOne();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(401).json({ message: "Invalid or expired Firebase token" });
  }
});

module.exports = router;
