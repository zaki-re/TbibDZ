import express from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getDb } from '../database/init.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
}

// Helper function to safely delete a file
async function safeDeleteFile(filePath) {
  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
}

// Upload profile photo
router.post('/profile-photo', auth, upload.single('photo'), async (req, res) => {
  let processedFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const db = await getDb();
    const processedFileName = `processed-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    processedFilePath = path.join(uploadsDir, processedFileName);

    // Process image with sharp
    await sharp(req.file.path)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(processedFilePath);

    // Get current photo URL to delete old photo
    const user = await db.get(
      'SELECT photoUrl FROM users WHERE id = ?',
      [req.user.id]
    );

    // Update database with new photo URL first
    await db.run(
      'UPDATE users SET photoUrl = ? WHERE id = ?',
      [processedFileName, req.user.id]
    );

    // Clean up files after database update
    if (user?.photoUrl) {
      const oldPhotoPath = path.join(uploadsDir, user.photoUrl);
      await safeDeleteFile(oldPhotoPath);
    }

    // Delete original uploaded file
    await safeDeleteFile(req.file.path);

    res.json({
      photoUrl: `/uploads/${processedFileName}`
    });
  } catch (error) {
    // If something went wrong and we created a processed file, try to clean it up
    if (processedFilePath) {
      await safeDeleteFile(processedFilePath);
    }
    
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ message: 'Error uploading profile photo' });
  }
});

// Delete profile photo
router.delete('/profile-photo', auth, async (req, res) => {
  try {
    const db = await getDb();

    // Get current photo URL
    const user = await db.get(
      'SELECT photoUrl FROM users WHERE id = ?',
      [req.user.id]
    );

    if (user?.photoUrl) {
      // Update database first
      await db.run(
        'UPDATE users SET photoUrl = NULL WHERE id = ?',
        [req.user.id]
      );

      // Then try to delete the file
      const filePath = path.join(uploadsDir, user.photoUrl);
      await safeDeleteFile(filePath);
    }

    res.json({ message: 'Profile photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ message: 'Error deleting profile photo' });
  }
});

export { router };