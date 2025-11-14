// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link, useLocation } from 'react-router-dom';
// // import { 
// //   Search as SearchIcon, 
// //   MapPin, 
// //   Clock, 
// //   Star, 
// //   Heart, 
// //   History, 
// //   Settings as SettingsIcon,
// //   TrendingUp,
  
// // } from 'lucide-react';
// import { 
//   Search as SearchIcon, 
//   MapPin, 
//   Heart, 
//   Clock,
//   Star,
//   History, 
//   Settings as SettingsIcon,
//   TrendingUp
// } from 'lucide-react';

// import { useAuth } from '../context/AuthContext';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// // Dashboard Overview Component
// const DashboardOverview = () => {
//   const { user } = useAuth();
//   const [suggestions, setSuggestions] = useState([]);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [suggestionsRes, historyRes] = await Promise.all([
//         axios.get('/api/customers/suggestions'),
//         axios.get('/api/customers/search-history?limit=5')
//       ]);
      
//       setSuggestions(suggestionsRes.data.suggestions);
//       setRecentSearches(historyRes.data.history);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       toast.error('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
//         <p className="text-gray-600">Discover fresh products from local vendors near you</p>
//       </div>

//       {/* Quick Search */}
//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
//         <div className="flex space-x-4">
//           <div className="flex-1">
//             <input
//               type="text"
//               placeholder="Search for products..."
//               className="input-field"
//             />
//           </div>
//           <button className="btn-primary flex items-center space-x-2">
//             <SearchIcon className="w-4 h-4" />
//             <span>Search</span>
//           </button>
//         </div>
//       </div>

//       {/* Suggestions */}
//       {suggestions.length > 0 && (
//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested for You</h3>
//           <div className="flex flex-wrap gap-2">
//             {suggestions.map((suggestion, index) => (
//               <button
//                 key={index}
//                 className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
//               >
//                 {suggestion}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Recent Searches */}
//       {recentSearches.length > 0 && (
//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
//           <div className="space-y-2">
//             {recentSearches.map((search, index) => (
//               <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <SearchIcon className="w-4 h-4 text-gray-400" />
//                 <span className="text-gray-900">{search.query}</span>
//               </div>
//                 <div className="flex items-center space-x-2 text-sm text-gray-500">
//                   <Clock className="w-3 h-3" />
//                   <span>{new Date(search.timestamp).toLocaleDateString()}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Quick Actions */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Vendors</h3>
//           <p className="text-gray-600 mb-4">Discover vendors near your location</p>
//           <Link
//             to="/search"
//             className="btn-primary flex items-center space-x-2 w-full justify-center"
//           >
//             <MapPin className="w-4 h-4" />
//             <span>Browse Nearby</span>
//           </Link>
//         </div>

//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorites</h3>
//           <p className="text-gray-600 mb-4">View your favorite vendors</p>
//           <Link
//             to="/customer-dashboard/favorites"
//             className="btn-outline flex items-center space-x-2 w-full justify-center"
//           >
//             <Heart className="w-4 h-4" />
//             <span>View Favorites</span>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Search History Component
// const SearchHistory = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       const response = await axios.get('/api/customers/search-history');
//       setHistory(response.data.history);
//     } catch (error) {
//       console.error('Error fetching history:', error);
//       toast.error('Failed to load search history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearHistory = async () => {
//     if (window.confirm('Are you sure you want to clear all search history?')) {
//       try {
//         // This would need to be implemented in the backend
//         toast.success('Search history cleared');
//         setHistory([]);
//       } catch (error) {
//         console.error('Error clearing history:', error);
//         toast.error('Failed to clear history');
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
//           <p className="text-gray-600">Your recent searches and discoveries</p>
//         </div>
//         {history.length > 0 && (
//           <button
//             onClick={clearHistory}
//             className="btn-outline text-sm"
//           >
//             Clear All
//           </button>
//         )}
//       </div>

//       {history.length === 0 ? (
//         <div className="text-center py-12">
//           <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No search history</h3>
//           <p className="text-gray-600">Start searching to see your history here</p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {history.map((search, index) => (
//             <div key={index} className="card">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <SearchIcon className="w-5 h-5 text-primary-600" />
//                   <div>
//                     <h3 className="font-medium text-gray-900">{search.query}</h3>
//                     <p className="text-sm text-gray-600">
//                       {search.resultsCount} results found
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-4">
//                   <div className="text-sm text-gray-500">
//                     {new Date(search.timestamp).toLocaleString()}
//                   </div>
//                   <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
//                     Search Again
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Favorites Component
// const Favorites = () => {
//   const [favorites, setFavorites] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchFavorites();
//   }, []);

//   const fetchFavorites = async () => {
//     try {
//       // This would need to be implemented in the backend
//       setFavorites([]);
//     } catch (error) {
//       console.error('Error fetching favorites:', error);
//       toast.error('Failed to load favorites');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Favorite Vendors</h1>
//         <p className="text-gray-600">Your favorite street vendors</p>
//       </div>

