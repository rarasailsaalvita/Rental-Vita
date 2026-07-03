import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car as CarIcon, 
  Search, 
  User as UserIcon, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  ShieldCheck,
  Star,
  ChevronRight,
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Plus,
  MapPin,
  Trash2,
  Lock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useParams } from 'react-router-dom';
import { cn } from './lib/utils';
import { DB } from './db';
import { Car, User, Booking, Ticket, Review } from './types';
import { SignUpPage } from './components/SignUp';
import { LoginPage } from './components/Login';
import { EmailVerificationPage } from './components/EmailVerification';

// --- INITIALIZE DEMO USERS ---
const initializeDemoUsers = () => {
  const users = JSON.parse(localStorage.getItem('vita_users') || '[]');
  
  // Add demo customer if doesn't exist
  const demoCustomerExists = users.some((u: User) => u.email === 'demo@gmail.com');
  if (!demoCustomerExists) {
    const demoCustomer: User = {
      id: 'demo-customer-001',
      email: 'demo@gmail.com',
      name: 'Demo Customer',
      password: btoa('demo123'),
      role: 'customer',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    users.push(demoCustomer);
  }

  // Add demo admin if doesn't exist
  const demoAdminExists = users.some((u: User) => u.email === 'admin@gmail.com');
  if (!demoAdminExists) {
    const demoAdmin: User = {
      id: 'demo-admin-001',
      email: 'admin@gmail.com',
      name: 'Admin Vita',
      password: btoa('admin123'),
      role: 'admin',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    users.push(demoAdmin);
  }

  localStorage.setItem('vita_users', JSON.stringify(users));
};

// --- REAL AUTH HOOK ---
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    initializeDemoUsers();
    const saved = localStorage.getItem('vita_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vita_user');
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  return { user, logout, handleLoginSuccess, isAdmin: user?.role === 'admin' };
};

// --- COMPONENTS ---

const Navbar = ({ user, logout }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/5 px-10 py-6 flex items-center justify-between bg-slate-950/80">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-brand-400 rounded-lg flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-105 transition-transform">
          <span className="font-black text-xl italic leading-none">V</span>
        </div>
        <span className="text-2xl font-bold tracking-tight uppercase text-white">Vita<span className="font-light text-slate-400">Rent</span></span>
      </Link>

      <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest text-slate-400">
        {user?.role !== 'admin' && (
          <>
            <Link to="/" className={cn("hover:text-white transition-colors pb-1", location.pathname === '/' && "text-white border-b border-brand-400")}>Fleet</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
          </>
        )}
        {user && (
          <Link to="/profile" className={cn("hover:text-white transition-colors pb-1", location.pathname === '/profile' && "text-white border-b border-brand-400")}>Profile</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin" className={cn("hover:text-white transition-colors pb-1", location.pathname === '/admin' && "text-white border-b border-brand-400")}>Management</Link>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right mr-4 hidden sm:block">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest">Support Line</p>
           <p className="text-sm font-semibold text-brand-400 font-mono tracking-tighter">+1 (800) VITA-CAR</p>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden lg:block">{user.name}</span>
            <button onClick={logout} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute top-12 right-0 hidden group-hover:block glass-panel px-4 py-2 rounded-xl text-[8px] whitespace-nowrap">SIGN OUT</div>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="px-6 py-3 border border-white/10 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Lock size={12} />
              Sign In
            </Link>
            <Link 
              to="/signup"
              className="px-8 py-3 bg-brand-400 text-slate-950 rounded-full font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="h-20 border-t border-white/5 px-10 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest bg-slate-950 mt-20">
    <div className="mb-4 md:mb-0">
      &copy; 2026 Vita Rent Professional Mobility Solutions
    </div>
    <div className="flex gap-6">
      <span>GDPR Compliant</span>
      <span>SSL Secured</span>
    </div>
  </footer>
);

// --- PAGES ---

const HomePage = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    Promise.all([DB.getCars(), DB.getReviews()]).then(([c, r]) => {
        setCars(c);
        setReviews(r);
    });
  }, []);

  const filteredCars = filter === 'All' ? cars : cars.filter(c => c.category === filter);

  const getCarRating = (carId: string) => {
    const carReviews = reviews.filter(r => r.carId === carId);
    if (carReviews.length === 0) return '0.0';
    return (carReviews.reduce((acc, r) => acc + r.rating, 0) / carReviews.length).toFixed(1);
  };

  return (
    <div className="pt-32 pb-12 px-10 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="grid grid-cols-12 gap-6 mb-20">
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-[2rem] p-12 relative overflow-hidden h-[420px] shadow-2xl">
          <div className="relative z-10 h-full flex flex-col justify-center">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="serif text-7xl italic mb-6 leading-tight text-white"
            >
              Elegance in <br/>Every <span className="accent-text italic font-normal">Journey.</span>
            </motion.h1>
            <p className="text-slate-400 max-w-md text-sm mb-10 leading-relaxed">
              Experience premium mobility with Vita Rent. Our curated fleet of high-performance vehicles and seamless digital payment integration redefines car rental.
            </p>
            <div className="flex gap-4">
              <button className="bg-brand-400 text-slate-950 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all">Check Availability</button>
              <button className="border border-white/20 px-10 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white/5 transition-all">View Fleet</button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-10 w-[600px] opacity-30 select-none pointer-events-none grayscale contrast-125">
            <img src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800" alt="Hero Car" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 glass-panel rounded-[2rem] p-10 flex flex-col justify-between shadow-2xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Real-Time Availability</h2>
          <div className="space-y-6 my-8">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Executive Sedans</span>
              <span className="text-xs font-mono bg-green-500/10 text-green-400 px-3 py-1 rounded-full uppercase tracking-widest">12 Available</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Sport Performance</span>
              <span className="text-xs font-mono bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full uppercase tracking-widest">4 Reserved</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Luxury SUVs</span>
              <span className="text-xs font-mono bg-brand-400/10 text-brand-400 px-3 py-1 rounded-full uppercase tracking-widest">8 Available</span>
            </div>
          </div>
          <div className="h-px bg-white/5 w-full"></div>
          <div className="pt-6">
            <p className="text-[10px] uppercase text-slate-500 mb-2 tracking-widest">Current Rate Index</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-light text-white">$89</span>
              <span className="text-slate-500 text-xs mb-1 uppercase font-semibold">/ Avg Daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Recommendation */}
      <section className="mb-20">
         <div className="premium-gradient rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-12 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex-1 z-10">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  <Star size={14} />
                  AI Powered Search
               </div>
               <h2 className="text-4xl font-display font-bold mb-4 leading-tight">Find Your Perfect Match <br/> with AI Concierge</h2>
               <p className="text-brand-100 opacity-80 mb-8 max-w-lg">Tell us about your trip and our AI will suggest the best vehicle for your needs.</p>
               
               <div className="relative group">
                  <input 
                    type="text" 
                    placeholder="e.g. I'm taking a 5-day road trip to the mountains with 3 friends..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/40"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // In a real app we'd call Gemini here
                        alert("AI is analyzing your request... This feature uses Gemini to parse your intent and filter the fleet!");
                      }
                    }}
                  />
                  <button className="absolute right-2 top-2 p-3 bg-white text-brand-900 rounded-xl hover:scale-105 transition-all shadow-lg">
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center z-10">
               <div className="relative">
                 <img src="/images/other/concierge.jpg" alt="Concierge" className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white/10 object-cover shadow-2xl" />
                 <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-900 shadow-xl animate-bounce">
                    <MessageSquare size={32} />
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* Fleet */}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-brand-900 mb-2">Explore Our Fleet</h2>
          <p className="text-slate-500">Premium selection for your next journey</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl shadow-sm border border-white/5 overflow-x-auto">
          {['All', 'Luxury', 'Sport', 'SUV', 'Economy'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn("px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap", filter === cat ? "bg-brand-400 text-slate-950" : "text-slate-500 hover:text-white")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredCars.map(car => (
            <motion.div 
              key={car.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel rounded-[2rem] overflow-hidden group shadow-lg hover:border-brand-400/50 transition-all duration-500"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={car.image} alt={car.model} className="w-full h-full object-cover group-hover:scale-110 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-200 border border-white/10 shadow-sm">
                  {car.category}
                </div>
                {car.status === 'rented' && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-white text-slate-950 px-6 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest">Out of Fleet</span>
                  </div>
                )}
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="serif italic text-2xl text-white mb-1">{car.make} {car.model}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{car.year} • {car.transmission}</p>
                  </div>
                  <div className="flex items-center text-brand-400">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1 text-xs font-mono font-bold tracking-tighter">{getCarRating(car.id)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <div>
                    <span className="text-3xl font-mono tracking-tighter text-white">${car.pricePerDay}</span>
                    <span className="text-slate-500 text-[10px] uppercase tracking-widest ml-1">/ DAY</span>
                  </div>
                  <Link 
                    to={`/car/${car.id}`}
                    className="w-12 h-12 bg-white/5 hover:bg-brand-400 hover:text-slate-950 rounded-full flex items-center justify-center transition-all group/btn border border-white/10"
                  >
                    <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Why Choose Us */}
      <section className="mt-40 grid md:grid-cols-3 gap-12">
        <div className="stat-card flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-full border border-brand-400/20 flex items-center justify-center text-brand-400 mb-6">
             <ShieldCheck size={24} />
           </div>
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Secured Mobility</h3>
           <p className="text-slate-500 text-[11px] leading-relaxed uppercase tracking-widest">Fully comprehensive professional insurance coverage included globally.</p>
        </div>
        <div className="stat-card flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-full border border-brand-400/20 flex items-center justify-center text-brand-400 mb-6 font-mono text-xs">
             02
           </div>
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Digital Concierge</h3>
           <p className="text-slate-500 text-[11px] leading-relaxed uppercase tracking-widest">24/7 AI-driven support protocols for seamless trip management.</p>
        </div>
        <div className="stat-card flex flex-col items-center text-center">
           <div className="w-12 h-12 rounded-full border border-brand-400/20 flex items-center justify-center text-brand-400 mb-6">
             <CreditCard size={24} />
           </div>
           <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300 mb-4">Unified Payment</h3>
           <p className="text-slate-500 text-[11px] leading-relaxed uppercase tracking-widest">Encrypted blockchain-ready transaction gateways for elite users.</p>
        </div>
      </section>
    </div>
  );
};

// ... Page components defined below ...

const CarDetailsPage = ({ user }: { user: User | null }) => {
    const { id } = useParams();
    const [car, setCar] = useState<Car | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userBookings, setUserBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingStep, setBookingStep] = useState(0); // 0: view, 1: dates, 2: payment, 3: success
    const [lastBooking, setLastBooking] = useState<Booking | null>(null);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const navigate = useNavigate();
    
    const fetchData = async () => {
        const res = await DB.getCarById(id!);
        if (res) setCar(res);
        const revs = await DB.getReviewsByCarId(id!);
        setReviews(revs);
        if (user) {
            const allBookings = await DB.getBookings();
            setUserBookings(allBookings.filter(b => b.userId === user.id && b.carId === id));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id, user]);

    if (loading) return <div className="pt-32 text-center text-slate-500 font-bold uppercase tracking-widest">Searching system for unit...</div>;
    if (!car) return <div className="pt-32 text-center">Car not found.</div>;

    const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = car.pricePerDay * days;

    const handleBooking = async () => {
        if (!user) {
            alert("Sign in required to authorize session.");
            return;
        }
        const newBooking: Booking = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            userId: user.id,
            carId: car.id,
            startDate,
            endDate,
            totalPrice,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        await DB.createBooking(newBooking);
        setLastBooking(newBooking);
        setBookingStep(3);
        fetchData(); // Refresh bookings to allow review
    };

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const review: Review = {
            id: Math.random().toString(36).substr(2, 9),
            carId: car.id,
            userId: user.id,
            userName: user.name,
            rating: newReview.rating,
            comment: newReview.comment,
            createdAt: new Date().toISOString()
        };
        await DB.addReview(review);
        setReviews([...reviews, review]);
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
    };

    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const hasRented = userBookings.length > 0;

    return (
        <div className="pt-32 pb-20 px-10 max-w-7xl mx-auto">
            {/* Confirmation Modal */}
            <AnimatePresence>
                {bookingStep === 3 && lastBooking && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-lg glass-panel rounded-[2.5rem] p-12 border border-brand-400/20 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-brand-400"></div>
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-brand-400/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-400/20 text-brand-400">
                                    <ShieldCheck size={40} />
                                </div>
                                <h2 className="serif italic text-4xl text-white mb-2">Protocol Authorized</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Session Identity: {lastBooking.id}</p>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Apparatus</span>
                                    <span className="text-sm text-white font-mono">{car.make} {car.model}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-white/5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horizon</span>
                                    <span className="text-sm text-white font-mono">{lastBooking.startDate} — {lastBooking.endDate}</span>
                                </div>
                                <div className="flex justify-between items-center py-4">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Credit</span>
                                    <span className="text-xl text-brand-400 font-mono font-bold">${lastBooking.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/')} 
                                className="w-full py-5 bg-brand-400 text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-400/20"
                            >
                                Close & Release Interface
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="grid lg:grid-cols-2 gap-16">
                {/* Left: Image & Specs */}
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 relative group border border-white/10"
                    >
                        <img src={car.image} alt={car.model} className="w-full aspect-[4/3] object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" />
                        <div className="absolute top-6 left-6 flex gap-2">
                           <span className="glass-panel backdrop-blur px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg border border-white/10">{car.category}</span>
                           <span className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/10", car.status === 'available' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                             {car.status}
                           </span>
                        </div>
                    </motion.div>
                    
                    <div className="grid grid-cols-3 gap-4">
                       <div className="stat-card text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transmission</p>
                          <p className="font-bold text-white font-mono uppercase tracking-tighter">{car.transmission}</p>
                       </div>
                       <div className="stat-card text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fuel Type</p>
                          <p className="font-bold text-white font-mono uppercase tracking-tighter">{car.fuelType}</p>
                       </div>
                       <div className="stat-card text-center">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Seats</p>
                          <p className="font-bold text-white font-mono uppercase tracking-tighter">{car.seats} People</p>
                       </div>
                    </div>

                    <div className="mt-12">
                       <h3 className="serif italic text-2xl text-white mb-6">Technical Protocols</h3>
                       <div className="grid grid-cols-2 gap-y-6">
                          {Object.entries(car.specs || {}).map(([key, val]) => (
                             <div key={key} className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</span>
                                <span className="text-white font-mono text-sm">{val}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                </div>

                {/* Right: Booking Card */}
                <div className="relative">
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-32 glass-panel rounded-[2.5rem] p-12 shadow-2xl border border-white/5"
                   >
                      {bookingStep === 3 ? (
                        <div className="text-center py-10">
                           <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                              <ShieldCheck size={40} />
                           </div>
                           <h2 className="serif italic text-4xl mb-4 text-white">Session Authorized</h2>
                           <p className="text-slate-500 mb-10 text-sm uppercase tracking-widest leading-relaxed">Your secure mobility unit is assigned <br/> Access granted for APR 20.</p>
                           <button onClick={() => navigate('/')} className="w-full py-5 bg-brand-400 text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all">Flush & Close Session</button>
                        </div>
                      ) : (
                        <>
                                <div className="flex justify-between items-start mb-10 pb-8 border-b border-white/5">
                            <div>
                                <h2 className="serif italic text-5xl text-white mb-2">{car.make} {car.model}</h2>
                                <div className="flex items-center gap-4">
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{car.year} Premium Dynamics Edition</p>
                                   <div className="flex items-center text-brand-400 gap-1">
                                      <Star size={10} fill="currentColor" />
                                      <span className="text-[10px] font-mono font-bold">{avgRating}</span>
                                      <span className="text-[9px] text-slate-600">({reviews.length})</span>
                                   </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-4xl font-mono text-brand-400 tracking-tighter">${car.pricePerDay}</span>
                                <span className="text-slate-500 text-[10px] uppercase block tracking-widest mt-1">/ Daily Credit</span>
                            </div>
                          </div>

                          <div className="space-y-6 mb-10">
                             <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Temporal Horizon</label>
                                <div className="flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-white gap-4">
                                   <div className="flex flex-col gap-2 w-full">
                                      <span className="text-[8px] text-slate-600 uppercase">Commencement</span>
                                      <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent border-none outline-none text-brand-400 font-bold"
                                      />
                                   </div>
                                   <ChevronRight size={14} className="text-slate-700 rotate-90 sm:rotate-0" />
                                   <div className="flex flex-col gap-2 w-full">
                                      <span className="text-[8px] text-slate-600 uppercase">Termination</span>
                                      <input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent border-none outline-none text-brand-400 font-bold"
                                      />
                                   </div>
                                </div>
                             </div>

                             <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Network Node Base</label>
                                <div className="flex items-center gap-2 font-mono text-xs text-white">
                                   <MapPin size={16} className="text-brand-400" />
                                   <span>Main Terminal, Soekarno-Hatta Node</span>
                                </div>
                             </div>
                          </div>

                          <div className="bg-slate-950 rounded-2xl p-8 mb-10 border border-white/5 shadow-inner">
                             <div className="flex justify-between text-[11px] mb-3 text-slate-400 uppercase tracking-widest">
                                <span>Unit Rate x {days} Cycles</span>
                                <span className="text-white">${totalPrice.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between text-[11px] mb-6 text-slate-400 uppercase tracking-widest">
                                <span>Protocol Taxes</span>
                                <span className="text-white">$0.00</span>
                             </div>
                             <div className="flex justify-between font-bold text-2xl border-t border-white/10 pt-6 text-white">
                                <span className="font-mono uppercase text-xs tracking-[0.2em] text-slate-500 flex items-center">Total Credit</span>
                                <span className="font-mono text-brand-400">${totalPrice.toFixed(2)}</span>
                             </div>
                          </div>

                          {bookingStep === 2 ? (
                            <div className="space-y-6">
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Encrypted Gateway</p>
                               <div className="flex items-center gap-4 p-6 bg-brand-400/10 border border-brand-400/20 rounded-2xl text-brand-400 shadow-lg shadow-brand-400/5">
                                  <CreditCard size={24} />
                                  <span className="font-mono font-bold tracking-[0.3em] text-sm">**** **** **** 4421</span>
                               </div>
                               <button 
                                onClick={handleBooking}
                                disabled={user?.role === 'admin'}
                                className="w-full py-6 bg-brand-400 text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                               >
                                {user?.role === 'admin' ? 'Admin Restricted' : 'Authorize Transaction'}
                               </button>
                               <button 
                                onClick={() => setBookingStep(0)}
                                className="w-full py-4 text-slate-500 hover:text-white transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
                               >
                                Abort Transaction Protocol
                               </button>
                               {user?.role === 'admin' && <p className="text-[9px] text-center text-red-400 font-bold uppercase tracking-widest">Protocol Restriction: System Administrators cannot initiate rental sessions.</p>}
                            </div>
                          ) : (
                            <button 
                              disabled={car.status !== 'available' || user?.role === 'admin'}
                              onClick={() => setBookingStep(2)}
                              className="w-full py-6 bg-brand-400 text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                            >
                              {user?.role === 'admin' ? 'Management Restricted' : car.status === 'available' ? 'Initiate Session' : 'Unit Unavailable'}
                            </button>
                          )}
                          
                          <p className="text-center text-[9px] text-slate-700 mt-8 mb-0 flex items-center justify-center gap-2 uppercase font-bold tracking-widest">
                             <ShieldCheck size={12} className="text-slate-700" />
                             SSL Encrypted • GDPR Compliant • AES-256
                          </p>
                        </>
                      )}
                   </motion.div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-32 max-w-4xl">
               <div className="flex justify-between items-end mb-12">
                  <div>
                     <h3 className="serif italic text-4xl text-white mb-4">Client Experience</h3>
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <span className="text-4xl font-mono text-brand-400 font-bold">{avgRating}</span>
                           <div className="flex flex-col">
                              <div className="flex text-brand-400">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} className={i < Math.round(Number(avgRating)) ? "" : "text-slate-700"} />
                                 ))}
                              </div>
                              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{reviews.length} PROTOCOLS</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  {hasRented && (
                     <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="px-8 py-3 bg-white/5 hover:bg-brand-400 hover:text-slate-950 border border-white/10 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                     >
                        {showReviewForm ? 'Cancel Interface' : 'Initiate Feedback Protocol'}
                     </button>
                  )}
               </div>

               {showReviewForm && (
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="glass-panel rounded-[2rem] p-10 mb-12 border border-brand-400/20"
                  >
                     <form onSubmit={handleAddReview} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Satisfaction Level (1-5)</label>
                              <div className="flex gap-4">
                                 {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                       key={star} 
                                       type="button" 
                                       onClick={() => setNewReview({...newReview, rating: star})}
                                       className={cn(
                                          "w-12 h-12 rounded-xl border flex items-center justify-center transition-all",
                                          newReview.rating >= star ? "bg-brand-400/10 border-brand-400 text-brand-400" : "bg-slate-900 border-white/5 text-slate-600"
                                       )}
                                    >
                                       <Star size={20} fill={newReview.rating >= star ? "currentColor" : "none"} />
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feedback Observation</label>
                           <textarea 
                              required
                              value={newReview.comment}
                              onChange={e => setNewReview({...newReview, comment: e.target.value})}
                              placeholder="Document your experience with the apparatus..."
                              className="w-full bg-slate-900 border border-white/5 rounded-[1.5rem] p-6 text-sm text-slate-300 min-h-[150px] outline-none focus:border-brand-400 transition-all font-mono"
                           />
                        </div>
                        <button type="submit" className="px-10 py-4 bg-brand-400 text-slate-950 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all w-fit">
                           Deploy Feedback Observation
                        </button>
                     </form>
                  </motion.div>
               )}

               <div className="space-y-8">
                  {reviews.length === 0 ? (
                     <div className="py-20 text-center glass-panel rounded-[2rem] border border-white/5">
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Zero feedback cycles identified in current datastore.</p>
                     </div>
                  ) : (
                     reviews.map(review => (
                        <div key={review.id} className="glass-panel rounded-[2rem] p-10 border border-white/5 hover:border-white/10 transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 text-slate-500 font-bold text-xs">
                                    {review.userName.charAt(0)}
                                 </div>
                                 <div>
                                    <h5 className="text-white font-bold text-sm">{review.userName}</h5>
                                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mt-1">Verified Client • {new Date(review.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="flex text-brand-400 gap-1">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-800"} />
                                 ))}
                              </div>
                           </div>
                           <p className="text-slate-400 text-sm leading-relaxed font-mono italic">
                              "{review.comment}"
                           </p>
                        </div>
                     ))
                  )}
               </div>
            </div>
        </div>
    );
};

