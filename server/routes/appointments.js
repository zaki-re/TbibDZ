import express from 'express';
import { getDb } from '../database/init.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create appointment
router.post('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { doctorId, date, time, type, notes } = req.body;
    const patientId = req.user.id;

    // Validate required fields
    if (!doctorId || !date || !time || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the time slot is available
    const existingAppointment = await db.get(`
      SELECT * FROM appointments 
      WHERE doctorId = ? AND date = ? AND time = ? 
      AND status != 'cancelled'
    `, [doctorId, date, time]);

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const result = await db.run(
      'INSERT INTO appointments (doctorId, patientId, date, time, status, type, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [doctorId, patientId, date, time, 'pending', type, notes]
    );

    res.status(201).json({ 
      id: result.lastID,
      message: 'Appointment created successfully' 
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const appointmentId = req.params.id;

    // Get the appointment
    const appointment = await db.get(`
      SELECT a.*, d.userId as doctorUserId
      FROM appointments a
      JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ?
    `, [appointmentId]);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission (either the doctor or the patient)
    if (appointment.patientId !== req.user.id && appointment.doctorUserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this appointment' });
    }

    // Delete the appointment
    await db.run('DELETE FROM appointments WHERE id = ?', [appointmentId]);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get appointments for user (doctor or patient)
router.get('/', auth, async (req, res) => {
  try {
    const db = await getDb();
    let appointments;

    if (req.user.userType === 'doctor') {
      // Get doctor ID first
      const doctor = await db.get(
        'SELECT id FROM doctors WHERE userId = ?',
        [req.user.id]
      );

      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }

      appointments = await db.all(`
        SELECT a.*, 
               u.firstName as patientFirstName, 
               u.lastName as patientLastName,
               u.phone as patientPhone
        FROM appointments a
        JOIN users u ON a.patientId = u.id
        WHERE a.doctorId = ?
        ORDER BY a.date DESC, a.time DESC
      `, [doctor.id]);
    } else {
      appointments = await db.all(`
        SELECT a.*, 
               d.specialty,
               u.firstName as doctorFirstName,
               u.lastName as doctorLastName,
               u.phone as doctorPhone,
               d.consultationFee
        FROM appointments a
        JOIN doctors d ON a.doctorId = d.id
        JOIN users u ON d.userId = u.id
        WHERE a.patientId = ?
        ORDER BY a.date DESC, a.time DESC
      `, [req.user.id]);
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.body;
    const appointmentId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the appointment
    const appointment = await db.get(`
      SELECT a.*, d.userId as doctorUserId
      FROM appointments a
      JOIN doctors d ON a.doctorId = d.id
      WHERE a.id = ?
    `, [appointmentId]);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has permission (either the doctor or the patient)
    if (appointment.patientId !== req.user.id && appointment.doctorUserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Update appointment status
    await db.run(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, appointmentId]
    );

    res.json({ 
      message: 'Appointment status updated successfully',
      status
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router };