//       {favorites.length === 0 ? (
//         <div className="text-center py-12">
//           <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
//           <p className="text-gray-600 mb-4">Start exploring vendors to add them to your favorites</p>
//           <Link
//             to="/search"
//             className="btn-primary"
//           >
//             Explore Vendors
//           </Link>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {favorites.map((vendor) => (
//             <div key={vendor._id} className="card-hover">
//               <div className="flex justify-between items-start mb-3">
//                 <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
//                 <div className="flex items-center">
//                   <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                   <span className="text-sm ml-1">{vendor.rating.toFixed(1)}</span>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-600 mb-3">{vendor.name}</p>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center text-sm text-gray-500">
//                   <MapPin className="w-3 h-3" />
//                   <span className="ml-1">{vendor.distance} km away</span>
//                 </div>
//                 <div className={`px-2 py-1 rounded-full text-xs ${
//                   vendor.isAvailable 
//                     ? 'bg-green-100 text-green-800' 
//                     : 'bg-red-100 text-red-800'
//                 }`}>
//                   {vendor.isAvailable ? 'Available' : 'Unavailable'}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Settings Component
// const Settings = () => {
  

//  const { user, updateUser } = useAuth();
//   const [preferences, setPreferences] = useState({
//     categories: [],
//     maxDistance: 10,
//     organic: false,
//     local: true
//   });
//   const [loading, setLoading] = useState(false);

//   const categories = [
//     'fruits', 'vegetables', 'dairy', 'meat', 'beverages', 
//     'snacks', 'bakery', 'grocery', 'other'
//   ];

//   const handlePreferenceChange = (key, value) => {
//     setPreferences(prev => ({ ...prev, [key]: value }));
//   };

//   const handleSave = async () => {
//     setLoading(true);
//     try {
//       await axios.put('/api/customers/preferences', preferences);
//       //updateUser({ preferences });
//       toast.success('Preferences updated successfully');
//     } catch (error) {
//       console.error('Error updating preferences:', error);
//       toast.error('Failed to update preferences');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
//         <p className="text-gray-600">Manage your account preferences</p>
//       </div>

//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Preferences</h3>
        
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Preferred Categories
//             </label>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
//               {categories.map(category => (
//                 <label key={category} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={preferences.categories.includes(category)}
//                     onChange={(e) => {
//                       const newCategories = e.target.checked
//                         ? [...preferences.categories, category]
//                         : preferences.categories.filter(c => c !== category);
//                       handlePreferenceChange('categories', newCategories);
//                     }}
//                     className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//                   />
//                   <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Maximum Search Distance (km)
//             </label>
//             <select
//               value={preferences.maxDistance}
//               onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
//               className="input-field"
//             >
//               <option value={5}>5 km</option>
//               <option value={10}>10 km</option>
//               <option value={25}>25 km</option>
//               <option value={50}>50 km</option>
//             </select>
//           </div>

//           <div className="flex items-center space-x-6">
//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={preferences.organic}
//                 onChange={(e) => handlePreferenceChange('organic', e.target.checked)}
//                 className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//               />
//               <span className="ml-2 text-sm text-gray-700">Prefer organic products</span>
//             </label>

//             <label className="flex items-center">
//               <input
//                 type="checkbox"
//                 checked={preferences.local}
//                 onChange={(e) => handlePreferenceChange('local', e.target.checked)}
//                 className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
//               />
//               <span className="ml-2 text-sm text-gray-700">Prefer local products</span>
//             </label>
//           </div>
//         </div>

//         <div className="flex justify-end mt-6">
//           <button
//             onClick={handleSave}
//             disabled={loading}
//             className="btn-primary disabled:opacity-50"
//           >
//             {loading ? 'Saving...' : 'Save Preferences'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Customer Dashboard Component
// const CustomerDashboard = () => {
//   const location = useLocation();

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <div className="card">
//               <nav className="space-y-2">
//                 <Link
//                   to="/customer-dashboard"
//                   className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     location.pathname === '/customer-dashboard'
//                       ? 'bg-primary-100 text-primary-700'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <TrendingUp className="w-4 h-4" />
//                   <span>Overview</span>
//                 </Link>
//                 <Link
//                   to="/customer-dashboard/history"
//                   className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     location.pathname === '/customer-dashboard/history'
//                       ? 'bg-primary-100 text-primary-700'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <History className="w-4 h-4" />
//                   <span>Search History</span>
//                 </Link>
//                 <Link
//                   to="/customer-dashboard/favorites"
//                   className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     location.pathname === '/customer-dashboard/favorites'
//                       ? 'bg-primary-100 text-primary-700'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Heart className="w-4 h-4" />
//                   <span>Favorites</span>
//                 </Link>
//                 <Link
//                   to="/customer-dashboard/settings"
//                   className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     location.pathname === '/customer-dashboard/settings'
//                       ? 'bg-primary-100 text-primary-700'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <SettingsIcon className="w-4 h-4" />
//                   <span>Settings</span>
//                 </Link>
//               </nav>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3">
//             <Routes>
//   <Route path="/customer-dashboard" element={<DashboardOverview />} />
//   <Route path="/customer-dashboard/history" element={<SearchHistory />} />
//   <Route path="/customer-dashboard/favorites" element={<Favorites />} />
//   <Route path="/customer-dashboard/settings" element={<Settings />} />
// </Routes>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CustomerDashboard;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  MapPin, 
  Heart, 
  Clock,
  Star,
  History, 
  Settings as SettingsIcon,
  TrendingUp
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/axios';     // ✅ UPDATED
import toast from 'react-hot-toast';

