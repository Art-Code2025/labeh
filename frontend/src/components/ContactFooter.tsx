import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle,
  Star,
  Users,
  Package,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import { db } from '../firebase.config';

const ContactFooter: React.FC = () => {
  const [stats, setStats] = useState({
    services: 0,
    categories: 0,
    customers: '1000+',
    rating: '4.9'
  });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب البيانات من Firebase مباشرة
        const { collection, getDocs } = await import('firebase/firestore');
        
        // جلب الفئات والخدمات
        const [servicesSnapshot, categoriesSnapshot] = await Promise.all([
          getDocs(collection(db, 'services')),
          getDocs(collection(db, 'categories'))
        ]);
        
        const servicesData: any[] = [];
        servicesSnapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        const categoriesData: any[] = [];
        categoriesSnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data()
          });
        });

        setStats(prev => ({
          ...prev,
          services: servicesData.length,
          categories: categoriesData.length
        }));
      } catch (error) {
        console.error('Error loading footer data:', error);
      }
    };

    fetchData();
    
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'خدماتنا', href: '/categories' },
    { name: 'من نحن', href: '/about' },
    { name: 'اتصل بنا', href: '/contact' },
    { name: 'الأسئلة الشائعة', href: '/faq' },
    { name: 'سياسة الخصوصية', href: '/privacy' }
  ];

  const serviceCategories = [
    { name: 'مشاوير داخلية', href: '/services/daily_services' },
    { name: 'مشاوير خارجية', href: '/services/external_errands' },
    { name: 'صيانة شاملة', href: '/services/home_maintenance' }
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Quick Stats Bar */}
      <div className="bg-cyan-600">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span className="font-semibold">{stats.services} خدمة</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{stats.customers} عميل</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-semibold">{stats.rating} تقييم</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">24/7 دعم</span>
            </div>
          </div>
        </div>
              </div>
              
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">ل</span>
              </div>
              <h3 className="text-2xl font-bold">لبيه</h3>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              عالم جديد في خدمة توصيل الطلبات ومشاويرك الخاصة لأهالي الخارجة وما حولها. نحن نجعل حياتك أسهل وأكثر راحة.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="social-icon bg-blue-600 hover:bg-blue-700">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon bg-green-600 hover:bg-green-700">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon bg-pink-600 hover:bg-pink-700">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="social-icon bg-sky-600 hover:bg-sky-700">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-cyan-400">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
              </div>
              
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-cyan-400">خدماتنا</h4>
            <ul className="space-y-3">
              {serviceCategories.map((service) => (
                <li key={service.name}>
                  <Link 
                    to={service.href} 
                    className="text-slate-300 hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-cyan-400">تواصل معنا</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-300">الخارجة، الوادي الجديد</p>
                  <p className="text-slate-400 text-sm">جمهورية مصر العربية</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <a href="tel:+201234567890" className="text-slate-300 hover:text-cyan-400 transition-colors">
                    +20 123 456 7890
                  </a>
                    </div>
                  </div>
                  
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <a href="mailto:info@labeeh.com" className="text-slate-300 hover:text-cyan-400 transition-colors">
                    info@labeeh.com
                      </a>
                    </div>
                  </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-slate-300">متاح 24/7</p>
                  <p className="text-slate-400 text-sm">خدمة على مدار الساعة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm text-center md:text-right">
              © 2024 لبيه. جميع الحقوق محفوظة. | تطوير فريق لبيه التقني
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">
                الشروط والأحكام
              </Link>
              <Link to="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">
                سياسة الخصوصية
              </Link>
              <Link to="/support" className="text-slate-400 hover:text-cyan-400 transition-colors">
                الدعم الفني
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 w-12 h-12 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
      </footer>
  );
};

export default ContactFooter;