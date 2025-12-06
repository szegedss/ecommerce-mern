const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: String,
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['credit-card', 'bank-transfer', 'cash-on-delivery'],
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  { timestamps: true }
);

// Method to calculate totals
orderSchema.methods.calculateTotal = function () {
  this.total = this.subtotal - this.discount + this.tax;
  return this.total;
};

// Method to update status
orderSchema.methods.updateStatus = function (newStatus) {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (validStatuses.includes(newStatus)) {
    this.status = newStatus;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Order', orderSchema);