/* ------------------------------
   DASHBOARD OVERVIEW
--------------------------------*/
const DashboardOverview = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [suggestionsRes, historyRes] = await Promise.all([
        api.get('/api/customers/suggestions'),                // ✅ UPDATED
        api.get('/api/customers/search-history?limit=5')      // ✅ UPDATED
      ]);
      
      setSuggestions(suggestionsRes.data.suggestions);
      setRecentSearches(historyRes.data.history);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Discover fresh products from local vendors near you</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Search</h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for products..."
              className="input-field"
            />
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <SearchIcon className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested for You</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm hover:bg-primary-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{search.query}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(search.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Find Vendors</h3>
          <p className="text-gray-600 mb-4">Discover vendors near your location</p>
          <Link
            to="/search"
            className="btn-primary flex items-center space-x-2 w-full justify-center"
          >
            <MapPin className="w-4 h-4" />
            <span>Browse Nearby</span>
          </Link>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorites</h3>
          <p className="text-gray-600 mb-4">View your favorite vendors</p>
          <Link
            to="/customer-dashboard/favorites"
            className="btn-outline flex items-center space-x-2 w-full justify-center"
          >
            <Heart className="w-4 h-4" />
            <span>View Favorites</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------
   SEARCH HISTORY COMPONENT
--------------------------------*/
const SearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/customers/search-history');  // ✅ UPDATED
      setHistory(response.data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load search history');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      try {
        toast.success('Search history cleared');
        setHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error);
        toast.error('Failed to clear history');
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
          <h1 className="text-2xl font-bold text-gray-900">Search History</h1>
          <p className="text-gray-600">Your recent searches and discoveries</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="btn-outline text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No search history</h3>
          <p className="text-gray-600">Start searching to see your history here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((search, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SearchIcon className="w-5 h-5 text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{search.query}</h3>
                    <p className="text-sm text-gray-600">
                      {search.resultsCount} results found
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    {new Date(search.timestamp).toLocaleString()}
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Search Again
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------
   FAVORITES
--------------------------------*/
const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // Backend not implemented
      setFavorites([]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Favorite Vendors</h1>
        <p className="text-gray-600">Your favorite street vendors</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-4">Start exploring vendors to add them to your favorites</p>
          <Link
            to="/search"
            className="btn-primary"
          >
            Explore Vendors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((vendor) => (
            <div key={vendor._id} className="card-hover">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm ml-1">{vendor.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{vendor.name}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="ml-1">{vendor.distance} km away</span>
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
      )}
    </div>
  );
};

/* ------------------------------
   SETTINGS
--------------------------------*/
const Settings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    categories: [],
    maxDistance: 10,
    organic: false,
    local: true
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    'fruits', 'vegetables', 'dairy', 'meat', 'beverages', 
    'snacks', 'bakery', 'grocery', 'other'
  ];

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/customers/preferences', preferences);   // ✅ UPDATED
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.categories.includes(category)}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...preferences.categories, category]
                        : preferences.categories.filter(c => c !== category);
                      handlePreferenceChange('categories', newCategories);
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Search Distance (km)
            </label>
            <select
              value={preferences.maxDistance}
              onChange={(e) => handlePreferenceChange('maxDistance', parseInt(e.target.value))}
              className="input-field"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.organic}
                onChange={(e) => handlePreferenceChange('organic', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Prefer organic products</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.local}
                onChange={(e) => handlePreferenceChange('local', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Prefer local products</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------
   MAIN COMPONENT
--------------------------------*/
const CustomerDashboard = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-2">
                <Link
                  to="/customer-dashboard"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/customer-dashboard'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Overview</span>
                </Link>

                <Link
                  to="/customer-dashboard/history"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/customer-dashboard/history'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Search History</span>
                </Link>

                <Link
                  to="/customer-dashboard/favorites"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/customer-dashboard/favorites'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Favorites</span>
                </Link>

                <Link
                  to="/customer-dashboard/settings"
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/customer-dashboard/settings'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Routes>
              <Route path="/customer-dashboard" element={<DashboardOverview />} />
              <Route path="/customer-dashboard/history" element={<SearchHistory />} />
              <Route path="/customer-dashboard/favorites" element={<Favorites />} />
              <Route path="/customer-dashboard/settings" element={<Settings />} />
            </Routes>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
