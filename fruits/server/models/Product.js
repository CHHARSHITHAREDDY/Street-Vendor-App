// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   vendor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Vendor',
//     required: true
//   },
//   name: {
//     type: String,
//     required: [true, 'Product name is required'],
//     trim: true,
//     maxlength: [100, 'Product name cannot be more than 100 characters']
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: [500, 'Description cannot be more than 500 characters']
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: [
//       'fruits',
//       'vegetables',
//       'dairy',
//       'meat',
//       'beverages',
//       'snacks',
//       'bakery',
//       'grocery',
//       'other'
//     ]
//   },
//   price: {
//     type: Number,
//     required: [true, 'Price is required'],
//     min: [0, 'Price cannot be negative']
//   },
//   unit: {
//     type: String,
//     required: [true, 'Unit is required'],
//     enum: ['kg', 'lb', 'piece', 'dozen', 'liter', 'gallon', 'pack', 'bunch', 'bag']
//   },
//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     min: [0, 'Quantity cannot be negative']
//   },
//   isAvailable: {
//     type: Boolean,
//     default: true
//   },
//   images: [{
//     type: String, // URLs to product images
//     validate: {
//       validator: function(v) {
//         return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
//       },
//       message: 'Invalid image URL'
//     }
//   }],
//   tags: [{
//     type: String,
//     trim: true,
//     lowercase: true
//   }],
//   nutritionalInfo: {
//     calories: Number,
//     protein: Number,
//     carbs: Number,
//     fat: Number,
//     fiber: Number
//   },
//   organic: {
//     type: Boolean,
//     default: false
//   },
//   local: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Index for search functionality
// productSchema.index({ name: 'text', description: 'text', tags: 'text' });
// productSchema.index({ category: 1 });
// productSchema.index({ vendor: 1, isAvailable: 1 });

// module.exports = mongoose.model('Product', productSchema);


const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'fruits',
      'vegetables',
      'dairy',
      'meat',
      'beverages',
      'snacks',
      'bakery',
      'grocery',
      'other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lb', 'piece', 'dozen', 'liter', 'gallon', 'pack', 'bunch', 'bag']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },

  // Product images
  images: [
    {
      type: String,
      validate: {
        validator: (v) => {
          if (!v) return true;
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Invalid image URL'
      }
    }
  ],

  tags: [
    {
      type: String,
      trim: true,
      lowercase: true
    }
  ],

  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 }
  },

  organic: {
    type: Boolean,
    default: false
  },
  local: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/* -------------------- INDEXES -------------------- */
// Text search optimization
productSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 5, tags: 3, description: 1 } }
);

productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ vendor: 1, isAvailable: 1 });

/* -------------------- CLEAN JSON OUTPUT -------------------- */
productSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});
productSchema.set('toObject', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Product', productSchema);
