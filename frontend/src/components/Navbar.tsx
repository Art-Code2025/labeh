import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, Phone, LogIn, Package } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesCount, setServicesCount] = useState(0);
  const location = useLocation();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchServicesCount();
  }, []);

  const fetchServicesCount = async () => {
    try {
      // جلب الخدمات من Firebase مباشرة
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');
      
      const firebaseConfig = {
        apiKey: "AIzaSyCU3gkAwZGeyww7XjcODeEjl-kS9AcOyio",
        authDomain: "lbeh-81936.firebaseapp.com",
        projectId: "lbeh-81936",
        storageBucket: "lbeh-81936.firebasestorage.app",
        messagingSenderId: "225834423678",
        appId: "1:225834423678:web:5955d5664e2a4793c40f2f"
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      // جلب الفئات كخدمات
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const servicesData: any[] = [];
      
      snapshot.forEach((doc) => {
        const category = doc.data();
        servicesData.push({
          id: doc.id,
          name: category.name,
          category: doc.id,
          categoryName: category.name
        });
      });
      
      setServices(servicesData);
      setServicesCount(servicesData.length);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="w-full bg-gradient-to-b from-[#f0faff] via-[#f8fbff] to-[#f0faff] shadow-sm" dir="rtl">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Professional Logo */}
          <Link to="/" className="flex items-center space-x-reverse space-x-4 group">
            <img
              src="/logo.png"
              alt="شعار لبيه"
              className="w-16 h-16 rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl object-contain"
            />
            <div className="flex flex-col">
              <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-l from-cyan-600 to-blue-700 bg-clip-text text-transparent">لبيه</span>
            </div>
            {servicesCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-sm text-cyan-700 text-sm px-4 py-2 rounded-full shadow-sm border border-cyan-100">
                <Package className="w-4 h-4" />
                <span className="font-semibold">{servicesCount}</span>
                <span className="font-medium">خدمة</span>
              </div>
            )}
          </Link>

          {/* Professional Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-reverse space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-reverse space-x-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                isActive('/') 
                  ? 'text-cyan-700 bg-white/80 backdrop-blur-sm shadow-md border border-cyan-100' 
                  : 'text-slate-700 hover:text-cyan-700 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-sm'
              }`}
            >
              <Home size={18} />
              <span>الرئيسية</span>
            </Link>
            
            <Link
              to="/categories"
              className={`flex items-center space-x-reverse space-x-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                isActive('/categories') 
                  ? 'text-emerald-700 bg-white/80 backdrop-blur-sm shadow-md border border-emerald-100' 
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-sm'
              }`}
            >
              <Package size={18} />
              <span>الخدمات</span>
              {servicesCount > 0 && (
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {servicesCount}
                </span>
              )}
            </Link>

              <Link
              to="/about"
              className={`flex items-center space-x-reverse space-x-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                isActive('/about') 
                  ? 'text-amber-700 bg-white/80 backdrop-blur-sm shadow-md border border-amber-100' 
                  : 'text-slate-700 hover:text-amber-700 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-sm'
              }`}
              >
              <Users size={18} />
              <span>من نحن</span>
              </Link>

            <Link
              to="/contact"
              className={`flex items-center space-x-reverse space-x-2 px-5 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                isActive('/contact') 
                  ? 'text-blue-700 bg-white/80 backdrop-blur-sm shadow-md border border-blue-100' 
                  : 'text-slate-700 hover:text-blue-700 hover:bg-white/60 hover:backdrop-blur-sm hover:shadow-sm'
              }`}
            >
              <Phone size={18} />
              <span>اتصل بنا</span>
            </Link>
            
            {/* Premium Login Button */}
            <Link
              to="/login"
              className="flex items-center space-x-reverse space-x-2 px-6 py-3 bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ml-4"
            >
              <LogIn size={18} />
              <span>الدخول</span>
            </Link>
          </div>

          {/* Professional Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-slate-700 rounded-xl transition-all duration-300 shadow-sm border border-slate-200/50"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Premium Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden pb-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl mx-4 p-6 space-y-2 border border-white/50">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-reverse space-x-3 px-5 py-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                  isActive('/') 
                    ? 'text-cyan-700 bg-cyan-50/80 backdrop-blur-sm shadow-sm' 
                    : 'text-slate-700 hover:text-cyan-700 hover:bg-cyan-50/50'
                }`}
              >
                <Home size={20} />
                <span>الرئيسية</span>
              </Link>
              
                <Link
                to="/categories"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-reverse space-x-3 px-5 py-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                  isActive('/categories') 
                    ? 'text-emerald-700 bg-emerald-50/80 backdrop-blur-sm shadow-sm' 
                    : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <Package size={20} />
                <span>الخدمات</span>
                {servicesCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full mr-auto">
                    {servicesCount}
                  </span>
                )}
              </Link>
              
              <Link
                to="/about"
                  onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-reverse space-x-3 px-5 py-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                  isActive('/about') 
                    ? 'text-amber-700 bg-amber-50/80 backdrop-blur-sm shadow-sm' 
                    : 'text-slate-700 hover:text-amber-700 hover:bg-amber-50/50'
                }`}
                >
                <Users size={20} />
                <span>من نحن</span>
                </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-reverse space-x-3 px-5 py-4 rounded-xl text-base font-semibold transition-all duration-300 ${
                  isActive('/contact') 
                    ? 'text-blue-700 bg-blue-50/80 backdrop-blur-sm shadow-sm' 
                    : 'text-slate-700 hover:text-blue-700 hover:bg-blue-50/50'
                }`}
              >
                <Phone size={20} />
                <span>اتصل بنا</span>
              </Link>
              
              <div className="pt-4 border-t border-slate-200/50">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-reverse space-x-3 px-6 py-4 bg-gradient-to-l from-cyan-600 to-blue-600 text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-lg"
                >
                  <LogIn size={20} />
                  <span>الدخول</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
  