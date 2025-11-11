# Street Vendor Application

A full-stack MERN application connecting street vendors with customers, featuring real-time location tracking, search functionality, and vendor management.

## Features

- 🏪 **Vendor Dashboard**: Manage products, location, and availability
- 🔍 **Customer Search**: Find nearby vendors and products
- 📍 **Real-time Location Tracking**: Live GPS updates for vendors
- ⏰ **Operating Hours**: Automatic open/closed status
- 📱 **Responsive Design**: Works on all devices
- 🔐 **Authentication**: Secure JWT-based auth for vendors and customers
- 📊 **Search History**: Track customer search patterns

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB with Mongoose
- **Maps**: Leaflet/React-Leaflet
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CHHARSHITHAREDDY/street-vendor-application.git
cd street-vendor-application/fruits
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:

Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/street-vendor-finder
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

4. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend client on `http://localhost:3000`

## Project Structure

```
fruits/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
├── server/          # Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
└── package.json
```

## Environment Variables

### Backend
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: Token expiration (default: 7d)
- `PORT`: Server port (default: 5000)

### Frontend
- `REACT_APP_API_BASE`: Backend API URL

## API Endpoints

### Authentication
- `POST /api/auth/vendor/register` - Register vendor
- `POST /api/auth/vendor/login` - Vendor login
- `POST /api/auth/customer/register` - Register customer
- `POST /api/auth/customer/login` - Customer login
- `GET /api/auth/me` - Get current user

### Vendors
- `GET /api/vendors/profile` - Get vendor profile
- `PUT /api/vendors/profile` - Update vendor profile
- `PUT /api/vendors/location` - Update vendor location
- `PUT /api/vendors/availability` - Toggle availability
- `GET /api/vendors/nearby` - Get nearby vendors

### Customers
- `GET /api/customers/search` - Search products/vendors
- `GET /api/customers/search-history` - Get search history
- `POST /api/customers/search-history` - Add to search history

### Products
- `GET /api/products` - Get products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Author

CHHARSHITHAREDDY - [GitHub](https://github.com/CHHARSHITHAREDDY)
