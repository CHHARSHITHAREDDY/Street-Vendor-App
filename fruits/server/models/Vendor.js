// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const vendorSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Name is required'],
//     trim: true,
//     maxlength: [50, 'Name cannot be more than 50 characters']
//   },
//   email: {
//     type: String,
//     required: [true, 'Email is required'],
//     unique: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   password: {
//     type: String,
//     required: [true, 'Password is required'],
//     minlength: [6, 'Password must be at least 6 characters']
//   },
//   phone: {
//     type: String,
//     required: [true, 'Phone number is required'],
//     match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
//   },
//   businessName: {
//     type: String,
//     required: [true, 'Business name is required'],
//     trim: true,
//     maxlength: [100, 'Business name cannot be more than 100 characters']
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: [500, 'Description cannot be more than 500 characters']
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       required: true,
//       validate: {
//         validator: function(coords) {
//           return coords.length === 2 && 
//                  coords[0] >= -180 && coords[0] <= 180 && 
//                  coords[1] >= -90 && coords[1] <= 90;
//         },
//         message: 'Invalid coordinates'
//       }
//     },
//     address: {
//       type: String,
//       required: [true, 'Address is required'],
//       trim: true
//     },
//     city: {
//       type: String,
//       required: [true, 'City is required'],
//       trim: true
//     },
//     state: {
//       type: String,
//       required: [true, 'State is required'],
//       trim: true
//     },
//     zipCode: {
//       type: String,
//       required: [true, 'ZIP code is required'],
//       trim: true
//     }
//   },
//   isAvailable: {
//     type: Boolean,
//     default: false
//   },
//   operatingHours: {
//     start: {
//       type: String,
//       required: [true, 'Operating start time is required'],
//       match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
//     },
//     end: {
//       type: String,
//       required: [true, 'Operating end time is required'],
//       match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
//     }
//   },
//   rating: {
//     type: Number,
//     default: 0,
//     min: 0,
//     max: 5
//   },
//   totalRatings: {
//     type: Number,
//     default: 0
//   },
//   lastLocationUpdate: {
//     type: Date,
//     default: Date.now
//   },
//   isVerified: {
//     type: Boolean,
//     default: false
//   }
// }, {
//   timestamps: true
// });

// // Create geospatial index for location queries
// vendorSchema.index({ location: '2dsphere' });

// // Hash password before saving
// vendorSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
  
//   try {
//     const salt = await bcrypt.genSalt(12);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Compare password method
// vendorSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// // Update location method
// vendorSchema.methods.updateLocation = function(coordinates, address) {
//   this.location.coordinates = coordinates;
//   if (address) {
//     this.location.address = address;
//   }
//   this.lastLocationUpdate = new Date();
//   return this.save();
// };

// // Calculate distance to a point (in kilometers)
// vendorSchema.methods.distanceTo = function(coordinates) {
//   const R = 6371; // Earth's radius in kilometers
//   const [lon1, lat1] = this.location.coordinates;
//   const [lon2, lat2] = coordinates;
  
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
  
//   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//             Math.sin(dLon/2) * Math.sin(dLon/2);
  
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// };

// module.exports = mongoose.model('Vendor', vendorSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      required: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'],
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // ⚠️ Location becomes optional on register (vendor will update later)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function (coords) {
            if (!coords || coords.length === 0) return true; // allow empty
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Invalid coordinates',
        },
      },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },

    isAvailable: {
      type: Boolean,
      default: false,
    },

    operatingHours: {
      start: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be HH:MM'],
      },
      end: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be HH:MM'],
      },
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ------------------ INDEXES ------------------ */
vendorSchema.index({ location: '2dsphere' });
vendorSchema.index({ businessName: 'text', name: 'text' });

/* ------------------ PASSWORD HASH ------------------ */
vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/* ------------------ PASSWORD COMPARE ------------------ */
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/* ------------------ LOCATION UPDATE ------------------ */
vendorSchema.methods.updateLocation = async function (coordinates, address) {
  if (!this.location) {
    this.location = { type: 'Point' };
  }

  this.location.coordinates = coordinates;

  if (address) this.location.address = address;

  this.lastLocationUpdate = new Date();

  return this.save();
};

/* ------------------ FORMAT JSON OUTPUT ------------------ */
vendorSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});
vendorSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('Vendor', vendorSchema);

