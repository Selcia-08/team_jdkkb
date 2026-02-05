import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, Globe, ChevronRight, Map as MapIcon, Package, Leaf, 
  Bell, Calendar, CreditCard, MapPin, LogOut, BarChart3, User, Phone 
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// MapUpdater: fixes grey tiles and smoothly animates map to center
function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (!map) return;
    
    // Fix grey tiles rendering bug
    const invalidateId = setTimeout(() => {
      try { map.invalidateSize(); } catch (e) { }
    }, 200);
    
    // Smooth animation to new center
    if (center && center.length === 2) {
      try {
        map.flyTo(center, 14, { duration: 1 });
      } catch (e) {
        // fallback to setView if flyTo fails
        try { map.setView(center, 14); } catch (e2) { }
      }
    }
    
    return () => clearTimeout(invalidateId);
  }, [map, center]);
  return null;
}

// --- GLOBAL LANGUAGES ---
const translations = {
  en: { 
    tagline: "Moving the World, Sustaining the Planet", 
    start: "Get Started", 
    hub: "Smart Routing for Inter-Hub Delivery",
    loginTitle: "Access Portal",
    userId: "User ID",
    password: "Password",
    enter: "Sign In",
    asLogistics: "Logistics Partner",
    asSeller: "Seller Hub",
    name: "Full Name",
    phone: "Phone Number"
  },
  ta: { 
    tagline: "உலகை நகர்த்துகிறோம், கிரகத்தை நிலைநிறுத்துகிறோம்", 
    start: "தொடங்கவும்", 
    hub: "மையங்களுக்கு இடையிலான ஸ்மார்ட் ரூட்டிங்",
    loginTitle: "அணுகல் போர்டல்",
    userId: "பயனர் அடையாளம்",
    password: "கடவுச்சொல்",
    enter: "உள்நுழைக",
    asLogistics: "தளவாட கூட்டாளர்",   
    asSeller: "விற்பனையாளர் மையம்",
    name: "முழு பெயர்",
    phone: "தொலைபேசி எண்"
  },
  hi: { 
    tagline: "दुनिया को गति देना, बचाना ग्रह", 
    start: "शुरू करें", 
    hub: "इंटर-हब डिलीवरी के लिए स्मार्ट रूटिंग",
    loginTitle: "प्रवेश द्वार",
    userId: "यूजर आईडी",
    password: "पासवर्ड",
    enter: "साइन इन करें",
    asLogistics: "लॉजिस्टिक्स पार्टनर",
    asSeller: "विक्रेता हब",
    name: "पूरा नाम",
    phone: "फ़ोन नंबर"
  }
};

// --- GLOBAL THEME WRAPPER ---
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="h-screen w-full bg-[#020617] text-slate-100 flex overflow-hidden"
  >
    {children}
  </motion.div>
);

// --- COMPONENTS ---

