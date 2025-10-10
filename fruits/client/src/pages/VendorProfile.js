import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  Store, 
  Package,
  Navigation,
  Heart
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const VendorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    fetchVendorData();
    getUserLocation();
  }, [id]);

  const fetchVendorData = async () => {
    try {
      const response = await axios.get(`/api/vendors/${id}`);
      setVendor(response.data.vendor);
      setProducts(response.data.vendor.products || []);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast.error('Failed to load vendor information');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (vendor && userLocation) {
      const vendorCoords = [vendor.location.coordinates[1], vendor.location.coordinates[0]];
      const dist = calculateDistance(userLocation, vendorCoords);
      setDistance(dist);
    }
  }, [vendor, userLocation]);

  const handleContact = (type, value) => {
    if (type === 'phone') {
      window.open(`tel:${value}`);
    } else if (type === 'email') {
      window.open(`mailto:${value}`);
    }
  };

  const handleDirections = () => {
    if (vendor && userLocation) {
      const lat = vendor.location.coordinates[1];
      const lng = vendor.location.coordinates[0];
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Not Found</h1>
          <p className="text-gray-600 mb-4">The vendor you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const isCurrentlyOpen = () => {
    if (!vendor.operatingHours) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = vendor.operatingHours.start.split(':').map(Number);
    const [endHour, endMin] = vendor.operatingHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{vendor.businessName}</h1>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isCurrentlyOpen()
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isCurrentlyOpen() ? 'Open' : 'Closed'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vendor.isAvailable ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {vendor.isAvailable ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 mb-4">{vendor.name}</p>
              
              {vendor.description && (
                <p className="text-gray-700 mb-4">{vendor.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{vendor.rating.toFixed(1)} ({vendor.totalRatings} reviews)</span>
                </div>
                
                {distance && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{distance.toFixed(1)} km away</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{vendor.operatingHours.start} - {vendor.operatingHours.end}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 lg:mt-0 lg:ml-6">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleContact('phone', vendor.phone)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </button>
                
                <button
                  onClick={() => handleContact('email', vendor.email)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
                
                <button
                  onClick={handleDirections}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Directions</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Location */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">{vendor.location.address}</p>
                <p className="text-gray-600">
                  {vendor.location.city}, {vendor.location.state} {vendor.location.zipCode}
                </p>
              </div>
            </div>

            {/* Products */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Products ({products.length})
              </h3>
              
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">
                          ${product.price}/{product.unit}
                        </span>
                        <span className="text-sm text-gray-500">
                          Qty: {product.quantity}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="badge badge-primary text-xs">{product.category}</span>
                        {product.organic && <span className="badge badge-success text-xs">Organic</span>}
                        {product.local && <span className="badge badge-warning text-xs">Local</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.businessName}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <div>Mon - Sun: {vendor.operatingHours.start} - {vendor.operatingHours.end}</div>
                    <div className={`text-xs ${
                      isCurrentlyOpen() ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCurrentlyOpen() ? 'Currently Open' : 'Currently Closed'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <div>Rating: {vendor.rating.toFixed(1)}/5</div>
                    <div className="text-xs">Based on {vendor.totalRatings} reviews</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleContact('phone', vendor.phone)}
                  className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.phone}</span>
                </button>
                
                <button
                  onClick={() => handleContact('email', vendor.email)}
                  className="flex items-center space-x-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.email}</span>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDirections}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </button>
                
                <button className="w-full btn-outline flex items-center justify-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Add to Favorites</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;




