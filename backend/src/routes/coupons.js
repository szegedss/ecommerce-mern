const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/auth');

// Get all active coupons (public, just list)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      expiryDate: { $gte: new Date() },
    }).select('uniqueCode description_th description_en discountType discountValue');

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Validate and get coupon details (for users)
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const coupon = await Coupon.findOne({
      uniqueCode: code.toUpperCase(),
    }).populate('applicableProducts');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    // Check if coupon is valid
    const validationResult = coupon.isValidCoupon();
    if (!validationResult.valid) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
      });
    }

    // Check if user can use this coupon
    const userUsageResult = coupon.canUserUseCoupon(req.userId);
    if (!userUsageResult.canUse) {
      return res.status(400).json({
        success: false,
        message: userUsageResult.message,
      });
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of $${coupon.minPurchaseAmount} required`,
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(cartTotal);

    res.json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.uniqueCode,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount,
        finalTotal: Math.max(0, cartTotal - discountAmount),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: Get all coupons (with full details)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: Get single coupon
router.get('/admin/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'email name')
      .populate('applicableProducts', 'name_th name_en');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: Create coupon
router.post('/admin', protect, admin, async (req, res) => {
  try {
    const {
      code_th,
      code_en,
      uniqueCode,
      description_th,
      description_en,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      maxUsagePerUser,
      totalUsageLimit,
      applicableCategories,
      applicableProducts,
      isActive,
    } = req.body;

    // Validate required fields
    if (!code_th || !code_en || !uniqueCode || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({
      uniqueCode: uniqueCode.toUpperCase(),
    });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists',
      });
    }

    const coupon = new Coupon({
      code_th,
      code_en,
      uniqueCode: uniqueCode.toUpperCase(),
      description_th: description_th || '',
      description_en: description_en || '',
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      maxUsagePerUser: maxUsagePerUser || 1,
      totalUsageLimit: totalUsageLimit || null,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.userId,
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: Update coupon
router.put('/admin/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    const {
      code_th,
      code_en,
      description_th,
      description_en,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      maxUsagePerUser,
      totalUsageLimit,
      applicableCategories,
      applicableProducts,
      isActive,
    } = req.body;

    if (code_th) coupon.code_th = code_th;
    if (code_en) coupon.code_en = code_en;
    if (description_th !== undefined) coupon.description_th = description_th;
    if (description_en !== undefined) coupon.description_en = description_en;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (minPurchaseAmount !== undefined) coupon.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount;
    if (startDate) coupon.startDate = new Date(startDate);
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (maxUsagePerUser !== undefined) coupon.maxUsagePerUser = maxUsagePerUser;
    if (totalUsageLimit !== undefined) coupon.totalUsageLimit = totalUsageLimit;
    if (applicableCategories) coupon.applicableCategories = applicableCategories;
    if (applicableProducts) coupon.applicableProducts = applicableProducts;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin: Delete coupon
router.delete('/admin/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// User: Get their saved coupons
router.get('/user/saved', protect, async (req, res) => {
  try {
    const coupons = await Coupon.find({
      'usageHistory.userId': req.userId,
      isActive: true,
    }).select('uniqueCode code_th code_en description_th description_en discountType discountValue expiryDate');

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// User: Save coupon to their profile
router.post('/user/save', protect, async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const coupon = await Coupon.findOne({
      uniqueCode: code.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }

    // Check if already saved
    const alreadySaved = coupon.usageHistory.some(
      (usage) => usage.userId.toString() === req.userId.toString()
    );

    if (!alreadySaved) {
      coupon.usageHistory.push({
        userId: req.userId,
        usageCount: 0,
        lastUsedAt: null,
      });
      await coupon.save();
    }

    res.json({
      success: true,
      message: 'Coupon saved successfully',
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
