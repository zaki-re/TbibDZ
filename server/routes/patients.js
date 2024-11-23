import express from 'express';
import { getDb } from '../database/init.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get patient profile and appointments
router.get('/profile', auth, async (req, res) => {
  try {
    const db = await getDb();
    
    // Get patient info
    const patient = await db.get(
      'SELECT * FROM users WHERE id = ? AND userType = "patient"',
      [req.user.id]
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get upcoming appointments
    const appointments = await db.all(`
      SELECT a.*, 
             d.specialty, d.consultationFee,
             u.firstName as doctorFirstName, 
             u.lastName as doctorLastName,
             u.phone as doctorPhone
      FROM appointments a
      JOIN doctors d ON a.doctorId = d.id
      JOIN users u ON d.userId = u.id
      WHERE a.patientId = ?
      AND a.date >= date('now')
      ORDER BY a.date ASC, a.time ASC
    `, [req.user.id]);

    // Get past appointments
    const pastAppointments = await db.all(`
      SELECT a.*, 
             d.specialty, d.consultationFee,
             u.firstName as doctorFirstName, 
             u.lastName as doctorLastName
      FROM appointments a
      JOIN doctors d ON a.doctorId = d.id
      JOIN users u ON d.userId = u.id
      WHERE a.patientId = ?
      AND a.date < date('now')
      ORDER BY a.date DESC, a.time DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({
      profile: patient,
      upcomingAppointments: appointments,
      pastAppointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router };