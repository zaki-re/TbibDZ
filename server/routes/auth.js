import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../database/init.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, password } = req.body;

    // Check user exists and get full user data including userType
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with userType included
    const token = jwt.sign(
      { id: user.id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({ token, userType: user.userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const db = await getDb();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      userType,
      specialty,
      license 
    } = req.body;

    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Additional validation for doctors
    if (userType === 'doctor' && (!specialty || !license)) {
      return res.status(400).json({ message: 'Specialty and license are required for doctors' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await db.run(
      'INSERT INTO users (email, password, firstName, lastName, phone, userType) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone, userType]
    );

    // If registering as doctor, create doctor profile
    if (userType === 'doctor') {
      await db.run(
        'INSERT INTO doctors (userId, specialty, license) VALUES (?, ?, ?)',
        [result.lastID, specialty, license]
      );
    }

    // Create token
    const token = jwt.sign(
      { id: result.lastID, userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, userType });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };