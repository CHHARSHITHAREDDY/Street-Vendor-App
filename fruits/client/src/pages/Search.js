import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search as SearchIcon, MapPin, Star, Clock, Filter, X, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { socket } from '../index';
import { useAuth } from '../context/AuthContext';

// Map component to handle location updates
const MapComponent = ({ center, vendors, onLocationChange }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);

  return null;
};

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ products: [], vendors: [] });
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [filters, setFilters] = useState({
    category: '',
    maxDistance: 10,
    organic: false,
    local: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [history, setHistory] = useState([]);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'meat', label: 'Meat' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setMapCenter(coords);
        },
        (error) => {
          console.error('Location error:', error);
          toast.error('Unable to get your location');
        }
      );
    }

    // If location was passed from home page
    if (location.state?.location) {
      const coords = [location.state.location.latitude, location.state.location.longitude];
      setUserLocation(coords);
      setMapCenter(coords);
    }
  }, [location.state]);

  // Load customer search history
  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated || userType !== 'customer') return;
      try {
        const res = await axios.get('/api/customers/search-history', { params: { limit: 10 } });
        setHistory(res.data?.history || []);
      } catch (e) {
        // non-blocking
      }
    };
    loadHistory();
  }, [isAuthenticated, userType]);

  // Live updates via websockets
  useEffect(() => {
    const handleLocationUpdated = (payload) => {
      setSearchResults((prev) => {
        const vendors = prev.vendors.map((v) =>
          v._id === payload.vendorId
            ? { ...v, location: payload.location, distance: v.distance }
            : v
        );
        return { ...prev, vendors };
      });
    };

    const handleAvailabilityUpdated = (payload) => {
      setSearchResults((prev) => {
        const vendors = prev.vendors.map((v) =>
          v._id === payload.vendorId
            ? { ...v, isAvailable: payload.isAvailable }
            : v
        );
        return { ...prev, vendors };
      });
    };

    socket.on('vendor:locationUpdated', handleLocationUpdated);
    socket.on('vendor:availabilityUpdated', handleAvailabilityUpdated);
    return () => {
      socket.off('vendor:locationUpdated', handleLocationUpdated);
      socket.off('vendor:availabilityUpdated', handleAvailabilityUpdated);
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    if (!userLocation) {
      toast.error('Location is required for search');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        longitude: userLocation[1],
        latitude: userLocation[0],
        maxDistance: filters.maxDistance,
        ...(filters.category && { category: filters.category }),
        ...(filters.organic && { organic: filters.organic }),
        ...(filters.local && { local: filters.local })
      });

      const response = await axios.get(`/api/customers/search?${params}`);
      setSearchResults(response.data);

      // Record search history for authenticated customers
      if (isAuthenticated && userType === 'customer') {
        try {
          await axios.post('/api/customers/search-history', {
            query: searchQuery,
            location: { coordinates: [userLocation[1], userLocation[0]] },
            resultsCount: (response.data.products?.length || 0) + (response.data.vendors?.length || 0)
          });
          // Optimistically refresh history list
          setHistory(prev => [{
            query: searchQuery,
            location: { type: 'Point', coordinates: [userLocation[1], userLocation[0]] },
            timestamp: new Date().toISOString(),
            resultsCount: (response.data.products?.length || 0) + (response.data.vendors?.length || 0)
          }, ...prev].slice(0, 10));
        } catch (e) {
          // ignore
        }
      }
      
      if (response.data.products.length === 0 && response.data.vendors.length === 0) {
        toast.error('No results found. Try adjusting your search or filters.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      maxDistance: 10,
      organic: false,
      local: true
    });
  };

  const getMarkerIcon = (vendor) => {
    const color = vendor.isAvailable ? '#10b981' : '#ef4444';
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const runHistorySearch = (item) => {
    setSearchQuery(item.query);
    if (item.location?.coordinates?.length === 2) {
      const lat = item.location.coordinates[1];
      const lon = item.location.coordinates[0];
      setUserLocation([lat, lon]);
      setMapCenter([lat, lon]);
    }
    // Fire after state updates
    setTimeout(() => handleSearch(), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="input-field pl-10 pr-4"
                  placeholder="Search for products (e.g., bananas, milk, bread)..."
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <SearchIcon className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-field"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Distance (km)
                  </label>
                  <select
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.organic}
                      onChange={(e) => handleFilterChange('organic', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Organic</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.local}
                      onChange={(e) => handleFilterChange('local', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Local</span>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearFilters}
                    className="btn-outline text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search History (customers) */}
          {isAuthenticated && userType === 'customer' && history.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-800">Recent Searches</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => runHistorySearch(item)}
                    className="px-3 py-1 rounded-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                    title={new Date(item.timestamp).toLocaleString()}
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results
            </h2>
            <div className="text-sm text-gray-600">
              {searchResults.products.length} products, {searchResults.vendors.length} vendors
            </div>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          /* Map View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {userLocation && (
                    <Marker position={[userLocation[0], userLocation[1]]}>
                      <Popup>Your Location</Popup>
                    </Marker>
                  )}

                  {searchResults.vendors.map((vendor) => (
                    <Marker
                      key={vendor._id}
                      position={[vendor.location.coordinates[1], vendor.location.coordinates[0]]}
                      icon={getMarkerIcon(vendor)}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-sm">{vendor.businessName}</h3>
                          <p className="text-xs text-gray-600">{vendor.name}</p>
                          <p className="text-xs text-gray-500">
                            {vendor.distance} km away
                          </p>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs ml-1">{vendor.rating.toFixed(1)}</span>
                          </div>
                          <button
                            onClick={() => navigate(`/vendor/${vendor._id}`)}
                            className="mt-2 text-xs text-primary-700 hover:underline"
                          >
                            View Profile
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  <MapComponent center={mapCenter} vendors={searchResults.vendors} />
                </MapContainer>
              </div>
            </div>

            {/* Vendor List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Nearby Vendors</h3>
              {searchResults.vendors.map((vendor) => (
                <div key={vendor._id} className="card-hover cursor-pointer" onClick={() => navigate(`/vendor/${vendor._id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{vendor.businessName}</h4>
                      <p className="text-sm text-gray-600">{vendor.name}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs ml-1">{vendor.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="ml-1">{vendor.distance} km</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      vendor.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Products */}
            {searchResults.products.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.products.map((product) => (
                    <div key={product._id} className="card-hover">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <span className="text-lg font-bold text-primary-600">
                          ${product.price}/{product.unit}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="badge badge-primary">{product.category}</span>
                          {product.organic && <span className="badge badge-success">Organic</span>}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.distance} km away
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendors */}
            {searchResults.vendors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.vendors.map((vendor) => (
                    <div key={vendor._id} className="card-hover">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{vendor.businessName}</h4>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          vendor.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vendor.isAvailable ? 'Available' : 'Unavailable'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{vendor.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs ml-1">{vendor.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="ml-1">{vendor.distance} km</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {vendor.location.address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.products.length === 0 && searchResults.vendors.length === 0 && !loading && (
              <div className="text-center py-12">
                <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
