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
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'promptpay', 'bank-transfer', 'credit-card', 'cash-on-delivery'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentDetails: {
      method: String,
      transactionId: String,
      timestamp: Date,
      amount: Number,
    },
    trackingNumber: String,
    shippedDate: Date,
    deliveredDate: Date,
    notes: String,
    timeline: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Method to calculate totals
orderSchema.methods.calculateTotal = function () {
  this.total = this.subtotal - this.discount + this.tax;
  return this.total;
};

// Method to update status with timeline
orderSchema.methods.updateStatus = function (newStatus, note = '') {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (validStatuses.includes(newStatus)) {
    this.status = newStatus;
    
    // Add to timeline
    this.timeline.push({
      status: newStatus,
      timestamp: new Date(),
      note: note,
    });
    
    // Update delivery dates
    if (newStatus === 'shipped') {
      this.shippedDate = new Date();
    } else if (newStatus === 'delivered') {
      this.deliveredDate = new Date();
    }
    
    return true;
  }
  return false;
};

module.exports = mongoose.model('Order', orderSchema);
