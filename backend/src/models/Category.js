const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // Thai name
    name_th: {
      type: String,
      required: [true, 'Please provide a category name in Thai'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    // English name
    name_en: {
      type: String,
      required: [true, 'Please provide a category name in English'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    // Thai description
    description_th: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // English description
    description_en: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Generate slug from English name before saving
categorySchema.pre('save', function (next) {
  if (this.isModified('name_en') || !this.slug) {
    this.slug = this.name_en
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
