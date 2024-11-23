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
        d.id,
        d.specialty,
        d.address,
        d.city,
        d.bio,
        d.consultationFee,
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

// Get doctor availability
router.get('/availability/:id', async (req, res) => {
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

// Get consultation requests
router.get('/consultation-requests', auth, async (req, res) => {
  try {
    const db = await getDb();
    
    // Get doctor ID first
    const doctor = await db.get(`
      SELECT id FROM doctors WHERE userId = ?
    `, [req.user.id]);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get pending consultation requests
    const requests = await db.all(`
      SELECT a.*, 
             u.firstName as patientFirstName, 
             u.lastName as patientLastName,
             u.phone as patientPhone
      FROM appointments a
      JOIN users u ON a.patientId = u.id
      WHERE a.doctorId = ? AND a.status = 'pending'
      ORDER BY a.date ASC, a.time ASC
    `, [doctor.id]);

    res.json(requests);
  } catch (error) {
    console.error('Error fetching consultation requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update consultation request status
router.put('/consultation-requests/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.body;
    const requestId = req.params.id;

    // Validate status
    if (!['accept', 'reject'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the appointment and verify doctor's permission
    const appointment = await db.get(`
      SELECT a.* 
      FROM appointments a
      JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ? AND d.userId = ?
    `, [requestId, req.user.id]);

    if (!appointment) {
      return res.status(404).json({ message: 'Consultation request not found' });
    }

    // Update appointment status
    const newStatus = status === 'accept' ? 'confirmed' : 'cancelled';
    await db.run(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [newStatus, requestId]
    );

    res.json({ message: 'Consultation request updated successfully' });
  } catch (error) {
    console.error('Error updating consultation request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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

export { router };