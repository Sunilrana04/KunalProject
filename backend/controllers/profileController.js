import Profile from '../models/Profile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to build full image URL
const buildImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// Get all profiles
export const getProfiles = async (req, res) => {
  try {
    const { featured, complexion, location, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let filter = {};
    
    if (featured === 'true') filter.isFeatured = true;
    if (complexion) filter.complexion = complexion;
    if (location) filter.location = { $regex: location, $options: 'i' };
    
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
    
    const profiles = await Profile.find(filter).sort(sort);
    
    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Get Profiles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profiles',
      error: error.message
    });
  }
};

// Get single profile
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Create new profile
export const createProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      height,
      complexion,
      location,
      description,
      contactInfo,
      isFeatured
    } = req.body;

    // Validate required fields
    if (!name || !age || !height || !complexion || !location || !description || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check for main image
    if (!req.files || !req.files.mainImage || !req.files.mainImage[0]) {
      return res.status(400).json({
        success: false,
        message: 'Main image is required'
      });
    }

    const mainImage = req.files.mainImage[0];
    const imageUrl = buildImageUrl(req, mainImage.filename);

    const galleryImages = [];
    if (req.files.galleryImages) {
      req.files.galleryImages.forEach(file => {
        galleryImages.push(buildImageUrl(req, file.filename));
      });
    }

    const profileData = {
      name,
      age: Number(age),
      height,
      complexion,
      location,
      imageUrl,
      galleryImages,
      description,
      contactInfo,
      isFeatured: isFeatured === 'true' || false,
    };

    const profile = new Profile(profileData);
    const savedProfile = await profile.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: savedProfile
    });

  } catch (error) {
    console.error('Create Profile Error:', error);

    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.mainImage) {
        const mainPath = path.join(__dirname, '..', 'uploads', req.files.mainImage[0].filename);
        if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
      }
      if (req.files.galleryImages) {
        req.files.galleryImages.forEach(file => {
          const filePath = path.join(__dirname, '..', 'uploads', file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create profile'
    });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update text fields
    const fields = ['name', 'age', 'height', 'complexion', 'location', 'description', 'contactInfo', 'isFeatured'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'age') {
          profile[field] = Number(req.body[field]);
        } else if (field === 'isFeatured') {
          profile[field] = req.body[field] === 'true';
        } else {
          profile[field] = req.body[field];
        }
      }
    });

    // Update main image if uploaded
    if (req.files?.mainImage?.[0]) {
      // Optional: delete old main image
      const oldMainFilename = profile.imageUrl.split('/').pop();
      const oldMainPath = path.join(__dirname, '..', 'uploads', oldMainFilename);
      if (fs.existsSync(oldMainPath)) fs.unlinkSync(oldMainPath);

      profile.imageUrl = buildImageUrl(req, req.files.mainImage[0].filename);
    }

    // Update gallery images if uploaded (replace all)
    if (req.files?.galleryImages) {
      // Optional: delete old gallery images
      profile.galleryImages.forEach(imgUrl => {
        const filename = imgUrl.split('/').pop();
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

      profile.galleryImages = req.files.galleryImages.map(file => 
        buildImageUrl(req, file.filename)
      );
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });

  } catch (error) {
    console.error('Update Profile Error:', error);

    // Clean up any newly uploaded files on error
    if (req.files) {
      if (req.files.mainImage?.[0]) {
        const path = path.join(__dirname, '..', 'uploads', req.files.mainImage[0].filename);
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }
      if (req.files.galleryImages) {
        req.files.galleryImages.forEach(file => {
          const path = path.join(__dirname, '..', 'uploads', file.filename);
          if (fs.existsSync(path)) fs.unlinkSync(path);
        });
      }
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Delete profile
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Delete main image
    if (profile.imageUrl) {
      const mainFilename = profile.imageUrl.split('/').pop();
      const mainPath = path.join(__dirname, '..', 'uploads', mainFilename);
      if (fs.existsSync(mainPath)) fs.unlinkSync(mainPath);
    }

    // Delete gallery images
    if (profile.galleryImages?.length > 0) {
      profile.galleryImages.forEach(url => {
        const filename = url.split('/').pop();
        const filePath = path.join(__dirname, '..', 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await Profile.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Profile and images deleted successfully' });
  } catch (error) {
    console.error('Delete Profile Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete profile' });
  }
};

// Increment contact clicks
export const incrementClicks = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.contactClicks += 1;
    await profile.save();

    res.json({
      success: true,
      message: 'Contact click recorded',
      contactClicks: profile.contactClicks
    });
  } catch (error) {
    console.error('Increment Clicks Error:', error);
    res.status(500).json({ success: false, message: 'Failed to record click' });
  }
};

// Search profiles
export const searchProfiles = async (req, res) => {
  try {
    const { location, name, ageMin, ageMax, complexion } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required for search'
      });
    }

    let filter = { location: { $regex: location, $options: 'i' } };

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (complexion) filter.complexion = complexion;

    if (ageMin || ageMax) {
      filter.age = {};
      if (ageMin) filter.age.$gte = Number(ageMin);
      if (ageMax) filter.age.$lte = Number(ageMax);
    }

    const profiles = await Profile.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Search Profiles Error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};