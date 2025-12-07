const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendEmail, emailTemplates } = require('../utils/email');
const { auth } = require('../middleware/auth');
const { uploadAvatar, deleteFromCloudinary, getPublicIdFromUrl } = require('../config/cloudinary');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// REGISTRATION & EMAIL VERIFICATION
// ============================================

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully. Verification email sent.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 requireVerification:
 *                   type: boolean
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
// Register with email verification
router.post('/register', async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register a new user'
  // #swagger.description = 'Create a new user account with email verification'
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'All fields are required',
        errors: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 6 characters',
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        code: 'USER_EXISTS',
        message: 'An account with this email already exists',
      });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      isEmailVerified: false,
    });

    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const verifyUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
    const emailContent = emailTemplates.verifyEmail(name, verifyUrl);

    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Generate JWT token (user can login but with limited access)
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      code: 'REGISTRATION_SUCCESS',
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        token,
        emailSent: emailResult.success,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred during registration',
    });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Verify email address'
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token',
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      code: 'EMAIL_VERIFIED',
      message: 'Email verified successfully! You can now access all features.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred during email verification',
    });
  }
});

// Resend verification email
router.post('/resend-verification', auth, async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Resend verification email'
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        code: 'ALREADY_VERIFIED',
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const verifyUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
    const emailContent = emailTemplates.verifyEmail(user.name, verifyUrl);

    const emailResult = await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    res.status(200).json({
      success: true,
      code: 'VERIFICATION_SENT',
      message: 'Verification email sent successfully',
      data: { emailSent: emailResult.success },
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while sending verification email',
    });
  }
});

// ============================================
// LOGIN
// ============================================

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified
 */
router.post('/login', async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login user'
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DISABLED',
        message: 'Your account has been disabled. Please contact support.',
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      code: 'LOGIN_SUCCESS',
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred during login',
    });
  }
});

// ============================================
// PASSWORD MANAGEMENT
// ============================================

// Forgot password - send reset email
router.post('/forgot-password', async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Request password reset'
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        code: 'RESET_EMAIL_SENT',
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
    const emailContent = emailTemplates.resetPassword(user.name, resetUrl);

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    res.status(200).json({
      success: true,
      code: 'RESET_EMAIL_SENT',
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while processing your request',
    });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Reset password with token'
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Password and confirmation are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        code: 'PASSWORD_MISMATCH',
        message: 'Passwords do not match',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 6 characters',
      });
    }

    // Find user with valid reset token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token',
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Send confirmation email
    const emailContent = emailTemplates.passwordChanged(user.name);
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    res.status(200).json({
      success: true,
      code: 'PASSWORD_RESET_SUCCESS',
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while resetting your password',
    });
  }
});

// Change password (authenticated)
router.put('/change-password', auth, async (req, res) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Change password'
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'All password fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        code: 'PASSWORD_MISMATCH',
        message: 'New passwords do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user with password
    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_PASSWORD',
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    const emailContent = emailTemplates.passwordChanged(user.name);
    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    res.status(200).json({
      success: true,
      code: 'PASSWORD_CHANGED',
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while changing your password',
    });
  }
});

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

// Get current user profile
router.get('/me', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Get current user profile'
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          addresses: user.addresses,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while fetching profile',
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Update user profile'
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      code: 'PROFILE_UPDATED',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while updating profile',
    });
  }
});

// Upload avatar
router.post('/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Upload user avatar'
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: 'NO_FILE',
        message: 'No image file provided',
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Delete old avatar from Cloudinary if exists
    if (user.avatar) {
      const publicId = getPublicIdFromUrl(user.avatar);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Update avatar URL
    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      code: 'AVATAR_UPLOADED',
      message: 'Avatar uploaded successfully',
      data: { avatar: user.avatar },
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while uploading avatar',
    });
  }
});

// ============================================
// DELIVERY ADDRESS MANAGEMENT
// ============================================

