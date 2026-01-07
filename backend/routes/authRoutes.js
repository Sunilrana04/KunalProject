import dotenv from 'dotenv';
dotenv.config(); // ✅ REQUIRED for ESM + deployment safety

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Securely build admins array from .env with safety checks
const admins = [];

// Admin 1
if (process.env.ADMIN_USERNAME_1 && process.env.ADMIN_PASSWORD_1) {
  admins.push({
    username: process.env.ADMIN_USERNAME_1.trim(),
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD_1.trim(), 10),
    role: 'admin'
  });
}

// Admin 2
if (process.env.ADMIN_USERNAME_2 && process.env.ADMIN_PASSWORD_2) {
  admins.push({
    username: process.env.ADMIN_USERNAME_2.trim(),
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD_2.trim(), 10),
    role: 'admin'
  });
}

// Critical security check
if (admins.length === 0) {
  console.error('❌ FATAL: No admin credentials found in .env file!');
  console.error('   ADMIN_USERNAME_1=yourusername');
  console.error('   ADMIN_PASSWORD_1=yourstrongpassword');
  process.exit(1);
}

// Login Route
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const admin = admins.find(a => a.username === username.trim());

    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      { username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

export default router;
