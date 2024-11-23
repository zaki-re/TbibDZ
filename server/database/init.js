import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return db;
}

export async function initializeDatabase() {
  const db = await getDb();

  // Users table with photoUrl column
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      userType TEXT NOT NULL CHECK (userType IN ('patient', 'doctor')),
      photoUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rest of the tables remain the same
  await db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      specialty TEXT NOT NULL,
      license TEXT NOT NULL,
      address TEXT,
      city TEXT,
      bio TEXT,
      consultationFee DECIMAL(10,2),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL,
      patientId INTEGER NOT NULL,
      date DATE NOT NULL,
      time TIME NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
      type TEXT NOT NULL CHECK (type IN ('in-person', 'video')),
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctorId) REFERENCES doctors(id),
      FOREIGN KEY (patientId) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL,
      patientId INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (doctorId) REFERENCES doctors(id),
      FOREIGN KEY (patientId) REFERENCES users(id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL,
      dayOfWeek INTEGER NOT NULL CHECK (dayOfWeek BETWEEN 0 AND 6),
      startTime TIME NOT NULL,
      endTime TIME NOT NULL,
      FOREIGN KEY (doctorId) REFERENCES doctors(id)
    )
  `);

  console.log('Database initialized successfully');
}

// Rest of the file remains the same
export async function seedDatabase() {
  try {
    const db = await getDb();
    
    // Check if we already have users
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      return;
    }

    const hashedPassword = await bcrypt.hash('test', 10);

    // Create test doctors
    const doctors = [
      {
        email: 'test@test.com',
        password: hashedPassword,
        firstName: 'Karim',
        lastName: 'Benali',
        phone: '+213555123456',
        specialty: 'Cardiologue',
        license: 'ALG123456',
        address: '123 Rue Didouche Mourad',
        city: 'Alger',
        bio: 'Cardiologue expérimenté avec plus de 10 ans de pratique',
        consultationFee: 2000
      },
      {
        email: 'amina@test.com',
        password: hashedPassword,
        firstName: 'Amina',
        lastName: 'Kadi',
        phone: '+213555789123',
        specialty: 'Dermatologue',
        license: 'ALG789123',
        address: '45 Boulevard Zirout Youcef',
        city: 'Oran',
        bio: 'Spécialiste en dermatologie esthétique et médicale',
        consultationFee: 2500
      }
    ];

    // Insert doctors
    for (const doctor of doctors) {
      const result = await db.run(
        'INSERT INTO users (email, password, firstName, lastName, phone, userType) VALUES (?, ?, ?, ?, ?, ?)',
        [doctor.email, doctor.password, doctor.firstName, doctor.lastName, doctor.phone, 'doctor']
      );

      const doctorResult = await db.run(
        'INSERT INTO doctors (userId, specialty, license, address, city, bio, consultationFee) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          result.lastID,
          doctor.specialty,
          doctor.license,
          doctor.address,
          doctor.city,
          doctor.bio,
          doctor.consultationFee
        ]
      );

      // Add default availability for each doctor
      const availability = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' }
      ];

      for (const slot of availability) {
        await db.run(
          'INSERT INTO availability (doctorId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)',
          [doctorResult.lastID, slot.dayOfWeek, slot.startTime, slot.endTime]
        );
      }
    }

    // Create test patients
    const patients = [
      {
        email: 'patient@test.com',
        password: hashedPassword,
        firstName: 'Ahmed',
        lastName: 'Mansouri',
        phone: '+213555789012'
      },
      {
        email: 'sara@test.com',
        password: hashedPassword,
        firstName: 'Sara',
        lastName: 'Boudiaf',
        phone: '+213555456789'
      }
    ];

    // Insert patients
    for (const patient of patients) {
      await db.run(
        'INSERT INTO users (email, password, firstName, lastName, phone, userType) VALUES (?, ?, ?, ?, ?, ?)',
        [patient.email, patient.password, patient.firstName, patient.lastName, patient.phone, 'patient']
      );
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}