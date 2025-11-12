import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Store, 
  Package, 
  MapPin, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  
  Star,
  
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import VendorLocation from './VendorLocation';
import VendorSettings from './VendorSettings';
import { socket } from '../index';

// Dashboard Overview Component
// Dashboard Overview Component
const DashboardOverview = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({
    productsCount: 0,
    availableProductsCount: 0,
    totalViews: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/vendors/profile');
        const vendor = response.data.vendor;
        setStats({
          productsCount: vendor.productsCount,
          availableProductsCount: vendor.availableProductsCount,
          totalViews: 0,
          rating: vendor.rating
        });

        updateUser({
          id: vendor.id,
          name: vendor.name,
          businessName: vendor.businessName,
          isAvailable: vendor.isAvailable,
          operatingHours: vendor.operatingHours,
          location: vendor.location
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [updateUser]);

  const toggleAvailability = async () => {
    try {
      const next = !user?.isAvailable;
      const res = await axios.put('/api/vendors/availability', { isAvailable: next });
      updateUser({ isAvailable: res.data?.isAvailable ?? next });
      toast.success(res.data?.message || (next ? 'You are now online' : 'You are now offline'));
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.productsCount,
      icon: <Package className="w-6 h-6" />,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Available Products',
      value: stats.availableProductsCount,
      icon: <ToggleRight className="w-6 h-6" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Rating',
      value: stats.rating.toFixed(1),
      icon: <Star className="w-6 h-6" />,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: 'Profile Views',
      value: stats.totalViews,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Business Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/vendor-dashboard/products/new"
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-primary-600" />
              <span>Add New Product</span>
            </Link>
            <Link
              to="/vendor-dashboard/location"
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-5 h-5 text-primary-600" />
              <span>Update Location</span>
            </Link>
            <Link
              to="/vendor-dashboard/settings"
              className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-primary-600" />
              <span>Account Settings</span>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Availability</span>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    user?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user?.isAvailable ? 'Online' : 'Offline'}
                </span>
                <button
                  onClick={toggleAvailability}
                  className={`px-2 py-1 text-xs rounded border ${
                    user?.isAvailable
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {user?.isAvailable ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operating Hours</span>
              <span className="text-sm text-gray-900">
                {user?.operatingHours?.start} - {user?.operatingHours?.end}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm text-gray-900">
                {user?.location?.city}, {user?.location?.state}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Management Component
const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, [filter]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('isAvailable', filter === 'available');
      }
      
      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductAvailability = async (productId, isAvailable) => {
    try {
      await axios.put(`/api/products/${productId}/availability`, { isAvailable });
      setProducts(prev => prev.map(p => 
        p._id === productId ? { ...p, isAvailable } : p
      ));
      toast.success(`Product ${isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        setProducts(prev => prev.filter(p => p._id !== productId));
        toast.success('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <Link
          to="/vendor-dashboard/products/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'available'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => setFilter('unavailable')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unavailable'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unavailable
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product._id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleProductAvailability(product._id, !product.isAvailable)}
                  className={`p-1 rounded ${
                    product.isAvailable 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {product.isAvailable ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <Link
                  to={`/vendor-dashboard/products/${product._id}/edit`}
                  className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-100 rounded"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-bold text-primary-600">
                ${product.price}/{product.unit}
              </span>
              <span className="text-sm text-gray-500">
                Qty: {product.quantity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="badge badge-primary">{product.category}</span>
              <div className="flex items-center space-x-1">
                {product.organic && <span className="badge badge-success text-xs">Organic</span>}
                {product.local && <span className="badge badge-warning text-xs">Local</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first product</p>
          <Link
            to="/vendor-dashboard/products/new"
            className="btn-primary"
          >
            Add Product
          </Link>
        </div>
      )}
    </div>
  );
};

// Add/Edit Product Component
const ProductForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'fruits',
    price: '',
    unit: 'kg',
    quantity: '',
    tags: [],
    organic: false,
    local: true
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'fruits', 'vegetables', 'dairy', 'meat', 'beverages', 
    'snacks', 'bakery', 'grocery', 'other'
  ];

  const units = [
    'kg', 'lb', 'piece', 'dozen', 'liter', 'gallon', 'pack', 'bunch', 'bag'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/products', formData);
      toast.success('Product created successfully');
      // Navigate back to products list
      window.history.back();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Add a new product to your inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="input-field"
            placeholder="Describe your product"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit *
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
              className="input-field"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>
                  {unit.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="organic"
              checked={formData.organic}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Organic</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="local"
              checked={formData.local}
              onChange={handleChange}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Local</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Vendor Dashboard Component
const VendorDashboard = () => {
  const location = useLocation();
  const { user } = useAuth();
  const watchIdRef = useRef(null);

  useEffect(() => {
    // Auto-start live GPS tracking for vendors on dashboard mount
    if (!user?.id) return;
    socket.emit('join:vendor', user.id);

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          socket.emit('vendor:liveLocation', {
            vendorId: user.id,
            coordinates: coords,
            timestamp: Date.now()
          });
        },
        (err) => {
          console.error('GPS watch error:', err);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-2">
                <Link
                  to="/vendor-dashboard"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/vendor-dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/vendor-dashboard/products"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/vendor-dashboard/products')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </Link>
                <Link
                  to="/vendor-dashboard/location"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/vendor-dashboard/location'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </Link>
                <Link
                  to="/vendor-dashboard/settings"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/vendor-dashboard/settings'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/products" element={<ProductsManagement />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/location" element={<VendorLocation />} />
              <Route path="/settings" element={<VendorSettings />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