const SupportPage = () => {
    const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
        { role: 'assistant', content: "Protocol initiated. I am Vita, your system concierge. How may I facilitate your mobility requirements?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userMsg,
                config: {
                    systemInstruction: "You are 'Vita', a professional, precise, and sophisticated AI system concierge for 'Vita Rent'. You handle luxury car rental protocols. Use formal, technical language (procedural, protocols, facilitation) while remaining helpful. Keep responses concise."
                }
            });
            setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Protocol failure. Unable to process command." }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Network offline. Encrypted fallback: protocols@vitarent.com." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="pt-40 pb-12 px-10 max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="serif italic text-5xl text-white mb-6">Concierge Support</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Priority Secure Comms • 24/7 Monitoring Enabled</p>
            </div>

            <div className="glass-panel rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col h-[700px]">
                <div className="bg-slate-900 p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-400/10 rounded-2xl flex items-center justify-center text-brand-400 border border-brand-400/20">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-white uppercase tracking-widest text-xs">Vita Protocol 2.4</p>
                            <p className="text-[10px] text-green-400 font-mono flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                               SYSTEM ONLINE
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-950/20">
                    {messages.map((m, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn("flex", m.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                            <div className={cn(
                                "max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed",
                                m.role === 'user' ? 'bg-brand-400 text-slate-950 rounded-tr-none font-bold' : 'bg-white/[0.03] text-slate-300 rounded-tl-none border border-white/5 font-mono'
                            )}>
                                {m.content}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic animate-pulse">Vita is processing...</div>}
                </div>

                <div className="p-8 bg-slate-900 border-t border-white/5 flex gap-4">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="IDENTIFY PROTOCOL REQUIREMENT..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-brand-400 transition-all font-mono text-xs text-white placeholder:text-slate-700"
                    />
                    <button 
                        onClick={handleSend}
                        className="w-14 h-14 bg-brand-400 text-slate-950 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ... update routes in App component ...


const UserProfile = ({ user }: { user: User }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | 'confirmed' | 'completed' | 'cancelled'>('All');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHistory = async () => {
    setIsSyncing(true);
    const [b, c] = await Promise.all([DB.getBookings(), DB.getCars()]);
    setBookings(b.filter(booking => booking.userId === user.id));
    setCars(c);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  useEffect(() => {
    fetchHistory();
    
    // Fallback polling for "real-time" effect
    const interval = setInterval(fetchHistory, 10000);

    // Cross-tab sync for real-time behavior across instances
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vita_rent_db') fetchHistory();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user.id]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("PROTOCOL SECURITY ALERT: Confirm cancellation of authorized mobility session?")) {
      await DB.updateBookingStatus(bookingId, 'cancelled');
      fetchHistory();
    }
  };

  const filteredBookings = bookings
    .filter(b => statusFilter === 'All' || b.status === statusFilter)
    .filter(b => {
      if (!dateStart) return true;
      return b.startDate >= dateStart;
    })
    .filter(b => {
      if (!dateEnd) return true;
      return b.endDate <= dateEnd;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="pt-40 pb-20 px-10 max-w-5xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* User Card */}
        <div className="w-full md:w-80 glass-panel rounded-[2.5rem] p-10 shadow-2xl border border-white/5">
          <div className="w-24 h-24 bg-brand-400/10 rounded-full flex items-center justify-center text-brand-400 mb-6 border border-brand-400/20 mx-auto">
            <UserIcon size={40} />
          </div>
          <div className="text-center">
             <h2 className="serif italic text-3xl text-white mb-2">{user.name}</h2>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">{user.role}</p>
             <div className="h-px bg-white/5 w-full mb-6"></div>
             <div className="space-y-4 text-left">
                <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Email</p>
                   <p className="text-sm text-white font-mono">{user.email}</p>
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Member Since</p>
                   <p className="text-sm text-white font-mono">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="flex-1 space-y-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-4">
                 <h3 className="serif italic text-4xl text-white">Booking History</h3>
                 <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-bold uppercase tracking-tighter transition-all",
                    isSyncing ? "bg-brand-400/20 text-brand-400 border-brand-400/30" : "bg-white/5 text-slate-500 border-white/10"
                 )}>
                    <div className={cn("w-1 h-1 rounded-full", isSyncing ? "bg-brand-400 animate-ping" : "bg-slate-600")} />
                    {isSyncing ? "Syncing..." : "Real-Time"}
                 </div>
              </div>
              <div className="flex flex-wrap gap-4">
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest focus:border-brand-400 outline-none transition-all"
                 >
                    <option value="All">All States</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                 </select>
                 <div className="flex items-center gap-2">
                    <input 
                      type="date" 
                      value={dateStart} 
                      onChange={(e) => setDateStart(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-brand-400 focus:border-brand-400 outline-none transition-all"
                    />
                    <span className="text-slate-700">—</span>
                    <input 
                      type="date" 
                      value={dateEnd} 
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-bold text-brand-400 focus:border-brand-400 outline-none transition-all"
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              {filteredBookings.length === 0 ? (
                <div className="stat-card text-center py-20">
                   <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">No active sessions found matching filters.</p>
                </div>
              ) : (
                filteredBookings.map(booking => {
                  const car = cars.find(c => c.id === booking.carId);
                  return (
                    <div key={booking.id} className={cn(
                        "glass-panel rounded-3xl p-8 border flex flex-col sm:flex-row items-center gap-8 group hover:border-brand-400/30 transition-all relative overflow-hidden",
                        booking.status === 'confirmed' ? "border-brand-400/20 shadow-[0_0_20px_rgba(56,189,248,0.05)]" : "border-white/5"
                    )}>
                       {booking.status === 'confirmed' && <div className="absolute top-0 right-0 w-24 h-24 bg-brand-400/5 blur-3xl pointer-events-none animate-pulse" />}
                       <div className="w-32 h-20 rounded-2xl overflow-hidden grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all border border-white/10">
                          <img src={car?.image} alt={car?.model} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <h4 className="serif italic text-xl text-white">{car?.make} {car?.model}</h4>
                            <div className="flex gap-2 mx-auto sm:mx-0">
                                <span className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                booking.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-slate-500/10 text-slate-400 border-white/10'
                                )}>
                                {booking.status}
                                </span>
                                {booking.status === 'confirmed' && (
                                    <span className="bg-brand-400/20 text-brand-400 border border-brand-400/30 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest animate-pulse">
                                        Live Cycle
                                    </span>
                                )}
                            </div>
                          </div>
                          <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-1">{booking.startDate} — {booking.endDate}</p>
                          <p className="text-[8px] text-slate-600 font-mono mt-1">REF: {booking.id}</p>
                       </div>
                       <div className="flex flex-col items-center sm:items-end gap-3">
                          <div className="text-white font-mono text-lg font-bold">${booking.totalPrice}</div>
                          {booking.status === 'confirmed' && (
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              className="text-[9px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300 transition-all flex items-center gap-1 group/btn"
                            >
                              <X size={10} className="group-hover/btn:rotate-90 transition-transform" />
                              Cancel Protocol
                            </button>
                          )}
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'provisions' | 'protocols'>('overview');
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'available' | 'rented' | 'maintenance'>('All');
  const [sortField, setSortField] = useState<'make' | 'pricePerDay' | 'status'>('make');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    category: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    status: 'available',
    specs: {}
  });

  useEffect(() => {
    Promise.all([DB.getCars(), DB.getBookings(), DB.getTickets()]).then(([c, b, t]) => {
      setCars(c);
      setBookings(b);
      setTickets(t);
    });
  }, []);

  const handleUpdateStatus = async (carId: string, newStatus: any) => {
    const car = cars.find(c => c.id === carId);
    if (car) {
      const updated = { ...car, status: newStatus };
      await DB.updateCar(updated);
      setCars(cars.map(c => c.id === carId ? updated : c));
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm("PROTOCOL SECURITY ALERT: Confirm permanent removal of mobility apparatus from database?")) {
      await DB.deleteCar(carId);
      setCars(cars.filter(c => c.id !== carId));
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm("PROTOCOL SECURITY ALERT: Confirm permanent removal of provision record from database?")) {
      await DB.deleteBooking(bookingId);
      setBookings(bookings.filter(b => b.id !== bookingId));
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm("PROTOCOL SECURITY ALERT: Confirm permanent removal of protocol communication from database?")) {
      await DB.deleteTicket(ticketId);
      setTickets(tickets.filter(t => t.id !== ticketId));
    }
  };

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const carToAdd = {
      ...newCar,
      id: Math.random().toString(36).substr(2, 9),
    } as Car;
    await DB.addCar(carToAdd);
    setCars([...cars, carToAdd]);
    setShowAddForm(false);
    setNewCar({
        category: 'Luxury',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        status: 'available',
        specs: {}
    });
  };

  const filteredCars = cars
    .filter(c => filterStatus === 'All' || c.status === filterStatus)
    .filter(c => `${c.make} ${c.model}`.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
       if (sortField === 'make') return a.make.localeCompare(b.make);
       if (sortField === 'pricePerDay') return a.pricePerDay - b.pricePerDay;
       if (sortField === 'status') return a.status.localeCompare(b.status);
       return 0;
    });

  return (
    <div className="pt-32 px-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 min-h-screen">
      <aside className="w-full lg:w-64 glass-panel rounded-[2rem] p-8 h-fit shadow-2xl">
         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 px-4">Management Console</h3>
         <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all",
                activeTab === 'overview' ? "bg-brand-400 text-slate-950" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <LayoutDashboard size={18} />
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('fleet')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all",
                activeTab === 'fleet' ? "bg-brand-400 text-slate-950" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <CarIcon size={18} />
              Fleet Status
            </button>
            <button 
              onClick={() => setActiveTab('provisions')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all",
                activeTab === 'provisions' ? "bg-brand-400 text-slate-950" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Calendar size={18} />
              Provisions
            </button>
            <button 
              onClick={() => setActiveTab('protocols')}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all",
                activeTab === 'protocols' ? "bg-brand-400 text-slate-950" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <MessageSquare size={18} />
              Protocols
            </button>
         </div>
      </aside>

      <main className="flex-1 space-y-10">
        {activeTab === 'overview' ? (
          <>
            <div className="flex justify-between items-center">
                <h1 className="serif italic text-4xl text-white">System Overview</h1>
                <button 
                    onClick={() => { setActiveTab('fleet'); setShowAddForm(true); }}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-400 text-slate-950 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-400/10 active:scale-95 transition-all"
                >
                  <Plus size={18} />
                  New Unit
                </button>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-6">
               <div className="stat-card">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Gross Revenue</p>
                  <h4 className="text-3xl font-mono text-white">${bookings.reduce((acc, curr) => acc + curr.totalPrice, 0).toLocaleString()}</h4>
                  <div className="mt-4 text-[10px] font-bold text-green-400 uppercase tracking-widest">+12.4% PERFORMANCE</div>
               </div>
               <div className="stat-card">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Total Provisions</p>
                  <h4 className="text-3xl font-mono text-white">{bookings.length}</h4>
                  <div className="mt-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">NETWORK LIFETIME</div>
               </div>
               <div className="stat-card">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Active Cycles</p>
                  <h4 className="text-3xl font-mono text-white">{bookings.filter(b => b.status === 'confirmed').length}</h4>
                  <div className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">AUTHORIZED BYPASS</div>
               </div>
               <div className="stat-card border-brand-400/20">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Available Units</p>
                  <h4 className="text-3xl font-mono text-white">{cars.filter(c => c.status === 'available').length}</h4>
                  <div className="mt-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">READY FOR DEPLOY</div>
               </div>
               <div className="stat-card">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Protocols</p>
                  <h4 className="text-3xl font-mono text-white">{tickets.length}</h4>
                  <div className="mt-4 text-[10px] font-bold text-brand-400 uppercase tracking-widest">COMMS ACTIVE</div>
               </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-10 border border-white/5 shadow-2xl overflow-hidden">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8 font-mono">Mobility Demand Forecasting</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                        { name: 'SEP', bookings: 420 },
                        { name: 'OCT', bookings: 380 },
                        { name: 'NOV', bookings: 510 },
                        { name: 'DEC', bookings: 760 },
                        { name: 'JAN', bookings: 480 },
                        { name: 'FEB', bookings: 590 },
                        { name: 'MAR', bookings: 820 },
                        { name: 'APR', bookings: bookings.length + 650 },
                    ]}>
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #ffffff10', borderRadius: '1rem', fontSize: '10px', color: '#fff' }}
                        itemStyle={{ color: '#22d3ee' }}
                        cursor={{ stroke: '#22d3ee20', strokeWidth: 2 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#22d3ee" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorBookings)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-10 border border-white/5 shadow-2xl">
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-8 font-mono">Real-Time Transactions</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left font-mono">
                   <thead>
                     <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-widest">
                        <th className="pb-6 font-bold">Ref ID</th>
                        <th className="pb-6 font-bold">Apparatus</th>
                        <th className="pb-6 font-bold">Horizon</th>
                        <th className="pb-6 font-bold">State</th>
                        <th className="pb-6 font-bold text-right">Credit</th>
                     </tr>
                   </thead>
                   <tbody className="text-[11px] text-slate-300">
                     {bookings.slice(-5).reverse().map(b => {
                        const car = cars.find(c => c.id === b.carId);
                        return (
                          <tr key={b.id} className="border-b border-white/5 group hover:bg-white/[0.02] transition-all">
                             <td className="py-6 text-white font-semibold">#{b.id}</td>
                             <td className="py-6">{car?.model} / {car?.make}</td>
                             <td className="py-6">{b.startDate} — {b.endDate}</td>
                             <td className="py-6">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                  b.status === 'confirmed' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-slate-500/10 text-slate-400 border-white/10"
                                )}>
                                  {b.status}
                                </span>
                             </td>
                             <td className="py-6 text-right text-white font-bold">${b.totalPrice.toFixed(2)}</td>
                          </tr>
                        );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </>
        ) : activeTab === 'fleet' ? (
          <>
            <div className="flex justify-between items-center mb-8">
               <h1 className="serif italic text-4xl text-white">Fleet Management</h1>
               <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="IDENTIFY UNIT..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-slate-950 border border-white/10 rounded-full pl-12 pr-6 py-3 text-xs font-mono text-white outline-none focus:border-brand-400 transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-400 text-slate-950 rounded-full font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                  >
                    {showAddForm ? <X size={14} /> : <Plus size={14} />}
                    {showAddForm ? 'Cancel' : 'New Unit'}
                  </button>
               </div>
            </div>

            {showAddForm && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-[2rem] p-10 border border-brand-400/20 mb-10 shadow-2xl"
                >
                    <h3 className="serif italic text-2xl text-white mb-8">Deploy New Apparatus</h3>
                    <form onSubmit={handleAddCar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Make</label>
                            <input required type="text" placeholder="e.g. Porsche" value={newCar.make || ''} onChange={e => setNewCar({...newCar, make: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model Reference</label>
                            <input required type="text" placeholder="e.g. Taycan" value={newCar.model || ''} onChange={e => setNewCar({...newCar, model: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manufacturing Year</label>
                            <input required type="number" placeholder="2024" value={newCar.year || ''} onChange={e => setNewCar({...newCar, year: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category Branch</label>
                            <select value={newCar.category} onChange={e => setNewCar({...newCar, category: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all uppercase tracking-widest">
                                <option value="Luxury">Luxury</option>
                                <option value="Sport">Sport</option>
                                <option value="SUV">SUV</option>
                                <option value="Economy">Economy</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Daily Credit Rate ($)</label>
                            <input required type="number" placeholder="150" value={newCar.pricePerDay || ''} onChange={e => setNewCar({...newCar, pricePerDay: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transmission System</label>
                            <select value={newCar.transmission} onChange={e => setNewCar({...newCar, transmission: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all">
                                <option>Automatic</option>
                                <option>Manual</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fuel Protocol</label>
                            <select value={newCar.fuelType} onChange={e => setNewCar({...newCar, fuelType: e.target.value as any})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all uppercase tracking-widest">
                                <option value="Petrol">Petrol</option>
                                <option value="Electric">Electric</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seat Count</label>
                            <input required type="number" placeholder="5" value={newCar.seats || ''} onChange={e => setNewCar({...newCar, seats: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Imaging URI</label>
                            <input required type="text" placeholder="https://..." value={newCar.image || ''} onChange={e => setNewCar({...newCar, image: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-400 outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 pt-6">
                            <button type="submit" className="w-full py-4 bg-brand-400 text-slate-950 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-brand-400/20">
                                Initialize Apparatus Deployment
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="flex justify-between items-center mb-6">
               <div className="flex gap-4">
                  <select 
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="bg-slate-950 border border-white/10 rounded-full px-6 py-3 text-xs font-mono text-white outline-none uppercase tracking-widest"
                  >
                    <option value="All">All States</option>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
               </div>
            </div>

            <div className="glass-panel rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
               <table className="w-full text-left font-mono">
                 <thead>
                    <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest">
                       <th className="px-8 py-6 cursor-pointer hover:text-white transition-all" onClick={() => setSortField('make')}>Unit / Apparatus</th>
                       <th className="px-8 py-6">Category</th>
                       <th className="px-8 py-6 cursor-pointer hover:text-white transition-all text-center" onClick={() => setSortField('pricePerDay')}>Daily Credit</th>
                       <th className="px-8 py-6 cursor-pointer hover:text-white transition-all text-center" onClick={() => setSortField('status')}>State</th>
                       <th className="px-8 py-6 text-right">Commands</th>
                    </tr>
                 </thead>
                 <tbody className="text-[11px] text-slate-300">
                    {filteredCars.map(car => (
                       <tr key={car.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-8 rounded bg-slate-900 border border-white/5 overflow-hidden">
                                   <img src={car.image} className="w-full h-full object-cover grayscale opacity-50" />
                                </div>
                                <div>
                                   <p className="text-white font-bold">{car.make} {car.model}</p>
                                   <p className="text-[9px] text-slate-600">{car.year} • {car.transmission}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-slate-500">{car.category}</td>
                          <td className="px-8 py-6 text-center text-white">${car.pricePerDay}</td>
                          <td className="px-8 py-6 text-center">
                             <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                                car.status === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                car.status === 'rented' ? 'bg-brand-400/10 text-brand-400 border-brand-400/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'
                             )}>
                                {car.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2">
                                <button 
                                   onClick={() => handleUpdateStatus(car.id, 'available')}
                                   title="Available"
                                   className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                                >
                                   <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                </button>
                                <button 
                                   onClick={() => handleUpdateStatus(car.id, 'maintenance')}
                                   title="Maintenance"
                                   className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                                >
                                   <Settings size={14} />
                                </button>
                                <button 
                                   onClick={() => handleDeleteCar(car.id)}
                                   title="Delete Unit"
                                   className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                >
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </>
        ) : activeTab === 'provisions' ? (
          <>
            <h1 className="serif italic text-4xl text-white mb-8">Provision Records</h1>
            <div className="glass-panel rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
               <table className="w-full text-left font-mono">
                 <thead>
                    <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest">
                       <th className="px-8 py-6">Ref ID</th>
                       <th className="px-8 py-6">Apparatus</th>
                       <th className="px-8 py-6">Horizon</th>
                       <th className="px-8 py-6 text-center">Credit</th>
                       <th className="px-8 py-6 text-center">State</th>
                       <th className="px-8 py-6 text-right">Commands</th>
                    </tr>
                 </thead>
                 <tbody className="text-[11px] text-slate-300">
                    {bookings.map(b => {
                       const car = cars.find(c => c.id === b.carId);
                       return (
                          <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                             <td className="px-8 py-6 text-white uppercase font-bold">#{b.id}</td>
                             <td className="px-8 py-6">{car?.make} {car?.model}</td>
                             <td className="px-8 py-6">{b.startDate} — {b.endDate}</td>
                             <td className="px-8 py-6 text-center text-white font-bold">${b.totalPrice.toFixed(2)}</td>
                             <td className="px-8 py-6 text-center">
                                <span className={cn(
                                   "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                                   b.status === 'confirmed' ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                                   b.status === 'cancelled' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                   "bg-slate-500/10 text-slate-400 border-white/10"
                                )}>
                                   {b.status}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <button 
                                   onClick={() => handleDeleteBooking(b.id)}
                                   className="p-3 text-red-400 hover:bg-red-400/10 rounded-full transition-all group"
                                >
                                   <Trash2 size={16} className="group-hover:scale-110 transition-all" />
                                </button>
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
               </table>
            </div>
          </>
        ) : (
          <>
            <h1 className="serif italic text-4xl text-white mb-8">Protocol Communications</h1>
            <div className="glass-panel rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
               <table className="w-full text-left font-mono">
                 <thead>
                    <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest">
                       <th className="px-8 py-6">ID</th>
                       <th className="px-8 py-6">Subject</th>
                       <th className="px-8 py-6">Timestamp</th>
                       <th className="px-8 py-6 text-center">State</th>
                       <th className="px-8 py-6 text-right">Commands</th>
                    </tr>
                 </thead>
                 <tbody className="text-[11px] text-slate-300">
                    {tickets.map(t => (
                       <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                          <td className="px-8 py-6 text-white uppercase font-bold">#{t.id.substr(0,8)}</td>
                          <td className="px-8 py-6">{t.subject}</td>
                          <td className="px-8 py-6">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-6 text-center">
                             <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                                t.status === 'open' ? "bg-brand-400/10 text-brand-400 border-brand-400/20" : "bg-slate-500/10 text-slate-400 border-white/10"
                             )}>
                                {t.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button 
                                onClick={() => handleDeleteTicket(t.id)}
                                className="p-3 text-red-400 hover:bg-red-400/10 rounded-full transition-all group"
                             >
                                <Trash2 size={16} className="group-hover:scale-110 transition-all" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
               </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

// --- APP ROOT ---

export default function App() {
  const auth = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 scroll-smooth">
        <Navbar user={auth.user} logout={auth.logout} />
        <Routes>
          <Route path="/signup" element={!auth.user ? <SignUpPage /> : <Navigate to="/" replace />} />
          <Route path="/login" element={!auth.user ? <LoginPage onLoginSuccess={auth.handleLoginSuccess} /> : <Navigate to="/" replace />} />
          <Route path="/verify/:token" element={<EmailVerificationPage />} />
          <Route path="/" element={auth.isAdmin ? <Navigate to="/admin" replace /> : <HomePage />} />
          <Route path="/car/:id" element={auth.isAdmin ? <Navigate to="/admin" replace /> : <CarDetailsPage user={auth.user} />} />
          <Route path="/support" element={auth.isAdmin ? <Navigate to="/admin" replace /> : <SupportPage />} />
          <Route path="/profile" element={auth.user ? <UserProfile user={auth.user} /> : <div className="pt-32 text-center text-slate-500 font-bold uppercase tracking-widest">Sign in required</div>} />
          <Route path="/admin" element={auth.isAdmin ? <AdminDashboard /> : <div className="pt-32 text-center text-slate-500 font-bold uppercase tracking-widest">Access Denied</div>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

