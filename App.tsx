
import React, { useState, useEffect, useContext, createContext, useCallback, ReactNode, FC, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import ThreeJSBackground from './components/ThreeJSBackground';

// TYPES =======================================================================
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

interface Place {
  id: number;
  name: string;
  category: 'FOOD' | 'ESSENTIALS' | 'ENTERTAINMENT';
  rating: number;
  image: string;
  notes: string;
}

interface Building {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

interface AcademicRecord {
  courseCode: string;
  attendancePercent: number;
  internalMarks: number;
}

// MOCK DATA ===================================================================
const mockPlaces: Place[] = [
  { id: 1, name: "Central Cafe", category: 'FOOD', rating: 4, image: 'https://picsum.photos/400/300?random=1', notes: 'Great coffee and sandwiches.' },
  { id: 2, name: "University Bookstore", category: 'ESSENTIALS', rating: 5, image: 'https://picsum.photos/400/300?random=2', notes: 'All your textbook needs.' },
  { id: 3, name: "Student Rec Center", category: 'ENTERTAINMENT', rating: 5, image: 'https://picsum.photos/400/300?random=3', notes: 'Gym, pool, and climbing wall.' },
  { id: 4, name: "Pizza Palace", category: 'FOOD', rating: 3, image: 'https://picsum.photos/400/300?random=4', notes: 'Decent pizza by the slice.' },
  { id: 5, name: "Tech Hub", category: 'ESSENTIALS', rating: 4, image: 'https://picsum.photos/400/300?random=5', notes: 'Computer repairs and accessories.' },
  { id: 6, name: "Campus Cinema", category: 'ENTERTAINMENT', rating: 4, image: 'https://picsum.photos/400/300?random=6', notes: 'Shows indie films and blockbusters.' },
];

const srmBuildings: Building[] = [
    { id: 1, name: "Tech Park", description: "The hub for all computer science and engineering departments.", lat: 12.8239, lng: 80.0452 },
    { id: 2, name: "University Building (UB)", description: "Main building with administrative offices and lecture halls.", lat: 12.8235, lng: 80.0427 },
    { id: 3, name: "Admin Block", description: "Central administration and university leadership offices.", lat: 12.8245, lng: 80.0435 },
    { id: 4, name: "CRC (Placement Cell)", description: "Career Resource Centre, handling all placements.", lat: 12.8220, lng: 80.0465 },
    { id: 5, name: "SRM Hospital", description: "SRM Medical College Hospital and Research Centre.", lat: 12.8267, lng: 80.0415 },
    { id: 6, name: "Potheri Railway Station", description: "Convenient railway access for students and faculty.", lat: 12.8209, lng: 80.0416 },
];

const mockAcademicData: AcademicRecord[] = [
  { courseCode: 'CS101', attendancePercent: 85, internalMarks: 92 },
  { courseCode: 'MA203', attendancePercent: 95, internalMarks: 88 },
  { courseCode: 'PH110', attendancePercent: 74, internalMarks: 78 },
  { courseCode: 'HU201', attendancePercent: 90, internalMarks: 95 },
  { courseCode: 'EE150', attendancePercent: 82, internalMarks: 85 },
];

// ICONS =======================================================================
const MenuIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
);
const XIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);
const SunIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m4.93 19.07 1.41-1.41" /><path d="m17.66 6.34 1.41-1.41" /></svg>
);
const MoonIcon: FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);
const StarIcon: FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
const MyLocationIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </svg>
);

// CONTEXT & PROVIDERS =========================================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('dark');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
                {children}
            </AuthContext.Provider>
        </ThemeContext.Provider>
    );
};


// UI COMPONENTS =============================================================
const AnimatedPage: FC<{ children: ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
    className="min-h-screen px-4 pt-24 pb-12 md:px-8"
  >
    {children}
  </motion.div>
);

