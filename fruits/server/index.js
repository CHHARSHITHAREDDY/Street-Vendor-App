// const express = require('express');
// const http = require('http');


// const { Server } = require('socket.io');
// const Vendor = require('./models/Vendor');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// require('dotenv').config();

// const app = express();
// app.set('trust proxy', 1);
// const server = http.createServer(app);
// const allowedOrigins = [
//   'https://street-vendor-tau.vercel.app',
//   'https://street-vendor-c4t6l5rv1-harshitha-reddys-projects-9b1f6a8f.vercel.app',
//   'http://localhost:3000'
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// const io = new Server(server, {
//   cors: {
//     origin: process.env.NODE_ENV === 'production'
//       ? ['https://street-vendor-tau.vercel.app']   // FIXED
//       : ['http://localhost:3000'],
//     credentials: true
//   }
// });


// app.set('io', io);

// io.on('connection', (socket) => {
//   // Basic connection log
//   // Join rooms by vendor id when client requests
//   socket.on('join:vendor', (vendorId) => {
//     if (vendorId) socket.join(`vendor:${vendorId}`);
//   });

//   // Live location updates pushed by vendors
//   socket.on('vendor:liveLocation', async (payload) => {
//     try {
//       const { vendorId, coordinates, address } = payload || {};
//       if (!vendorId || !Array.isArray(coordinates) || coordinates.length !== 2) return;
//       const [longitude, latitude] = coordinates;
//       if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return;

//       const vendor = await Vendor.findById(vendorId);
//       if (!vendor) return;

//       await vendor.updateLocation(coordinates, address);
//       if (!vendor.isAvailable) {
//         vendor.isAvailable = true;
//         await vendor.save();
//         io.emit('vendor:availabilityUpdated', {
//           vendorId: vendor._id.toString(),
//           isAvailable: true
//         });
//       }

//       io.emit('vendor:locationUpdated', {
//         vendorId: vendor._id.toString(),
//         location: vendor.location,
//         lastLocationUpdate: vendor.lastLocationUpdate
//       });
//     } catch (e) {
//       console.error('Socket liveLocation handler error:', e);
//     }
//   });
//   socket.on('disconnect', () => {});
// });

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// // CORS
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? 'https://street-vendor-tau.vercel.app'  // FIXED
//     : 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));


// // Allow preflight for all routes
// app.options('*', cors());

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/vendors', require('./routes/vendors'));
// app.use('/api/customers', require('./routes/customers'));
// app.use('/api/products', require('./routes/products'));

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     message: 'Something went wrong!',
//     error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//   });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Database connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/street-vendor-finder')
// .then(() => {
//   console.log('Connected to MongoDB');
//   const PORT = process.env.PORT || 5000;
//   server.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// })
// .catch((error) => {
//   console.error('MongoDB connection error:', error);
//   process.exit(1);
// });

// module.exports = app;
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const Vendor = require('./models/Vendor');

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);

// -------------------------------------------
// ALLOWED FRONTEND ORIGINS
// -------------------------------------------
const allowedOrigins = [
  'https://street-vendor-tau.vercel.app',
  'https://street-vendor-c4t6l5rv1-harshitha-reddys-projects-9b1f6a8f.vercel.app',
  'http://localhost:3000'
];

// -------------------------------------------
// EXPRESS CORS (MAIN CORS)
// -------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Allow preflight on all routes
app.options('*', cors());

// -------------------------------------------
// SOCKET.IO CORS
// -------------------------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set('io', io);

// -------------------------------------------
// SOCKET HANDLERS
// -------------------------------------------
io.on('connection', (socket) => {
  socket.on('join:vendor', (vendorId) => {
    if (vendorId) socket.join(`vendor:${vendorId}`);
  });

  socket.on('vendor:liveLocation', async (payload) => {
    try {
      const { vendorId, coordinates, address } = payload || {};
      if (!vendorId || !Array.isArray(coordinates) || coordinates.length !== 2)
        return;

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
    } catch (err) {
      console.error('Socket live location error:', err);
    }
  });
});

// -------------------------------------------
// SECURITY & BODY PARSING
// -------------------------------------------
app.use(helmet());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------
// ROUTES
// -------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/products', require('./routes/products'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// -------------------------------------------
// ERROR HANDLING
// -------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// -------------------------------------------
// DATABASE CONNECTION
// -------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

module.exports = app;
