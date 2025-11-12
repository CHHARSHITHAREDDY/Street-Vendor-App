const express = require('express');
const http = require('http');


const { Server } = require('socket.io');
const Vendor = require('./models/Vendor');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://street-vendor-frontend2.vercel.app']
      : ['http://localhost:3000'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  // Basic connection log
  // Join rooms by vendor id when client requests
  socket.on('join:vendor', (vendorId) => {
    if (vendorId) socket.join(`vendor:${vendorId}`);
  });

  // Live location updates pushed by vendors
  socket.on('vendor:liveLocation', async (payload) => {
    try {
      const { vendorId, coordinates, address } = payload || {};
      if (!vendorId || !Array.isArray(coordinates) || coordinates.length !== 2) return;
      const [longitude, latitude] = coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return;

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return;

      await vendor.updateLocation(coordinates, address);
      if (!vendor.isAvailable) {
        vendor.isAvailable = true;
        await vendor.save();
        io.emit('vendor:availabilityUpdated', {
          vendorId: vendor._id.toString(),
          isAvailable: true
        });
      }

      io.emit('vendor:locationUpdated', {
        vendorId: vendor._id.toString(),
        location: vendor.location,
        lastLocationUpdate: vendor.lastLocationUpdate
      });
    } catch (e) {
      console.error('Socket liveLocation handler error:', e);
    }
  });
  socket.on('disconnect', () => {});
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://street-vendor-frontend2.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/street-vendor-finder')
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

module.exports = app;