const NeonButton: FC<{ children: ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className = '' }) => (
  <motion.button
    whileHover={{ scale: 1.05, boxShadow: '0 0 25px hsl(180, 100%, 50%), 0 0 50px hsl(180, 100%, 50%)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-6 py-2 border-2 border-neon-cyan text-neon-cyan font-bold rounded-full transition-all duration-300 backdrop-blur-sm bg-black/20 hover:bg-neon-cyan/20 ${className}`}
  >
    {children}
  </motion.button>
);

const GlassmorphicCard: FC<{ children: ReactNode; className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={onClick}
        className={`bg-white/10 dark:bg-black/10 backdrop-blur-lg rounded-2xl border border-black/10 dark:border-white/20 shadow-lg overflow-hidden ${className}`}
    >
        {children}
    </motion.div>
);

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
            {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </button>
    );
};

// LAYOUT COMPONENTS ==========================================================
const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/map', label: 'Map' },
        { path: '/academic', label: 'Academic Status' },
        { path: '/guide', label: 'Campus Guide' },
    ];

    const closeMenu = useCallback(() => setIsOpen(false), []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 text-gray-800 dark:text-white bg-white/30 dark:bg-black/30 backdrop-blur-md border-b border-black/10 dark:border-white/10">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-2xl font-bold tracking-wider text-neon-cyan" onClick={closeMenu}>CampusMate</Link>
                    <div className="hidden md:flex items-center space-x-4">
                        {navLinks.map(link => (
                            <Link key={link.path} to={link.path} className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === link.path ? 'text-cyan-600 dark:text-neon-cyan' : 'text-gray-600 dark:text-gray-300'} hover:text-black dark:hover:text-white transition-colors`}>
                                {link.label}
                            </Link>
                        ))}
                         {isAuthenticated && <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Logout</button>}
                        <ThemeToggle />
                    </div>
                    <div className="md:hidden flex items-center">
                        <ThemeToggle />
                        <button onClick={() => setIsOpen(!isOpen)} className="ml-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none">
                            {isOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </nav>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/80 dark:bg-black/80"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map(link => (
                                <Link key={link.path} to={link.path} onClick={closeMenu} className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === link.path ? 'text-cyan-600 dark:text-neon-cyan' : 'text-gray-600 dark:text-gray-300'} hover:text-black dark:hover:text-white`}>
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated && <button onClick={()=>{logout(); closeMenu();}} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Logout</button>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

const Footer = () => (
    <footer className="relative z-10 py-4 text-center text-gray-500 dark:text-gray-400 text-sm bg-white/30 dark:bg-black/30 backdrop-blur-md border-t border-black/10 dark:border-white/10">
        <p>&copy; {new Date().getFullYear()} CampusMate. All rights reserved.</p>
    </footer>
);

// PAGE COMPONENTS ===========================================================
const HomePage = () => (
    <AnimatedPage>
        <div className="container mx-auto flex flex-col items-center justify-center text-center h-[calc(100vh-8rem)] text-gray-800 dark:text-white">
            <motion.h1 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="text-5xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500 dark:text-white"
              style={{ textShadow: '0 0 15px hsl(180, 100%, 50%), 0 0 25px hsl(180, 100%, 50%)' }}>
              CampusMate
            </motion.h1>
            <motion.p 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring' }}
              className="text-xl md:text-2xl mb-8 text-gray-600 dark:text-gray-300 max-w-2xl">
              Your All-in-One Campus Companion. Find buildings, track your grades, and discover the best spots around.
            </motion.p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/map"><NeonButton>Go to Map</NeonButton></Link>
                <Link to="/academic"><NeonButton>Academic Status</NeonButton></Link>
                <Link to="/guide"><NeonButton>Campus Guide</NeonButton></Link>
            </div>
        </div>
    </AnimatedPage>
);

const MapPage = () => {
    const googleMapsApiKey = 'AIzaSyDHCeWZhrjV7kvgIFYOzZ_LPa0-t73TDSc';
    const libraries: ("places")[] = ['places'];

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey,
        libraries,
    });
    
    const { theme } = useTheme();
    const [map, setMap] = useState<any | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [directionsResponse, setDirectionsResponse] = useState<any | null>(null);
    const [distance, setDistance] = useState<string | null>(null);
    const [duration, setDuration] = useState<string | null>(null);
    const [activeBuilding, setActiveBuilding] = useState<Building | null>(null);
    const autocompleteRef = useRef<any>(null);
    
    const center = { lat: 12.8230, lng: 80.0456 }; // SRM KTR Campus Center
    const mapContainerStyle = { width: '100%', height: '100%' };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    setUserLocation(center); 
                    alert("Could not get your location. Showing directions from the campus center.");
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            setUserLocation(center);
            alert("Geolocation is not supported. Showing directions from the campus center.");
        }
    }, []);
    
    const lightModeStyles: any = [];
    const darkModeStyles: any = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }, { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }], }, { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }], }, { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }], }, { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }], }, { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }], }, { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }], }, { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }], }, { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }], }, { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }], }, { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }], }, { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }], }, { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }], }, { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }], },
    ];

    const mapOptions: any = {
        styles: theme === 'dark' ? darkModeStyles : lightModeStyles,
        disableDefaultUI: true,
        zoomControl: true,
    };

    const clearDirections = () => {
        setDirectionsResponse(null);
        setDistance(null);
        setDuration(null);
    };

    const handleBuildingSelect = useCallback((building: Building) => {
        setActiveBuilding(building);
        map?.panTo({ lat: building.lat, lng: building.lng });
        map?.setZoom(17);
        clearDirections();
    }, [map]);

    async function getDirections(building: Building) {
        if (!userLocation) {
            alert("Please enable location services to get directions.");
            return;
        }
        if (!(window as any).google || !(window as any).google.maps) return;
        
        setActiveBuilding(building);
        const directionsService = new (window as any).google.maps.DirectionsService();

        const results = await directionsService.route({
            origin: userLocation,
            destination: { lat: building.lat, lng: building.lng },
            travelMode: (window as any).google.maps.TravelMode.WALKING
        });
        
        setDirectionsResponse(results);
        if (results.routes && results.routes.length > 0) {
            const route = results.routes[0];
            if (route.legs && route.legs.length > 0) {
                const leg = route.legs[0];
                setDistance(leg.distance.text);
                setDuration(leg.duration.text);
            }
        }
    }

    const handlePlaceSelect = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                map.panTo(place.geometry.location);
                map.setZoom(17);
            }
        }
    };
    
    const goToUserLocation = () => {
        if (userLocation && map) {
            map.panTo(userLocation);
            map.setZoom(17);
        }
    }

    if (loadError) return <div className="flex items-center justify-center h-screen text-red-500">Error loading map: {loadError.message}</div>;
    if (!isLoaded) return <div className="flex items-center justify-center h-screen text-gray-800 dark:text-white">Loading Map...</div>;
    
    return (
        <AnimatedPage>
            <div className="container mx-auto text-gray-800 dark:text-white">
                <h1 className="text-4xl font-bold mb-6 text-center text-neon-cyan">Building Finder</h1>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 h-96 lg:h-[600px] relative">
                       <GlassmorphicCard className="absolute top-4 left-4 right-4 z-10 p-2">
                            <Autocomplete
                                onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                                onPlaceChanged={handlePlaceSelect}
                            >
                                <input
                                    type="text"
                                    placeholder="Search for a location..."
                                    className="w-full bg-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none px-2 py-1"
                                />
                            </Autocomplete>
                        </GlassmorphicCard>
                       <div className="w-full h-full rounded-2xl bg-gray-200 dark:bg-black/50 border border-neon-cyan/50 overflow-hidden">
                           <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={center}
                              zoom={16}
                              options={mapOptions}
                              onLoad={map => setMap(map)}
                           >
                                {userLocation && (
                                    <MarkerF
                                        position={userLocation}
                                        title={"Your Location"}
                                        icon={{
                                            path: (window as any).google.maps.SymbolPath.CIRCLE,
                                            scale: 8,
                                            fillColor: "#4285F4", // Google Blue
                                            fillOpacity: 1,
                                            strokeColor: "white",
                                            strokeWeight: 2,
                                        }}
                                    />
                                )}
                                {srmBuildings.map(building => (
                                    <MarkerF 
                                        key={building.id}
                                        position={{ lat: building.lat, lng: building.lng }}
                                        onClick={() => handleBuildingSelect(building)}
                                        icon={{
                                            path: (window as any).google.maps.SymbolPath.CIRCLE,
                                            scale: activeBuilding?.id === building.id ? 10 : 7,
                                            fillColor: activeBuilding?.id === building.id ? "#00ffff" : "#ff00ff",
                                            fillOpacity: 1,
                                            strokeWeight: 0
                                        }}
                                    />
                                ))}
                                {directionsResponse && <DirectionsRenderer directions={directionsResponse} options={{ polylineOptions: { strokeColor: "#00ffff", strokeWeight: 5 } }} />}
                           </GoogleMap>
                       </div>
                        <button onClick={goToUserLocation} className="absolute bottom-4 right-4 z-10 p-3 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full text-neon-cyan hover:bg-neon-cyan/20 transition-all">
                            <MyLocationIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="lg:w-1/3">
                        <h2 className="text-2xl font-semibold mb-4">Campus Buildings</h2>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {srmBuildings.map(building => (
                                <GlassmorphicCard key={building.id} className={`p-4 hover:border-neon-cyan/80 transition-all duration-300 cursor-pointer ${activeBuilding?.id === building.id && !directionsResponse ? '!border-neon-cyan' : ''}`} onClick={() => handleBuildingSelect(building)}>
                                    <h3 className="text-xl font-bold text-cyan-600 dark:text-neon-cyan">{building.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{building.description}</p>
                                    <button onClick={(e) => { e.stopPropagation(); getDirections(building); }} className="mt-3 text-sm text-cyan-700/80 dark:text-neon-cyan/80 hover:text-cyan-700 dark:hover:text-neon-cyan">Get Directions &rarr;</button>
                                </GlassmorphicCard>
                            ))}
                        </div>
                        <AnimatePresence>
                        {directionsResponse && activeBuilding && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <GlassmorphicCard className="mt-6 p-4 border-neon-cyan">
                                    <h3 className="text-lg font-bold text-cyan-600 dark:text-neon-cyan">Directions to {activeBuilding.name}</h3>
                                    <div className="mt-2 text-gray-700 dark:text-gray-300">
                                        <p><strong>Distance:</strong> {distance}</p>
                                        <p><strong>Time (Walking):</strong> {duration}</p>
                                    </div>
                                    <button onClick={clearDirections} className="mt-4 text-sm font-semibold text-red-500 hover:text-red-400">
                                        Clear Directions
                                    </button>
                                </GlassmorphicCard>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

const AcademicPage = () => {
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const lowAttendanceCourses = mockAcademicData.filter(d => d.attendancePercent < 75);

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    const tooltipStyle = {
        backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        border: '1px solid #0ff',
        color: theme === 'dark' ? '#fff' : '#000',
    };

    return (
        <AnimatedPage>
            <div className="container mx-auto text-gray-800 dark:text-white">
                <h1 className="text-4xl font-bold mb-8 text-center text-neon-cyan">Academic Status</h1>

                {lowAttendanceCourses.length > 0 && (
                    <GlassmorphicCard className="mb-8 p-4 border-red-500/50">
                        <h2 className="text-xl font-bold text-red-500 dark:text-red-400">Attendance Alert!</h2>
                        <p className="text-red-600 dark:text-red-300 mt-1">
                            Your attendance is below 75% in the following courses: {lowAttendanceCourses.map(c => c.courseCode).join(', ')}.
                        </p>
                    </GlassmorphicCard>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GlassmorphicCard className="p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Attendance Overview</h2>
                        <div className="w-full h-80">
                           <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mockAcademicData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"} />
                                    <XAxis dataKey="courseCode" stroke={theme === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
                                    <YAxis stroke={theme === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"} />
                                    <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(0, 255, 255, 0.1)'}} />
                                    <Legend wrapperStyle={{ color: theme === 'dark' ? 'white' : 'black' }} />
                                    <Bar dataKey="attendancePercent" name="Attendance (%)" fill="url(#colorUv)" />
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00ffff" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#ff00ff" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassmorphicCard>

                    <GlassmorphicCard className="p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Internal Marks</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-black/20 dark:border-white/20">
                                        <th className="p-2">Course Code</th>
                                        <th className="p-2">Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockAcademicData.map(record => (
                                        <tr key={record.courseCode} className="border-b border-black/10 dark:border-white/10">
                                            <td className="p-2">{record.courseCode}</td>
                                            <td className="p-2">{record.internalMarks} / 100</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassmorphicCard>
                </div>
            </div>
        </AnimatedPage>
    );
};

const GuidePage = () => {
    const [filter, setFilter] = useState<'ALL' | Place['category']>('ALL');
    const filteredPlaces = filter === 'ALL' ? mockPlaces : mockPlaces.filter(p => p.category === filter);

    return (
        <AnimatedPage>
            <div className="container mx-auto text-gray-800 dark:text-white">
                <h1 className="text-4xl font-bold mb-4 text-center text-neon-cyan">Campus Guide</h1>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">Discover the best places on and around campus, recommended by students for students.</p>

                <div className="flex justify-center space-x-2 sm:space-x-4 mb-8">
                    {(['ALL', 'FOOD', 'ESSENTIALS', 'ENTERTAINMENT'] as const).map(category => (
                         <button key={category} onClick={() => setFilter(category)} className={`px-4 py-1.5 text-sm rounded-full border-2 transition-all ${filter === category ? 'bg-neon-cyan text-black border-neon-cyan' : 'border-neon-cyan/50 text-cyan-600 dark:text-neon-cyan/80 hover:bg-neon-cyan/20'}`}>
                           {category.charAt(0) + category.slice(1).toLowerCase()}
                         </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlaces.map(place => (
                        <GlassmorphicCard key={place.id} className="group">
                             <img src={place.image} alt={place.name} className="w-full h-48 object-cover"/>
                             <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-cyan-600 dark:group-hover:text-neon-cyan transition-colors">{place.name}</h3>
                                        <span className="text-xs font-semibold uppercase tracking-wider bg-neon-magenta/80 dark:bg-neon-magenta/50 text-white px-2 py-0.5 rounded-full">{place.category}</span>
                                    </div>
                                    <div className="flex items-center text-yellow-400">
                                        {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < place.rating} className="w-5 h-5"/>)}
                                    </div>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{place.notes}</p>
                                <button className="mt-4 text-sm text-cyan-700/80 dark:text-neon-cyan/80 hover:text-cyan-700 dark:hover:text-neon-cyan font-semibold">
                                  Open in Maps &rarr;
                                </button>
                             </div>
                        </GlassmorphicCard>
                    ))}
                </div>
            </div>
        </AnimatedPage>
    );
};

const LoginPage = () => {
    const { login } = useAuth();
    return (
        <AnimatedPage>
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <GlassmorphicCard className="p-8 w-full max-w-md text-gray-800 dark:text-white">
                    <h1 className="text-3xl font-bold mb-6 text-center text-neon-cyan">Login</h1>
                    <p className="text-center mb-6 text-gray-600 dark:text-gray-300">Access your academic records. (This is a demo, click Login to proceed).</p>
                    <form onSubmit={(e) => { e.preventDefault(); login(); }}>
                        <div className="mb-4">
                            <label className="block mb-2">NetID / Email</label>
                            <input type="email" placeholder="student@university.edu" className="w-full px-4 py-2 bg-black/10 dark:bg-black/30 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:border-neon-cyan" />
                        </div>
                        <div className="mb-6">
                            <label className="block mb-2">Password</label>
                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-black/10 dark:bg-black/30 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:border-neon-cyan" />
                        </div>
                        <NeonButton className="w-full" onClick={login}>Login</NeonButton>
                    </form>
                </GlassmorphicCard>
            </div>
        </AnimatedPage>
    );
};


// MAIN APP COMPONENT ==========================================================
const App = () => {
    const location = useLocation();
    const { theme } = useTheme();
    
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans transition-colors duration-500">
        {theme === 'dark' && <ThreeJSBackground />}
        <div className="relative z-10">
          <Header />
          <main>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/academic" element={<AcademicPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </div>
    );
};

const Root = () => {
    return (
        <AppContextProvider>
            <HashRouter>
                <App />
            </HashRouter>
        </AppContextProvider>
    );
};

export default Root;
