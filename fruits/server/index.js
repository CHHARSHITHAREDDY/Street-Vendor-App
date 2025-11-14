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

// Allowed frontend domains
const allowedOrigins = [
  'https://street-vendor-tau.vercel.app',
  'https://street-vendor-frontend2.vercel.app',
  'http://localhost:3000'
];

// EXPRESS CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Preflight
app.options('*', cors());

// SOCKET.IO CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join:vendor', (vendorId) => {
    if (vendorId) socket.join(`vendor:${vendorId}`);
  });

  socket.on('vendor:liveLocation', async (payload) => {
    try {
      const { vendorId, coordinates, address } = payload || {};
      if (!vendorId || !Array.isArray(coordinates) || coordinates.length !== 2) return;

      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return;

      await vendor.updateLocation(coordinates, address);

      if (!vendor.isAvailable) {
        vendor.isAvailable = true;
        await vendor.save();

        io.emit('vendor:availabilityUpdated', {
          vendorId: vendor._id.toString(),
          isAvailable: true,
        });
      }

      io.emit('vendor:locationUpdated', {
        vendorId: vendor._id.toString(),
        location: vendor.location,
        lastLocationUpdate: vendor.lastLocationUpdate,
      });
    } catch (e) {
      console.error('Socket error:', e);
    }
  });
});

// Security middleware
app.use(helmet());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// DB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running`)
    );
  })
  .catch((error) => {
    console.error('MongoDB error:', error);
    process.exit(1);
  });

module.exports = app;
