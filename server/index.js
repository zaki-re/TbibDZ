import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { router as authRoutes } from './routes/auth.js';
import { router as doctorRoutes } from './routes/doctors.js';
import { router as patientRoutes } from './routes/patients.js';
import { router as appointmentRoutes } from './routes/appointments.js';
import { router as userRoutes } from './routes/users.js';
import { initializeDatabase, seedDatabase } from './database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Initialize and seed database
await initializeDatabase();
await seedDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Only serve static files and handle client routing in production
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  
  // Serve static files
  app.use(express.static(distPath));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});