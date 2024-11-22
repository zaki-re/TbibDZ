import express from 'express';
import { getDb } from '../database/init.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all doctors (public route)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { search, city } = req.query;

    let query = `
      SELECT 
        d.*,
        u.firstName,
        u.lastName,
        u.email,
        u.phone,
        COALESCE(
          (SELECT AVG(rating) FROM reviews WHERE doctorId = d.id),
          0
        ) as rating,
        COALESCE(
          (SELECT COUNT(*) FROM reviews WHERE doctorId = d.id),
          0
        ) as reviewsCount
      FROM doctors d
      JOIN users u ON d.userId = u.id
      WHERE u.userType = 'doctor'
    `;

    const params = [];

    if (search || city) {
      const conditions = [];
      if (search) {
        conditions.push('(u.firstName LIKE ? OR u.lastName LIKE ? OR d.specialty LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (city) {
        conditions.push('d.city LIKE ?');
        params.push(`%${city}%`);
      }
      query += ` AND ${conditions.join(' AND ')}`;
    }

    const doctors = await db.all(query, params);
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get doctor availability (moved before the /profile route)
router.get('/:id/availability', async (req, res) => {
  try {
    const db = await getDb();
    const doctorId = req.params.id;

    // Get doctor's availability
    const availability = await db.all(`
      SELECT dayOfWeek, startTime, endTime
      FROM availability 
      WHERE doctorId = ?
      ORDER BY dayOfWeek ASC, startTime ASC
    `, [doctorId]);

    // Get booked appointments for the next 3 months
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const bookedSlots = await db.all(`
      SELECT a.date, a.time, a.type,
             u.firstName || ' ' || u.lastName as patientName
      FROM appointments a
      JOIN users u ON a.patientId = u.id
      WHERE a.doctorId = ?
      AND date BETWEEN ? AND ?
      AND status != 'cancelled'
      ORDER BY date ASC, time ASC
    `, [
      doctorId,
      today.toISOString().split('T')[0],
      threeMonthsLater.toISOString().split('T')[0]
    ]);

    res.json({
      availability,
      bookedSlots
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor availability
router.put('/availability', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { availability } = req.body;

    // Get doctor ID
    const doctor = await db.get(`
      SELECT d.id 
      FROM doctors d
      JOIN users u ON d.userId = u.id
      WHERE u.id = ? AND u.userType = 'doctor'
    `, [req.user.id]);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // First delete existing availability
    await db.run('DELETE FROM availability WHERE doctorId = ?', [doctor.id]);

    // Then insert new availability
    for (const slot of availability) {
      await db.run(
        'INSERT INTO availability (doctorId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)',
        [doctor.id, slot.dayOfWeek, slot.startTime, slot.endTime]
      );
    }

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Update doctor availability


// Get doctor profile
router.get('/profile', auth, async (req, res) => {
  try {
    const db = await getDb();
    
    // Get doctor ID first
    const doctor = await db.get(`
      SELECT d.*, u.firstName, u.lastName, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.userId = u.id
      WHERE u.id = ? AND u.userType = 'doctor'
    `, [req.user.id]);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get today's appointments
    const today = new Date().toISOString().split('T')[0];
    const appointments = await db.all(`
      SELECT a.*, 
             u.firstName as patientFirstName, 
             u.lastName as patientLastName,
             u.phone as patientPhone
      FROM appointments a
      JOIN users u ON a.patientId = u.id
      WHERE a.doctorId = ?
      AND a.date = ?
      ORDER BY a.time ASC
    `, [doctor.id, today]);

    // Get upcoming appointments
    const upcomingAppointments = await db.all(`
      SELECT a.*, 
             u.firstName as patientFirstName, 
             u.lastName as patientLastName
      FROM appointments a
      JOIN users u ON a.patientId = u.id
      WHERE a.doctorId = ?
      AND (a.date > ? OR (a.date = ? AND a.time > time('now', 'localtime')))
      ORDER BY a.date ASC, a.time ASC
      LIMIT 10
    `, [doctor.id, today, today]);

    // Get recent reviews
    const reviews = await db.all(`
      SELECT r.*, 
             u.firstName as patientFirstName, 
             u.lastName as patientLastName
      FROM reviews r
      JOIN users u ON r.patientId = u.id
      WHERE r.doctorId = ?
      ORDER BY r.createdAt DESC
      LIMIT 5
    `, [doctor.id]);

    res.json({
      profile: doctor,
      todayAppointments: appointments,
      upcomingAppointments,
      reviews
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update doctor profile
router.put('/profile', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { specialty, address, city, phone, consultationFee, bio } = req.body;

    // Get doctor ID
    const doctor = await db.get(`
      SELECT d.id 
      FROM doctors d
      JOIN users u ON d.userId = u.id
      WHERE u.id = ? AND u.userType = 'doctor'
    `, [req.user.id]);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Update doctor profile
    await db.run(`
      UPDATE doctors
      SET specialty = ?, address = ?, city = ?, bio = ?, consultationFee = ?
      WHERE id = ?
    `, [specialty, address, city, bio, consultationFee, doctor.id]);

    // Update user phone
    await db.run(`
      UPDATE users
      SET phone = ?
      WHERE id = ?
    `, [phone, req.user.id]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as default };