// Get all addresses
router.get('/addresses', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Get user addresses'
  try {
    const user = await User.findById(req.userId).select('addresses');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        addresses: user.addresses,
        count: user.addresses.length,
      },
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while fetching addresses',
    });
  }
});

// Add new address
router.post('/addresses', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Add new address'
  try {
    const { label, firstName, lastName, phone, address, city, state, postalCode, country, isDefault } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !address || !city || !postalCode) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Required fields: firstName, lastName, phone, address, city, postalCode',
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // If this is the first address or isDefault is true, set as default
    const shouldBeDefault = user.addresses.length === 0 || isDefault;

    // If setting as default, unset other defaults
    if (shouldBeDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      label: label || 'Home',
      firstName,
      lastName,
      phone,
      address,
      city,
      state: state || '',
      postalCode,
      country: country || 'Thailand',
      isDefault: shouldBeDefault,
    });

    await user.save();

    res.status(201).json({
      success: true,
      code: 'ADDRESS_ADDED',
      message: 'Address added successfully',
      data: {
        addresses: user.addresses,
        newAddress: user.addresses[user.addresses.length - 1],
      },
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while adding address',
    });
  }
});

// Update address
router.put('/addresses/:addressId', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Update address'
  try {
    const { addressId } = req.params;
    const updates = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found',
      });
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Update address fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user.addresses[addressIndex][key] = updates[key];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      code: 'ADDRESS_UPDATED',
      message: 'Address updated successfully',
      data: {
        address: user.addresses[addressIndex],
      },
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while updating address',
    });
  }
});

// Delete address
router.delete('/addresses/:addressId', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Delete address'
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found',
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default and there are other addresses, set first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      code: 'ADDRESS_DELETED',
      message: 'Address deleted successfully',
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while deleting address',
    });
  }
});

// Set default address
router.put('/addresses/:addressId/default', auth, async (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.summary = 'Set default address'
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found',
      });
    }

    // Unset all defaults
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set new default
    user.addresses[addressIndex].isDefault = true;
    await user.save();

    res.status(200).json({
      success: true,
      code: 'DEFAULT_ADDRESS_SET',
      message: 'Default address updated successfully',
      data: {
        defaultAddress: user.addresses[addressIndex],
      },
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while setting default address',
    });
  }
});

// ============================================
// NOTIFICATIONS
// ============================================

// Get notifications
router.get('/notifications', auth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  // #swagger.summary = 'Get user notifications'
  try {
    const user = await User.findById(req.userId).select('notifications');

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Sort by date descending
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    const unreadCount = notifications.filter(n => !n.read).length;

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalCount: notifications.length,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred while fetching notifications',
    });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', auth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  // #swagger.summary = 'Mark notification as read'
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
      });
    }

    notification.read = true;
    await user.save();

    res.status(200).json({
      success: true,
      code: 'NOTIFICATION_READ',
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred',
    });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', auth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  // #swagger.summary = 'Mark all notifications as read'
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    user.notifications.forEach(notification => {
      notification.read = true;
    });
    await user.save();

    res.status(200).json({
      success: true,
      code: 'ALL_NOTIFICATIONS_READ',
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred',
    });
  }
});

// Delete notification
router.delete('/notifications/:notificationId', auth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  // #swagger.summary = 'Delete notification'
  try {
    const { notificationId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const notificationIndex = user.notifications.findIndex(
      n => n._id.toString() === notificationId
    );

    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found',
      });
    }

    user.notifications.splice(notificationIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      code: 'NOTIFICATION_DELETED',
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred',
    });
  }
});

// Clear all notifications
router.delete('/notifications', auth, async (req, res) => {
  // #swagger.tags = ['Notifications']
  // #swagger.summary = 'Delete all notifications'
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    user.notifications = [];
    await user.save();

    res.status(200).json({
      success: true,
      code: 'NOTIFICATIONS_CLEARED',
      message: 'All notifications cleared',
    });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: 'An error occurred',
    });
  }
});

module.exports = router;
