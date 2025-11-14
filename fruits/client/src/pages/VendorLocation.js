// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { MapPin, Navigation, Clock, Save, RotateCcw } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { socket } from '../index';

// const VendorLocation = () => {
//   const { user, updateUser } = useAuth();
//   const watchIdRef = useRef(null);
//   const [location, setLocation] = useState({
//     coordinates: [0, 0],
//     address: '',
//     city: '',
//     state: '',
//     zipCode: ''
//   });
//   const [operatingHours, setOperatingHours] = useState({
//     start: '09:00',
//     end: '17:00'
//   });
//   const [loading, setLoading] = useState(false);
//   const [locationError, setLocationError] = useState(null);

//   useEffect(() => {
//     if (user?.location) {
//       setLocation({
//         coordinates: user.location.coordinates || [0, 0],
//         address: user.location.address || '',
//         city: user.location.city || '',
//         state: user.location.state || '',
//         zipCode: user.location.zipCode || ''
//       });
//     }
//     if (user?.operatingHours) {
//       setOperatingHours(user.operatingHours);
//     }

//     // Join vendor room and start geolocation watch
//     if (user?.id) {
//       socket.emit('join:vendor', user.id);
//     }

//     return () => {
//       if (watchIdRef.current && navigator.geolocation) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }
//     };
//   }, [user]);

//   const getCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation(prev => ({
//             ...prev,
//             coordinates: [position.coords.longitude, position.coords.latitude]
//           }));
//           setLocationError(null);
//           toast.success('Location updated successfully!');
//         },
//         (error) => {
//           setLocationError('Unable to get your location. Please enter manually.');
//           console.error('Location error:', error);
//           toast.error('Failed to get location');
//         }
//       );

//       // Start live tracking
//       try {
//         watchIdRef.current = navigator.geolocation.watchPosition(
//           (pos) => {
//             const coords = [pos.coords.longitude, pos.coords.latitude];
//             setLocation(prev => ({ ...prev, coordinates: coords }));
//             // Emit live location to server (optional if relying on REST PUT)
//             socket.emit('vendor:liveLocation', {
//               vendorId: user?.id,
//               coordinates: coords,
//               timestamp: Date.now()
//             });
//           },
//           (err) => {
//             console.error('Live tracking error:', err);
//           },
//           { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
//         );
//       } catch (e) {
//         console.error('Failed to start geolocation watch', e);
//       }
//     } else {
//       setLocationError('Geolocation is not supported by this browser');
//       toast.error('Geolocation not supported');
//     }
//   };

//   const handleLocationChange = (field, value) => {
//     setLocation(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleOperatingHoursChange = (field, value) => {
//     setOperatingHours(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleSaveLocation = async () => {
//     if (!location.coordinates || location.coordinates.length !== 2) {
//       toast.error('Please set your location coordinates');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.put('/api/vendors/location', {
//         coordinates: location.coordinates,
//         address: location.address
//       });

//       updateUser({
//         location: {
//           ...user.location,
//           coordinates: location.coordinates,
//           address: location.address,
//           city: location.city,
//           state: location.state,
//           zipCode: location.zipCode
//         }
//       });

//       toast.success('Location updated successfully!');
//     } catch (error) {
//       console.error('Location update error:', error);
//       toast.error('Failed to update location');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveOperatingHours = async () => {
//     setLoading(true);
//     try {
//       await axios.put('/api/vendors/profile', {
//         operatingHours
//       });

//       updateUser({
//         operatingHours
//       });

//       toast.success('Operating hours updated successfully!');
//     } catch (error) {
//       console.error('Operating hours update error:', error);
//       toast.error('Failed to update operating hours');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetToCurrent = () => {
//     if (user?.location) {
//       setLocation({
//         coordinates: user.location.coordinates || [0, 0],
//         address: user.location.address || '',
//         city: user.location.city || '',
//         state: user.location.state || '',
//         zipCode: user.location.zipCode || ''
//       });
//     }
//     if (user?.operatingHours) {
//       setOperatingHours(user.operatingHours);
//     }
//     toast.success('Reset to current settings');
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-gray-900">Location & Hours</h1>
//         <p className="text-gray-600">Manage your business location and operating hours</p>
//       </div>

//       {/* Location Section */}
//       <div className="card">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//             <MapPin className="w-5 h-5 mr-2" />
//             Business Location
//           </h3>
//           <button
//             onClick={resetToCurrent}
//             className="btn-outline text-sm flex items-center space-x-2"
//           >
//             <RotateCcw className="w-4 h-4" />
//             <span>Reset</span>
//           </button>
//         </div>

//         <div className="space-y-4">
//           {/* Get Current Location Button */}
//           <div>
//             <button
//               onClick={getCurrentLocation}
//               className="btn-primary flex items-center space-x-2"
//             >
//               <Navigation className="w-4 h-4" />
//               <span>Use Current Location</span>
//             </button>
//             {locationError && (
//               <p className="text-red-600 text-sm mt-2">{locationError}</p>
//             )}
//           </div>

