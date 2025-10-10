const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(coords) {
          return !coords || (coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90);
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    }
  },
  preferences: {
    categories: [{
      type: String,
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
    }],
    maxDistance: {
      type: Number,
      default: 10, // in kilometers
      min: 1,
      max: 100
    },
    organic: {
      type: Boolean,
      default: false
    },
    local: {
      type: Boolean,
      default: true
    }
  },
  searchHistory: [{
    query: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resultsCount: Number
  }],
  favoriteVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location queries
customerSchema.index({ location: '2dsphere' });
customerSchema.index({ 'searchHistory.timestamp': -1 });

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Remove location if it doesn't have coordinates
customerSchema.pre('save', function(next) {
  if (this.location && (!this.location.coordinates || this.location.coordinates.length !== 2)) {
    this.location = undefined;
  }
  next();
});

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add search to history
customerSchema.methods.addSearchHistory = function(query, location, resultsCount) {
  this.searchHistory.unshift({
    query,
    location: location ? {
      type: 'Point',
      coordinates: location
    } : undefined,
    resultsCount
  });
  
  // Keep only last 50 searches
  if (this.searchHistory.length > 50) {
    this.searchHistory = this.searchHistory.slice(0, 50);
  }
  
  return this.save();
};

// Get personalized suggestions based on search history
customerSchema.methods.getPersonalizedSuggestions = function() {
  const recentSearches = this.searchHistory.slice(0, 10);
  const searchCounts = {};
  
  recentSearches.forEach(search => {
    const words = search.query.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 2) { // Ignore very short words
        searchCounts[word] = (searchCounts[word] || 0) + 1;
      }
    });
  });
  
  // Return top 5 most searched terms
  return Object.entries(searchCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([term]) => term);
};

module.exports = mongoose.model('Customer', customerSchema);
