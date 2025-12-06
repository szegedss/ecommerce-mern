const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  uploadProductImages,
  uploadReviewMedia,
  uploadAvatar,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  cloudinary,
} = require('../config/cloudinary');

// ============================================
// PRODUCT IMAGE UPLOADS (Admin only)
// ============================================

// Upload single product image
router.post('/product/single', auth, admin, uploadProductImages.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILE',
        message: 'No image file provided',
      });
    }

    res.status(200).json({
      success: true,
      code: 'UPLOAD_SUCCESS',
      message: 'Image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Product image upload error:', error);
    res.status(500).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: 'Failed to upload image',
    });
  }
});

// Upload multiple product images (max 5)
router.post('/product/multiple', auth, admin, uploadProductImages.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILES',
        message: 'No image files provided',
      });
    }

    const images = req.files.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0, // First image is primary
    }));

    res.status(200).json({
      success: true,
      code: 'UPLOAD_SUCCESS',
      message: `${images.length} images uploaded successfully`,
      data: { images },
    });
  } catch (error) {
    console.error('Product images upload error:', error);
    res.status(500).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: 'Failed to upload images',
    });
  }
});

// ============================================
// AVATAR UPLOADS (Authenticated users)
// ============================================

// Upload user avatar
router.post('/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILE',
        message: 'No avatar file provided',
      });
    }

    // Update user's avatar in database
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    // Update user avatar
    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename;
    await user.save();

    res.status(200).json({
      success: true,
      code: 'UPLOAD_SUCCESS',
      message: 'Avatar uploaded successfully',
      data: {
        avatar: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: 'Failed to upload avatar',
    });
  }
});

// ============================================
// REVIEW MEDIA UPLOADS (Authenticated users)
// ============================================

// Upload review images (max 3)
router.post('/review/images', auth, uploadReviewMedia.array('images', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILES',
        message: 'No image files provided',
      });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.status(200).json({
      success: true,
      code: 'UPLOAD_SUCCESS',
      message: `${images.length} images uploaded successfully`,
      data: { images },
    });
  } catch (error) {
    console.error('Review images upload error:', error);
    res.status(500).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: 'Failed to upload images',
    });
  }
});

// Upload review video (max 1, max 50MB, max 60 seconds)
router.post('/review/video', auth, uploadReviewMedia.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILE',
        message: 'No video file provided',
      });
    }

    res.status(200).json({
      success: true,
      code: 'UPLOAD_SUCCESS',
      message: 'Video uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Review video upload error:', error);
    res.status(500).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: 'Failed to upload video',
    });
  }
});

// ============================================
// DELETE UPLOADED FILES
// ============================================

// Delete single file from Cloudinary
router.delete('/delete', auth, async (req, res) => {
  try {
    const { publicId, resourceType = 'image' } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PUBLIC_ID',
        message: 'Public ID is required',
      });
    }

    const result = await deleteFromCloudinary(publicId, resourceType);

    res.status(200).json({
      success: true,
      code: 'DELETE_SUCCESS',
      message: 'File deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      code: 'DELETE_ERROR',
      message: 'Failed to delete file',
    });
  }
});

// Delete multiple files from Cloudinary
router.delete('/delete-multiple', auth, async (req, res) => {
  try {
    const { publicIds, resourceType = 'image' } = req.body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PUBLIC_IDS',
        message: 'Public IDs array is required',
      });
    }

    const results = await Promise.all(
      publicIds.map(id => deleteFromCloudinary(id, resourceType))
    );

    res.status(200).json({
      success: true,
      code: 'DELETE_SUCCESS',
      message: `${publicIds.length} files deleted successfully`,
      data: results,
    });
  } catch (error) {
    console.error('Delete files error:', error);
    res.status(500).json({
      success: false,
      code: 'DELETE_ERROR',
      message: 'Failed to delete files',
    });
  }
});

// ============================================
// GET CLOUDINARY SIGNATURE (for direct uploads)
// ============================================

router.get('/signature', auth, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = req.query.folder || 'ecommerce/uploads';

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
      },
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      code: 'SIGNATURE_ERROR',
      message: 'Failed to generate upload signature',
    });
  }
});

module.exports = router;