//           {/* Location Fields */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Longitude
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 value={location.coordinates[0]}
//                 onChange={(e) => handleLocationChange('coordinates', [parseFloat(e.target.value) || 0, location.coordinates[1]])}
//                 className="input-field"
//                 placeholder="Longitude"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Latitude
//               </label>
//               <input
//                 type="number"
//                 step="any"
//                 value={location.coordinates[1]}
//                 onChange={(e) => handleLocationChange('coordinates', [location.coordinates[0], parseFloat(e.target.value) || 0])}
//                 className="input-field"
//                 placeholder="Latitude"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Address
//             </label>
//             <input
//               type="text"
//               value={location.address}
//               onChange={(e) => handleLocationChange('address', e.target.value)}
//               className="input-field"
//               placeholder="Enter your business address"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 City
//               </label>
//               <input
//                 type="text"
//                 value={location.city}
//                 onChange={(e) => handleLocationChange('city', e.target.value)}
//                 className="input-field"
//                 placeholder="City"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 State
//               </label>
//               <input
//                 type="text"
//                 value={location.state}
//                 onChange={(e) => handleLocationChange('state', e.target.value)}
//                 className="input-field"
//                 placeholder="State"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 ZIP Code
//               </label>
//               <input
//                 type="text"
//                 value={location.zipCode}
//                 onChange={(e) => handleLocationChange('zipCode', e.target.value)}
//                 className="input-field"
//                 placeholder="ZIP Code"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               onClick={handleSaveLocation}
//               disabled={loading}
//               className="btn-primary flex items-center space-x-2 disabled:opacity-50"
//             >
//               <Save className="w-4 h-4" />
//               <span>{loading ? 'Saving...' : 'Save Location'}</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Operating Hours Section */}
//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
//           <Clock className="w-5 h-5 mr-2" />
//           Operating Hours
//         </h3>

//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Opening Time
//               </label>
//               <input
//                 type="time"
//                 value={operatingHours.start}
//                 onChange={(e) => handleOperatingHoursChange('start', e.target.value)}
//                 className="input-field"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Closing Time
//               </label>
//               <input
//                 type="time"
//                 value={operatingHours.end}
//                 onChange={(e) => handleOperatingHoursChange('end', e.target.value)}
//                 className="input-field"
//               />
//             </div>
//           </div>

//           <div className="bg-blue-50 p-4 rounded-lg">
//             <h4 className="font-medium text-blue-900 mb-2">Current Schedule</h4>
//             <p className="text-blue-700">
//               {operatingHours.start} - {operatingHours.end}
//             </p>
//             <p className="text-sm text-blue-600 mt-1">
//               Customers will see these hours on your profile
//             </p>
//           </div>

//           <div className="flex justify-end">
//             <button
//               onClick={handleSaveOperatingHours}
//               disabled={loading}
//               className="btn-primary flex items-center space-x-2 disabled:opacity-50"
//             >
//               <Save className="w-4 h-4" />
//               <span>{loading ? 'Saving...' : 'Save Hours'}</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Current Status */}
//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h4 className="font-medium text-gray-700 mb-2">Location</h4>
//             <p className="text-sm text-gray-600">
//               {user?.location?.address || 'No address set'}
//             </p>
//             <p className="text-sm text-gray-500">
//               {user?.location?.city && user?.location?.state 
//                 ? `${user.location.city}, ${user.location.state}` 
//                 : 'No city/state set'
//               }
//             </p>
//           </div>
//           <div>
//             <h4 className="font-medium text-gray-700 mb-2">Operating Hours</h4>
//             <p className="text-sm text-gray-600">
//               {user?.operatingHours?.start} - {user?.operatingHours?.end}
//             </p>
//             <p className="text-sm text-gray-500">
//               {user?.isAvailable ? 'Currently Available' : 'Currently Unavailable'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorLocation;



import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MapPin, Navigation, Clock, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../index';
import api from '../api/axios';   // ✅ FIXED — use global axios instance