const Landing = ({ lang, setLang }) => {
  const t = translations[lang];
  return (
    <PageWrapper>
      <div className="flex-1 flex flex-col items-center justify-center relative px-6">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full" />
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="Blue Compass Logo" className="w-40 md:w-56 h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <h1 className="mt-6 text-5xl md:text-7xl font-black tracking-tighter text-white">
            BLUE <span className="text-amber-500">COMPASS</span>
          </h1>
        </motion.div>
        <motion.h2 key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-500 font-bold tracking-[0.2em] uppercase text-sm md:text-base text-center mb-2">
          {t.tagline}
        </motion.h2>
        <p className="text-slate-500 text-xs mb-12 italic tracking-widest">{t.hub}</p>
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5 pointer-events-none" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-slate-900 border border-slate-800 text-white pl-12 pr-10 py-4 rounded-2xl outline-none appearance-none cursor-pointer hover:bg-slate-800 transition-all">
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
          <Link to="/login" className="bg-amber-500 text-black font-black px-10 py-4 rounded-2xl hover:bg-amber-400 flex items-center gap-3 shadow-xl transition-transform active:scale-95">
            {t.start.toUpperCase()} <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
};

const Login = ({ lang }) => {
  const [role, setRole] = useState('logistics');
  const navigate = useNavigate();
  const t = translations[lang];
  const handleLogin = (e) => { e.preventDefault(); navigate(role === 'logistics' ? '/logistics' : '/seller'); };

  return (
    <PageWrapper>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 bg-slate-900/40 rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-amber-500/10 to-emerald-500/5 border-r border-white/5">
            <h2 className="text-3xl font-bold text-white mb-6">{t.loginTitle}</h2>
            <div className="space-y-4">
              <button onClick={() => setRole('logistics')} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${role === 'logistics' ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-white/5 text-slate-500'}`}>
                <span className="font-bold">{t.asLogistics}</span>
                <div className={`w-4 h-4 rounded-full ${role === 'logistics' ? 'bg-amber-500' : 'border border-slate-600'}`} />
              </button>
              <button onClick={() => setRole('seller')} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${role === 'seller' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-white/5 text-slate-500'}`}>
                <span className="font-bold">{t.asSeller}</span>
                <div className={`w-4 h-4 rounded-full ${role === 'seller' ? 'bg-emerald-500' : 'border border-slate-600'}`} />
              </button>
            </div>
          </div>
          <div className="p-10 flex flex-col justify-center bg-slate-950/50">
            <form onSubmit={handleLogin} className="space-y-4">
              <AnimatePresence mode="wait">
                {role === 'seller' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.name}</label>
                      <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" /><input required type="text" className="w-full bg-slate-900 border border-white/5 p-4 pl-12 rounded-xl mt-1 text-white focus:border-emerald-500/50 outline-none" placeholder="Arul Kumar" /></div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.phone}</label>
                      <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" /><input required type="tel" className="w-full bg-slate-900 border border-white/5 p-4 pl-12 rounded-xl mt-1 text-white focus:border-emerald-500/50 outline-none" placeholder="+91 98765 43210" /></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.userId}</label>
                <input required type="text" className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl mt-1 text-white focus:border-amber-500/50 outline-none" placeholder="BC-IND-101" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.password}</label>
                <input required type="password" className="w-full bg-slate-900 border border-white/5 p-4 rounded-xl mt-1 text-white focus:border-amber-500/50 outline-none" placeholder="••••••••" />
              </div>
              <button type="submit" className={`w-full font-black py-4 rounded-xl mt-4 transition-all active:scale-95 ${role === 'seller' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]'}`}>
                {t.enter.toUpperCase()}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

const LogisticsDashboard = ({ lang }) => {
  const [activeTab, setActiveTab] = useState('camera');
  const [counts, setCounts] = useState({ a: 0, b: 0 });
  const t = translations[lang];
  const ESP32_IP = "http://10.124.211.137/capture";
  const PYTHON_BACKEND = "http://localhost:5001";

  // Notifications and locations
  const [notifications, setNotifications] = useState([
    { id: 'n1', sender: 'Ravi Kumar', locationName: 'Salem Hub', lat: 11.6643, lng: 78.1460 },
    { id: 'n2', sender: 'Meera Iyer', locationName: 'Koramangala Depot', lat: 12.9352, lng: 77.6245 },
    { id: 'n3', sender: 'Karthik S', locationName: 'Chennai Collection', lat: 13.0827, lng: 80.2707 }
  ]);
  const [locations, setLocations] = useState([]); // accepted notifications appear here
  const [showNotifications, setShowNotifications] = useState(false);

  // Optimization & routing states
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [sortedStops, setSortedStops] = useState([]); // stops order returned from backend
  const [roadPath, setRoadPath] = useState([]); // array of [lat, lng] from OSRM geometry
  const [routeStats, setRouteStats] = useState(null); // stats returned from optimizer (/optimize)
  const [optimizationStats, setOptimizationStats] = useState(null); // stats from /optimize for fleet tab
  const [calculationLogs, setCalculationLogs] = useState('');
  const [totalDrivingDistance, setTotalDrivingDistance] = useState(0); // meters

  // Manual emission estimator state
  const [manualDistance, setManualDistance] = useState('');
  const [manualWeight, setManualWeight] = useState('');
  const [manualMode, setManualMode] = useState('road');
  const [manualEmission, setManualEmission] = useState(null);
  const [manualResult, setManualResult] = useState(null); // { emission_kg, baseline_kg, savings_kg }

  // Reset / counts poll
  const handleReset = async () => {
    try {
      await fetch('http://10.42.109.137/capture', { method: 'POST' });
      setCounts({ a: 0, b: 0 });
    } catch (err) { console.error("Reset failed:", err); }
  };

  // Fetch pending requests from backend and populate notifications
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/requests');
        if (response.ok) {
          const allRequests = await response.json();
          const pendingRequests = allRequests.filter(req => req.status === 'Pending');
          // Convert backend requests to notification format with geocoded coordinates
          const requestNotifications = pendingRequests.map(req => ({
            id: `req-${req.id}`,
            sender: req.sellerName,
            locationName: req.address,
            lat: req.lat || 12.9716, // Use geocoded coordinates from backend
            lng: req.lng || 77.5946,
            requestId: req.id,
            phone: req.phone,
            email: req.email,
            weight: req.weight,
            type: req.type,
          }));
          // Set notifications to show pending pickup requests
          setNotifications(requestNotifications);
        }
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
      }
    };

    fetchPendingRequests();
    // Poll every 3 seconds
    const interval = setInterval(fetchPendingRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${PYTHON_BACKEND}/counts`)
        .then(res => res.json())
        .then(data => setCounts(data))
        .catch(() => console.error("Waiting for Python backend..."));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Map Click Event (adds manual points)
  function MapClickEvent() {
    useMapEvents({
      click(e) {
        setLocations(prev => [...prev, { id: `p${Date.now()}`, locationName: 'Manual Point', lat: e.latlng.lat, lng: e.latlng.lng }]);
      },
    });
    return null;
  }

  // Accept a notification -> move it to locations and update backend status
  const handleAcceptNotification = async (id) => {
    const item = notifications.find(n => n.id === id);
    if (!item) return;

    // If this is a seller request, update backend status
    if (item.requestId) {
      try {
        const response = await fetch(`http://localhost:5000/api/accept-request/${item.requestId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          console.error('Failed to update request status');
          return;
        }
        console.log('Request accepted on backend:', item.requestId);
      } catch (err) {
        console.error('Error accepting request:', err);
      }
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
    setLocations(prev => [...prev, { id: item.id, locationName: item.locationName, lat: item.lat, lng: item.lng }]);
    console.log('Accepted notification:', item);
  };

  // Helper: fetch real driving path from OSRM between consecutive points
  const fetchRoadPath = async (orderedCoords) => {
    if (!orderedCoords || orderedCoords.length < 2) {
      setRoadPath([]);
      setTotalDrivingDistance(0);
      return;
    }

    try {
      const mergedPath = [];
      let totalDist = 0;

      for (let i = 0; i < orderedCoords.length - 1; i++) {
        const a = orderedCoords[i];
        const b = orderedCoords[i + 1];
        // OSRM expects lon,lat
        const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
        console.log('OSRM request:', url);
        const res = await fetch(url);
        if (!res.ok) {
          console.error('OSRM fetch failed:', res.statusText);
          continue;
        }
        const data = await res.json();
        if (data.routes && data.routes.length > 0 && data.routes[0].geometry && data.routes[0].geometry.coordinates) {
          const coordsLonLat = data.routes[0].geometry.coordinates; // [ [lon,lat], ... ]
          // convert to lat,lng for Leaflet and append (avoid duplicate points)
          for (let j = 0; j < coordsLonLat.length; j++) {
            const [lon, lat] = coordsLonLat[j];
            const latLng = [lat, lon];
            const last = mergedPath[mergedPath.length - 1];
            if (!last || last[0] !== latLng[0] || last[1] !== latLng[1]) mergedPath.push(latLng);
          }
          totalDist += (data.routes[0].distance || 0);
        } else {
          console.warn('OSRM returned no route for segment', i, data);
        }
      }

      setRoadPath(mergedPath);
      setTotalDrivingDistance(totalDist);
      console.log('Total driving distance (m):', totalDist);
      return { mergedPath, totalDist };
    } catch (err) {
      console.error('fetchRoadPath error:', err);
    }
  };

  // OPTIMIZE: send locations to backend /optimize (backend must implement Johnson's algorithm)
  // --- NEW: ROBUST ROUTING FUNCTION ---
  const handleOptimize = async () => {
    if (locations.length < 2) {
      alert("Please select at least 2 points on the map!");
      return;
    }

    try {
      console.log("1. Sending locations to Backend...", locations);
      
      // 1. Ask Python to sort the stops (Johnson's/VRP Logic)
      // Make sure this matches your backend port (5000 or 5001)
      const response = await fetch('http://localhost:5001/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations }),
      });
      
      const data = await response.json();
      console.log("2. Backend Response:", data);

      if (data.optimized_route) {
        // 2. We have the sorted stops. Save them, then request the full road geometry from OSRM.
        const sortedLocs = data.optimized_route;
        // Save optimizer stats (distance/emissions) to both routeStats and optimizationStats
        if (data.stats) {
          setRouteStats(data.stats);
          setOptimizationStats(data.stats);
        }
        setSortedStops(sortedLocs || []);

        // Build OSRM coordinate string: "lon,lat;lon,lat;..."
        const osrmCoords = (sortedLocs || [])
          .map(loc => `${loc.lng},${loc.lat}`)
          .join(';');

        if (!osrmCoords) {
          console.error('No coordinates to route on OSRM');
          alert('No coordinates available for routing');
          return;
        }

        console.log("3. Fetching Roads from OSRM:", osrmCoords);
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson`;

        // Helper: Haversine distance (km)
        const haversineKm = (lat1, lon1, lat2, lon2) => {
          const toRad = v => v * Math.PI / 180;
          const R = 6371; // Earth radius km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        try {
          const roadResponse = await fetch(osrmUrl);
          if (!roadResponse.ok) throw new Error(`OSRM status ${roadResponse.status}`);
          const roadData = await roadResponse.json();

          if (roadData.routes && roadData.routes.length > 0 && roadData.routes[0].geometry && roadData.routes[0].geometry.coordinates) {
            // OSRM returns coords as [lon, lat]. Convert every coord to [lat, lon] for Leaflet.
            const rawCoordinates = roadData.routes[0].geometry.coordinates; // [ [lon,lat], ... ]
            const leafletCoordinates = rawCoordinates.map(coord => [coord[1], coord[0]]);

            console.log("4. Drawing Route (Leaflet lat,lng):", leafletCoordinates);
            // Update optimizedRoute with the detailed road path (lat, lng pairs)
            setOptimizedRoute(leafletCoordinates);

            // Update distance and logs if available
            const dist = roadData.routes[0].distance || 0;
            setTotalDrivingDistance(dist);
            setCalculationLogs(`Backend stops: ${sortedLocs.length}\nOSRM distance: ${dist.toFixed(0)} m`);
          } else {
            throw new Error('OSRM returned no valid route data');
          }
        } catch (err) {
          console.warn('OSRM fetch failed, falling back to straight-line path:', err);
          // Fallback: use straight-line connections between sorted stops
          const fallbackPath = (sortedLocs || []).map(s => [s.lat, s.lng]);
          setOptimizedRoute(fallbackPath);

          // Estimate distance using haversine between stops
          let estKm = 0;
          for (let i = 0; i < (sortedLocs || []).length - 1; i++) {
            const a = sortedLocs[i];
            const b = sortedLocs[i+1];
            if (a && b && a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
              estKm += haversineKm(a.lat, a.lng, b.lat, b.lng);
            }
          }
          setTotalDrivingDistance(Math.round(estKm * 1000)); // meters
          setCalculationLogs(`Backend stops: ${sortedLocs.length}\nFallback straight-line distance: ${Math.round(estKm)} km (OSRM unavailable)`);
        }
      }
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("Error: Check Console (F12) for details.");
    }
  };

  // Manual emission calculator (calls Python optimizer service /calculate-manual)
  const handleManualCalculate = async () => {
    const distance = parseFloat(manualDistance) || 0;
    const weight = parseFloat(manualWeight) || 0;
    try {
      const res = await fetch('http://localhost:5001/calculate-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distance, weight, mode: manualMode }),
      });
      if (!res.ok) throw new Error('Calculation failed');
      const d = await res.json();
      // backend now returns emission_kg, baseline_kg, savings_kg
      const emissionKg = d.emission_kg ?? d.emission ?? 0;
      const baselineKg = d.baseline_kg ?? d.baseline ?? 0;
      const savingsKg = d.savings_kg ?? Math.max(0, baselineKg - emissionKg);
      setManualResult({ emission_kg: emissionKg, baseline_kg: baselineKg, savings_kg: savingsKg });
      setManualEmission(emissionKg / 1000.0);
    } catch (err) {
      console.error('Manual calc error:', err);
      alert('Failed to calculate emissions');
    }
  };

  // Auto-calc when manual inputs change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      if ((manualDistance !== '' || manualWeight !== '') && (parseFloat(manualDistance) > 0 || parseFloat(manualWeight) > 0)) {
        handleManualCalculate();
      }
    }, 300);
    return () => clearTimeout(id);
  }, [manualDistance, manualWeight, manualMode]);

  return (
    <PageWrapper>
      <aside className="w-64 bg-slate-950 border-r border-white/5 p-6 flex flex-col z-20">
        <div className="mb-10 flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg text-black shadow-lg shadow-amber-500/20"><Truck size={20} /></div>
          <span className="font-black tracking-tighter text-xl text-white">BLUE COMPASS</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[{ id: 'camera', label: 'Live Cargo Feed', icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> }, { id: 'map', label: 'Route Map', icon: <MapIcon size={18}/> }, { id: 'fleet', label: 'Fleet Load', icon: <BarChart3 size={18}/> }].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:bg-white/5'}`}>{item.icon} {item.label}</button>
          ))}
        </nav>
        <Link to="/" className="p-4 text-slate-500 hover:text-red-400 flex items-center gap-4 border-t border-white/5 pt-6 transition-colors"><LogOut size={18} /> Logout</Link>
      </aside>

      <main className="flex-1 p-8 flex flex-col relative overflow-y-auto">
        <header className="flex justify-between items-end mb-8 relative">
          <div>
            <h2 className="text-3xl font-bold text-white">{t.asLogistics}</h2>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-medium">Real Road Routing</p>
          </div>

          <div className="flex gap-4 items-center relative">
            <button onClick={handleReset} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl border border-red-500/20 transition-all font-bold text-xs h-10">RESET</button>

            {/* Bell notifications */}
            <div className="relative">
              <button onClick={() => setShowNotifications(s => !s)} className="p-2 bg-slate-900 border border-white/5 rounded-xl hover:bg-white/2">
                <Bell className="text-slate-200" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-slate-900 border border-white/5 rounded-2xl p-4 z-50 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white">Notifications</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 text-sm">Close</button>
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-slate-500 text-sm">No pending requests</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className="flex items-start justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-white/5">
                          <div>
                            <div className="font-bold text-white">{n.sender}</div>
                            <div className="text-slate-400 text-xs">{n.locationName}</div>
                            {n.requestId && (
                              <div className="text-[10px] text-slate-500 mt-1">
                                <div>Weight: {n.weight}kg | Type: {n.type}</div>
                                <div>Phone: {n.phone}</div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <button onClick={() => handleAcceptNotification(n.id)} className="bg-emerald-500 text-black px-3 py-1 rounded-lg font-bold text-xs">Accept</button>
                            <div className="text-[10px] text-slate-500">📍 {(n.lat || 0).toFixed(4)}, {(n.lng || 0).toFixed(4)}</div>
                            {n.requestId && <div className="text-[9px] text-emerald-400">Geocoded</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Object A</span>
              <span className="text-2xl font-black text-emerald-500">{counts.a}</span>
            </div>
            <div className="bg-slate-900 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Object B</span>
              <span className="text-2xl font-black text-amber-500">{counts.b}</span>
            </div>
          </div>
        </header>

        {activeTab === 'camera' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="relative flex-1 bg-black rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
              <img src={`${ESP32_IP}?t=${Date.now()}`} alt="Cargo Feed" className="w-full h-full object-cover opacity-90" onError={(e) => { e.target.src = "https://placehold.co/640x480/020617/white?text=Camera+Offline"; }} />
              <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">LIVE VIDEO FEED</div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="flex flex-col h-full gap-4 relative">
             <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-sm text-slate-400">Click on the map to add delivery points. Accept notifications to include them.</p>
                <button 
                  onClick={handleOptimize}
                  disabled={locations.length < 2}
                  className={`px-6 py-2 rounded-xl font-bold transition-colors ${locations.length < 2 ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
                >
                  OPTIMIZE ROUTE
                </button>
             </div>
             
             <div className="flex-1 min-h-[500px] rounded-[32px] overflow-hidden border border-white/5 relative shadow-2xl">
                <MapContainer center={[12.9716, 77.5946]} zoom={7} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0','mt1','mt2','mt3']}
                    attribution='Map data © Google'
                  />
                  <MapUpdater center={locations && locations.length > 0 ? [locations[0].lat, locations[0].lng] : [12.9716, 77.5946]} />
                  
                  <MapClickEvent />

                  {/* Render markers for accepted locations */}
                  {locations.map((loc, idx) => (
                    <Marker key={loc.id || idx} position={[loc.lat, loc.lng]}>
                      <Popup>{loc.locationName || `Point ${idx + 1}`}</Popup>
                    </Marker>
                  ))}

                  {/* Sorted stops (markers returned from backend) */}
                  {sortedStops && sortedStops.map((r, i) => (r && r.lat && r.lng) ? (
                    <Marker key={`opt-${i}`} position={[r.lat, r.lng]}>
                      <Popup>{r.name || `Stop ${i + 1}`}</Popup>
                    </Marker>
                  ) : null)}

                  {/* Real road path from OSRM (Google-like blue) */}
                  {optimizedRoute && optimizedRoute.length > 1 && (
                    <Polyline positions={optimizedRoute} color="#3b82f6" weight={5} opacity={0.9} />
                  )}
                </MapContainer>

                {/* Emission Estimator (bottom-left overlay) */}
                <div className="absolute left-6 bottom-6 w-80 bg-slate-900/95 border border-white/5 rounded-2xl p-4 z-40 shadow-xl">
                  <h4 className="font-bold text-white mb-2">Emission Estimator</h4>
                  <div className="space-y-2 text-sm text-slate-300 mb-2">
                    <div className="flex gap-2">
                      <input value={manualDistance} onChange={(e) => setManualDistance(e.target.value)} placeholder="Distance (km)" className="w-1/2 bg-slate-800 p-2 rounded" />
                      <input value={manualWeight} onChange={(e) => setManualWeight(e.target.value)} placeholder="Weight (kg)" className="w-1/2 bg-slate-800 p-2 rounded" />
                    </div>
                    <div>
                      <select value={manualMode} onChange={(e) => setManualMode(e.target.value)} className="w-full bg-slate-800 p-2 rounded">
                        <option value="road">Road</option>
                        <option value="rail">Rail</option>
                        <option value="air">Air</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleManualCalculate} className="bg-emerald-500 text-black px-3 py-2 rounded font-bold">Calculate</button>
                      {manualEmission !== null && (
                        <div className="text-emerald-400 font-black text-lg">{(manualEmission/1000).toFixed(3)} tCO2e</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Route Efficiency Graph (shown when stats available) */}
                {routeStats && (
                  <div className="absolute left-6 top-24 w-64 bg-slate-900/95 border border-white/5 rounded-2xl p-4 z-40 shadow-xl">
                    <h4 className="font-bold text-white mb-3">Route Efficiency</h4>
                    <div className="flex items-end gap-4 h-36">
                      {(() => {
                        const base = routeStats.baseline ?? routeStats.baseline_emission_kg ?? 0;
                        const opt = routeStats.optimized ?? routeStats.optimized_emission_kg ?? 0;
                        const m = Math.max(base, opt, 1);
                        const baseH = Math.round((base / m) * 100);
                        const optH = Math.round((opt / m) * 100);
                        return (
                          <>
                            <div className="flex flex-col items-center">
                              <div className="bg-slate-500 w-12" style={{ height: `${baseH}%` }}></div>
                              <div className="text-xs text-slate-400 mt-2">Baseline</div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="bg-teal-400 w-12" style={{ height: `${optH}%` }}></div>
                              <div className="text-xs text-slate-400 mt-2">Optimized</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="mt-3 text-white font-bold text-lg">{Math.round(routeStats.reduction_percent ?? routeStats.reduction_percentage ?? 0)}% Reduction</div>
                  </div>
                )}

                {/* Floating right panel: Algorithm Logistics */}
                <div className="absolute right-6 top-24 w-80 max-h-[60vh] overflow-y-auto bg-slate-900/90 border border-white/5 rounded-2xl p-4 z-40 shadow-xl">
                  <h4 className="font-bold text-white mb-2">Algorithm Logistics</h4>
                  <div className="text-xs text-slate-400 mb-3 whitespace-pre-wrap">{calculationLogs || 'No calculations yet. Click "Optimize Route".'}</div>
                  <div className="text-sm text-slate-300"><strong>Total Driving Distance:</strong> {totalDrivingDistance ? `${(totalDrivingDistance / 1000).toFixed(2)} km` : '—'}</div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full text-white">
            {/* LEFT COLUMN: Manual Calculator with Graph */}
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <Leaf className="text-emerald-500" size={24} />
                <h3 className="text-xl font-bold">Emission Estimator</h3>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                {/* Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Distance (km)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualDistance}
                      onChange={e => setManualDistance(e.target.value)}
                      className="w-full bg-slate-800 p-3 rounded border border-white/5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={manualWeight}
                      onChange={e => setManualWeight(e.target.value)}
                      className="w-full bg-slate-800 p-3 rounded border border-white/5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Transport Mode</label>
                  <select
                    value={manualMode}
                    onChange={e => setManualMode(e.target.value)}
                    className="w-full bg-slate-800 p-3 rounded border border-white/5 text-white"
                  >
                    <option value="road">Road</option>
                    <option value="rail">Rail</option>
                    <option value="air">Air</option>
                  </select>
                </div>

                {/* Bar Chart */}
                <div className="flex-1 flex flex-col justify-center mt-4">
                  <div className="flex items-end gap-6 h-32">
                    {(() => {
                      const baseline = manualResult ? manualResult.baseline_kg : 1;
                      const selected = manualResult ? manualResult.emission_kg : 0.5;
                      const max = Math.max(baseline, selected, 1);
                      const baselineHeight = Math.max(12, Math.round((baseline / max) * 120));
                      const selectedHeight = Math.max(12, Math.round((selected / max) * 120));
                      return (
                        <>
                          <div className="flex-1 flex flex-col items-center justify-end">
                            <div
                              className="w-full bg-slate-500 rounded-t-lg transition-all"
                              style={{ height: `${baselineHeight}px` }}
                            ></div>
                            <div className="text-xs text-slate-400 mt-2 text-center">Air (Baseline)</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-end">
                            <div
                              className="w-full bg-blue-500 rounded-t-lg transition-all"
                              style={{ height: `${selectedHeight}px` }}
                            ></div>
                            <div className="text-xs text-slate-400 mt-2 text-center">Selected Mode</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Results */}
                {manualResult && (
                  <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
                    <div className="text-sm text-slate-400 mb-2">Saved Emissions</div>
                    <div className="text-3xl font-black text-emerald-400">
                      {(manualResult.savings_kg / 1000).toFixed(3)} tCO2e
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Route Optimization Results */}
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-blue-400" size={24} />
                <h3 className="text-xl font-bold">Route Efficiency</h3>
              </div>

              {optimizationStats ? (
                <div className="flex-1 flex flex-col justify-between">
                  {/* Bar Chart */}
                  <div className="flex items-end gap-6 h-40">
                    {(() => {
                      const baseline = optimizationStats.baseline || 1;
                      const optimized = optimizationStats.optimized || 0.5;
                      const max = Math.max(baseline, optimized, 1);
                      const baselineHeight = Math.max(12, Math.round((baseline / max) * 120));
                      const optimizedHeight = Math.max(12, Math.round((optimized / max) * 120));
                      return (
                        <>
                          <div className="flex-1 flex flex-col items-center justify-end">
                            <div
                              className="w-full bg-slate-500 rounded-t-lg transition-all"
                              style={{ height: `${baselineHeight}px` }}
                            ></div>
                            <div className="text-xs text-slate-400 mt-2 text-center">Baseline Route</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-end">
                            <div
                              className="w-full bg-emerald-500 rounded-t-lg transition-all"
                              style={{ height: `${optimizedHeight}px` }}
                            ></div>
                            <div className="text-xs text-slate-400 mt-2 text-center">Optimized Route</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Reduction Percentage */}
                  <div className="flex items-center gap-6 mt-8 bg-slate-950 p-6 rounded-lg border border-white/5">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
                      style={{
                        background: `conic-gradient(#3b82f6 ${optimizationStats.percent}%, #334155 ${optimizationStats.percent}%)`,
                      }}
                    >
                      {Math.round(optimizationStats.percent)}%
                    </div>
                    <div>
                      <div className="text-sm text-slate-400">Reduction</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        {(optimizationStats.saved / 1000).toFixed(2)} tCO2e
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-center">
                  <p>Run Route Optimization on the Map tab to view data.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </PageWrapper>
  );
};

const SellerRequestForm = () => {
  const [formData, setFormData] = React.useState({
    sellerName: '',
    phone: '',
    email: '',
    address: '',
    weight: '',
    type: 'Perishables',
    date: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);

  // Verification state
  const [verifiedLat, setVerifiedLat] = React.useState(null);
  const [verifiedLng, setVerifiedLng] = React.useState(null);
  const [isVerified, setIsVerified] = React.useState(false);
  const [verifyResults, setVerifyResults] = React.useState([]);
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Any address change resets verification
    if (name === 'address') {
      setIsVerified(false);
      setVerifiedLat(null);
      setVerifiedLng(null);
    }
  };

  const verifyLocation = async () => {
    const q = (formData.address || '').trim();
    if (!q) {
      alert('Enter an address or pincode to verify');
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const items = await res.json();

      if (!items || items.length === 0) {
        alert('Location not found. Please check the Pincode.');
        return;
      }

      if (items.length === 1) {
        const it = items[0];
        setVerifiedLat(parseFloat(it.lat));
        setVerifiedLng(parseFloat(it.lon));
        setIsVerified(true);
        setVerifyResults([]);
        setShowVerifyModal(false);
        alert('✅ Location verified');
        return;
      }

      // Multiple results: show modal for selection
      setVerifyResults(items.map(i => ({ display_name: i.display_name, lat: i.lat, lon: i.lon })));
      setShowVerifyModal(true);
    } catch (err) {
      console.error('Verify error:', err);
      alert('Failed to verify location. See console.');
    }
  };

  const pickVerifyResult = (item) => {
    setVerifiedLat(parseFloat(item.lat));
    setVerifiedLng(parseFloat(item.lon));
    setIsVerified(true);
    setShowVerifyModal(false);
    setVerifyResults([]);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.sellerName || !formData.phone || !formData.email || !formData.address || !formData.weight) {
      alert('Please fill in all fields');
      return;
    }

    if (!isVerified || verifiedLat == null || verifiedLng == null) {
      alert('Please verify your pickup location before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { ...formData, lat: verifiedLat, lng: verifiedLng };
      const response = await fetch('http://localhost:5000/api/request-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const data = await response.json();
      const coordsText = (data.lat && data.lng)
        ? `Coordinates: ${parseFloat(data.lat).toFixed(4)}, ${parseFloat(data.lng).toFixed(4)}`
        : 'Coordinates: Not provided';
      alert(`✓ Pickup request submitted successfully! (ID: ${data.id})\nLocation: ${data.address}\n${coordsText}`);
      setFormData({ sellerName: '', phone: '', email: '', address: '', weight: '', type: 'Perishables', date: '' });
      setIsVerified(false);
      setVerifiedLat(null);
      setVerifiedLng(null);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting request. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

    // preview center for small map (SellerRequestForm)
    const previewCenter = isVerified && verifiedLat != null && verifiedLng != null
      ? [verifiedLat, verifiedLng]
      : [12.9716, 77.5946];

    return (
    <div className="max-w-3xl bg-slate-900/50 p-10 rounded-[40px] border border-white/5 mx-auto w-full">
      <h3 className="text-2xl font-bold mb-8 text-white">Request Pickup Service</h3>
      <form onSubmit={handleSubmitRequest} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name *</label>
            <input
              type="text"
              name="sellerName"
              value={formData.sellerName}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-emerald-500"
              placeholder="Your Full Name"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-emerald-500"
              placeholder="+91 98765 43210"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-emerald-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pickup Address or Pincode *</label>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="flex-1 bg-slate-950 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-emerald-500"
                placeholder="Street, City, State or Pincode"
                required
              />
              <button type="button" onClick={verifyLocation} className="bg-blue-600 px-4 rounded-lg text-white font-bold">Verify</button>
            </div>
            <div className="mt-2">
              {isVerified ? (
                <span className="text-emerald-400 font-bold">✅ Verified ({verifiedLat?.toFixed(4)}, {verifiedLng?.toFixed(4)})</span>
              ) : (
                <span className="text-slate-400 text-sm">Not verified</span>
              )}
            </div>
            {/* Small map preview that moves to verified location */}
            <div className="mt-4 h-60 rounded-xl overflow-hidden border border-white/5">
              <MapContainer center={previewCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© OpenStreetMap contributors'
                />
                <MapUpdater center={previewCenter} />
                <Marker position={previewCenter} draggable={false}>
                  <Popup>{isVerified ? 'Verified Location' : 'Preview Location'}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weight (kg) *</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-emerald-500"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goods Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl mt-2 text-white outline-none focus:border-emerald-500"
            >
              <option>Perishables</option>
              <option>Textiles</option>
              <option>Hardware</option>
              <option>Electronics</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !isVerified}
          className={`w-full font-black py-5 rounded-2xl shadow-xl transition-transform active:scale-95 ${
            isLoading || !isVerified
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400'
          }`}
        >
          {isLoading ? 'SUBMITTING...' : !isVerified ? 'VERIFY LOCATION FIRST' : 'SUBMIT PICKUP REQUEST'}
        </button>
      </form>
      {/* Verification modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowVerifyModal(false)} />
          <div className="relative bg-slate-800 w-full max-w-2xl rounded-2xl p-6 z-60 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Select Exact Location</h4>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400">Close</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {verifyResults.map((r, i) => (
                <button key={i} onClick={() => pickVerifyResult(r)} className="w-full text-left p-3 bg-slate-900/60 hover:bg-slate-900 rounded-lg border border-white/5">
                  <div className="text-sm text-white">{r.display_name}</div>
                  <div className="text-xs text-slate-400 mt-1">{parseFloat(r.lat).toFixed(5)}, {parseFloat(r.lon).toFixed(5)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SellerDashboard = ({ lang }) => {
  const [activeTab, setActiveTab] = useState('cal');
  const t = translations[lang];
  return (
    <PageWrapper>
      <aside className="w-64 bg-slate-950 border-r border-white/5 p-6 flex flex-col z-20">
        <div className="mb-10 flex items-center gap-3"><div className="p-2 bg-emerald-500 rounded-lg text-black shadow-lg shadow-emerald-500/20"><Package size={20} /></div><span className="font-black tracking-tighter text-xl text-white">BLUE COMPASS</span></div>
        <nav className="flex-1 space-y-2">
          {[{ id: 'cal', label: 'Truck Schedule', icon: <Calendar size={18}/> }, { id: 'req', label: 'Request Pickup', icon: <Truck size={18}/> }].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:bg-white/5'}`}>{item.icon} {item.label}</button>
          ))}
        </nav>
        <Link to="/" className="p-4 text-slate-500 hover:text-red-400 flex items-center gap-4 border-t border-white/5 pt-6 transition-colors"><LogOut size={18} /> Logout</Link>
      </aside>
      <main className="flex-1 p-8 flex flex-col overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div><h2 className="text-3xl font-bold text-white italic">Welcome to Blue Compass</h2><p className="text-slate-500 text-sm mt-1 uppercase tracking-[0.2em] font-bold">Your cargo, our expertise</p></div>
          <div className="flex gap-4"><div className="bg-slate-900 border border-white/5 px-6 py-3 rounded-2xl text-center"><p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Sustainability Rank</p><p className="text-emerald-500 font-bold">#14 in Salem</p></div></div>
        </header>
        {activeTab === 'cal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 p-8 rounded-[32px] border border-white/5"><h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Calendar className="text-emerald-500"/> Upcoming Trucks</h3><div className="space-y-4">
                {[{ day: 'Wednesday', time: '16:00', driver: 'Rajesh K.', space: '400kg' }, { day: 'Friday', time: '11:30', driver: 'Suresh M.', space: '1.2 Tons' },{ day: 'Saturday', time: '10:25', driver: 'Ramesh M', space: '1.2 Tons' },{ day: 'Sataurday', time: '9:45', driver: 'Leo Das', space: '10 Tons' }].map((ship, i) => (
                  <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex justify-between items-center hover:border-emerald-500/30 transition-colors">
                    <div><p className="font-bold text-white">{ship.day} • {ship.time}</p><p className="text-xs text-slate-500 mt-1">Driver: {ship.driver} | Avail. Space: {ship.space}</p></div>
                    <button className="bg-emerald-500/10 text-emerald-500 text-xs font-black px-4 py-2 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all">JOIN TRIP</button>
                  </div>
                ))}
            </div></div>
            <div className="bg-slate-900/50 p-8 rounded-[32px] border border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Calendar className="text-emerald-500" /> Truck Availability Calendar
              </h3>
              
              {(() => {
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                
                // Render a single month calendar
                const renderMonth = (monthOffset) => {
                  const renderYear = currentYear + Math.floor((currentMonth + monthOffset) / 12);
                  const renderMonthIdx = (currentMonth + monthOffset) % 12;
                  const firstDay = new Date(renderYear, renderMonthIdx, 1).getDay();
                  const daysInMonth = new Date(renderYear, renderMonthIdx + 1, 0).getDate();
                  
                  const monthName = new Date(renderYear, renderMonthIdx, 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  });
                  
                  const days = [];
                  
                  // Empty cells for days before the month starts
                  for (let i = 0; i < firstDay; i++) {
                    days.push(null);
                  }
                  
                  // Days of the month
                  for (let d = 1; d <= daysInMonth; d++) {
                    days.push({
                      day: d,
                      date: new Date(renderYear, renderMonthIdx, d),
                      year: renderYear,
                      month: renderMonthIdx,
                    });
                  }
                  
                  return { monthName, days };
                };

                const months = [renderMonth(0), renderMonth(1), renderMonth(2)];
                const weekDays = ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

                return (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {months.map((month, monthIdx) => (
                      <div key={monthIdx} className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                        {/* Month Header */}
                        <h4 className="text-emerald-400 font-bold text-sm mb-4 text-center">
                          {month.monthName}
                        </h4>

                        {/* Weekday Header Row */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map(day => (
                            <div
                              key={day}
                              className="text-center text-xs font-bold text-slate-400 py-1"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {month.days.map((dayObj, idx) => {
                            if (!dayObj) {
                              return <div key={`empty-${idx}`} className="aspect-square"></div>;
                            }

                            const isToday =
                              dayObj.date.toDateString() === today.toDateString();
                            
                            // Random availability logic: every 3rd day + every 5th day
                            const isAvailable =
                              (dayObj.day + monthIdx) % 6 === 0 || dayObj.day % 9 === 0;

                            return (
                              <div
                                key={`day-${monthIdx}-${dayObj.day}`}
                                className={`
                                  aspect-square flex items-center justify-center text-xs font-bold
                                  rounded-lg transition-all cursor-pointer
                                  ${
                                    isAvailable
                                      ? 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.6)] hover:scale-105'
                                      : isToday
                                      ? 'border border-white text-white hover:bg-white/10'
                                      : 'text-slate-500 hover:bg-white/5'
                                  }
                                `}
                              >
                                {dayObj.day}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-6 justify-center flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                  <span className="text-xs text-slate-400">Truck Available</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'req' && (
          <SellerRequestForm />
        )}
      </main>
    </PageWrapper>
  );
};

// --- CORE APP ENGINE ---
export default function App() {
  const [lang, setLang] = useState('en');
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing lang={lang} setLang={setLang} />} />
        <Route path="/login" element={<Login lang={lang} />} />
        <Route path="/logistics" element={<LogisticsDashboard lang={lang} />} />
        <Route path="/seller" element={<SellerDashboard lang={lang} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

// --- MAIN WRAPPER FOR INDEX.JS ---
export function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}