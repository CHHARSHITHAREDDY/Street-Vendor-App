import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, Store, Users, Clock, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, userType } = useAuth();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location');
          console.error('Location error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser');
    }
  }, []);

  const handleSearch = () => {
    if (userLocation) {
      navigate('/search', { state: { location: userLocation } });
    } else {
      navigate('/search');
    }
  };

  const features = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Find Nearby Vendors",
      description: "Discover street vendors in your area with real-time location tracking"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description: "Search for specific products and get personalized recommendations"
    },
    {
      icon: <Store className="w-6 h-6" />,
      title: "Vendor Management",
      description: "Vendors can easily manage their products and availability status"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Connect local communities with fresh, local products"
    }
  ];

  const stats = [
    { number: "500+", label: "Active Vendors" },
    { number: "10K+", label: "Happy Customers" },
    { number: "50+", label: "Cities Covered" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Fresh Products from
              <span className="text-primary-600"> Local Vendors</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with street vendors in your area and discover fresh, local products. 
              Search, browse, and find the best deals from vendors near you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleSearch}
                className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Search Now</span>
              </button>
              
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn-outline text-lg px-8 py-3 flex items-center space-x-2"
                >
                  <Store className="w-5 h-5" />
                  <span>Become a Vendor</span>
                </Link>
              )}
            </div>

            {locationError && (
              <div className="text-sm text-red-600 mb-4">
                {locationError}
              </div>
            )}

            {userLocation && (
              <div className="text-sm text-green-600 flex items-center justify-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Location detected - Ready to search!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose StreetVendor?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make it easy to connect with local vendors and discover fresh products in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to find and connect with local vendors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Search Products
              </h3>
              <p className="text-gray-600">
                Enter what you're looking for and we'll find vendors near you
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Browse Vendors
              </h3>
              <p className="text-gray-600">
                View available vendors on the map or in a list with distance and ratings
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect & Buy
              </h3>
              <p className="text-gray-600">
                Contact vendors directly and get fresh products delivered or pick up
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-primary-100">
              Thousands of vendors and customers trust StreetVendor
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of vendors and customers who are already using StreetVendor
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <span>Get Started as Customer</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="btn-outline text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <Store className="w-5 h-5" />
                  <span>Become a Vendor</span>
                </Link>
              </>
            ) : (
              <Link
                to="/search"
                className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Start Searching</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;