const VendorLocation = () => {
  const { user, updateUser } = useAuth();
  const watchIdRef = useRef(null);

  const [location, setLocation] = useState({
    coordinates: [0, 0],
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [operatingHours, setOperatingHours] = useState({
    start: '09:00',
    end: '17:00'
  });

  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (user?.location) {
      setLocation({
        coordinates: user.location.coordinates || [0, 0],
        address: user.location.address || '',
        city: user.location.city || '',
        state: user.location.state || '',
        zipCode: user.location.zipCode || ''
      });
    }

    if (user?.operatingHours) {
      setOperatingHours(user.operatingHours);
    }

    if (user?.id) {
      socket.emit('join:vendor', user.id);
    }

    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user]);

  // Get Current GPS Location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      toast.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(prev => ({
          ...prev,
          coordinates: [position.coords.longitude, position.coords.latitude]
        }));
        setLocationError(null);
        toast.success("Location updated!");

        // Start continuous live tracking
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            setLocation(prev => ({ ...prev, coordinates: coords }));

            socket.emit("vendor:liveLocation", {
              vendorId: user?.id,
              coordinates: coords,
              timestamp: Date.now()
            });
          },
          (err) => console.error("Live location error", err),
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Unable to get location");
        toast.error("Failed to get location");
      }
    );
  };

  const handleLocationChange = (field, value) => {
    setLocation(prev => ({ ...prev, [field]: value }));
  };

  const handleOperatingHoursChange = (field, value) => {
    setOperatingHours(prev => ({ ...prev, [field]: value }));
  };

  // Save Business Location
  const handleSaveLocation = async () => {
    if (!location.coordinates || location.coordinates.length !== 2) {
      toast.error("Invalid location coordinates");
      return;
    }

    setLoading(true);
    try {
      // ❌ axios.put
      // ✔ api.put
      await api.put('/api/vendors/location', {
        coordinates: location.coordinates,
        address: location.address,
        city: location.city,
        state: location.state,
        zipCode: location.zipCode
      });

      updateUser({
        location: {
          coordinates: location.coordinates,
          address: location.address,
          city: location.city,
          state: location.state,
          zipCode: location.zipCode
        }
      });

      toast.success("Location saved!");
    } catch (error) {
      console.error("Location update error:", error);
      toast.error("Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  // Save Operating Hours
  const handleSaveOperatingHours = async () => {
    setLoading(true);
    try {
      await api.put('/api/vendors/profile', { operatingHours });

      updateUser({ operatingHours });

      toast.success("Operating hours updated!");
    } catch (error) {
      console.error("Hours update error:", error);
      toast.error("Failed to update hours");
    } finally {
      setLoading(false);
    }
  };

  const resetToCurrent = () => {
    if (user?.location) {
      setLocation({
        coordinates: user.location.coordinates || [0, 0],
        address: user.location.address || '',
        city: user.location.city || '',
        state: user.location.state || '',
        zipCode: user.location.zipCode || ''
      });
    }
    if (user?.operatingHours) {
      setOperatingHours(user.operatingHours);
    }
    toast.success("Reset to current values");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Location & Hours</h1>
        <p className="text-gray-600">Update your business details</p>
      </div>

      {/* LOCATION SECTION */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Business Location
          </h3>
          <button onClick={resetToCurrent} className="btn-outline flex items-center">
            <RotateCcw className="w-4 h-4 mr-1" /> Reset
          </button>
        </div>

        <div className="space-y-4">
          <button onClick={getCurrentLocation} className="btn-primary flex items-center">
            <Navigation className="w-4 h-4 mr-1" />
            Use Current Location
          </button>

          {locationError && <p className="text-red-600 text-sm">{locationError}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              value={location.coordinates[0]}
              onChange={(e) =>
                handleLocationChange("coordinates", [
                  parseFloat(e.target.value) || 0,
                  location.coordinates[1]
                ])
              }
              className="input-field"
              placeholder="Longitude"
            />

            <input
              type="number"
              step="any"
              value={location.coordinates[1]}
              onChange={(e) =>
                handleLocationChange("coordinates", [
                  location.coordinates[0],
                  parseFloat(e.target.value) || 0
                ])
              }
              className="input-field"
              placeholder="Latitude"
            />
          </div>

          <input
            type="text"
            className="input-field"
            value={location.address}
            onChange={(e) => handleLocationChange("address", e.target.value)}
            placeholder="Address"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              className="input-field"
              value={location.city}
              onChange={(e) => handleLocationChange("city", e.target.value)}
              placeholder="City"
            />

            <input
              type="text"
              className="input-field"
              value={location.state}
              onChange={(e) => handleLocationChange("state", e.target.value)}
              placeholder="State"
            />

            <input
              type="text"
              className="input-field"
              value={location.zipCode}
              onChange={(e) => handleLocationChange("zipCode", e.target.value)}
              placeholder="ZIP Code"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveLocation}
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? "Saving..." : "Save Location"}
            </button>
          </div>
        </div>
      </div>

      {/* OPERATING HOURS */}
      <div className="card">
        <h3 className="text-lg font-semibold flex items-center mb-6">
          <Clock className="w-5 h-5 mr-2" />
          Operating Hours
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="time"
              className="input-field"
              value={operatingHours.start}
              onChange={(e) => handleOperatingHoursChange("start", e.target.value)}
            />

            <input
              type="time"
              className="input-field"
              value={operatingHours.end}
              onChange={(e) => handleOperatingHoursChange("end", e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Current Schedule</h4>
            <p className="text-blue-700">
              {operatingHours.start} – {operatingHours.end}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveOperatingHours}
              disabled={loading}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? "Saving..." : "Save Hours"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VendorLocation;
