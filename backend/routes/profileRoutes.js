import express from 'express';
import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  incrementClicks,
  searchProfiles
} from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes (no auth needed)
router.get('/', getProfiles);
router.get('/search', searchProfiles);
router.get('/:id', getProfileById);
router.patch('/:id/click', incrementClicks); // Public - users can click contact

// Protected routes (admin only)
router.post('/', authMiddleware, upload, createProfile);

router.put('/:id', authMiddleware, upload, updateProfile);

router.delete('/:id', authMiddleware, deleteProfile);

export default router;