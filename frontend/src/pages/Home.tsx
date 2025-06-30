import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Award, 
  Shield,
  Zap,
  Clock,
  Phone,
  Mail,
  MapPin,
  Home as HomeIcon,
  Wrench,
  Truck,
  Settings,
  Heart,
  ThumbsUp,
  Calendar,
  UserCircle,
  Package,
  ArrowUpRight,
  Bell,
  FileText,
  AlertCircle,
  Send,
  Loader2,
  ChevronRight,
 
} from 'lucide-react';
import { db } from '../firebase.config';
import { collection, getDocs, DocumentSnapshot } from 'firebase/firestore';
import { categoriesApi, servicesApi, Category, Service as ApiService } from '../services/servicesApi';
import { toast } from 'react-hot-toast';
import BookingModal from '../components/BookingModal';

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  homeShortDescription: string;
  mainImage?: string;
  price?: string;
  duration?: string;
  description?: string;
  features?: string[];
  detailedImages?: string[];
  availability?: string;
  customQuestions?: CustomQuestion[];
}

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
        
  // Fetch categories from Firebase/API
  const fetchCategories = async (): Promise<Category[]> => {
    try {
      return await categoriesApi.getAll();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const transformApiService = (service: ApiService): Service => ({
    id: service.id || '',
    name: service.name || '',
    category: service.category || '',
    categoryName: service.categoryName || '',
    homeShortDescription: service.homeShortDescription || '',
    mainImage: service.mainImage,
    price: service.price,
    duration: service.duration,
    description: service.homeShortDescription || '',
    features: [],
    detailedImages: [],
    availability: '24/7',
    customQuestions: service.customQuestions || []
  });

  // Fetch services from Firebase/API  
  const fetchServices = async (): Promise<Service[]> => {
    try {
      const apiServices = await servicesApi.getAll();
      // Transform API services to match our local Service interface
      return apiServices.services.map(transformApiService);
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const start = Date.now();
      try {
        setLoading(true);
        setError(null);
        console.log('[Home] بدء تحميل البيانات...', { time: new Date().toISOString() });
        const [categoriesData, initialServicesData] = await Promise.all([
          categoriesApi.getAll().then(res => { console.log('[Home] الفئات المحملة:', res.length, res); return res; }),
          servicesApi.getAll(null, 6).then(res => { console.log('[Home] الخدمات المحملة:', res.services.length, res); return res; })
        ]);
        setCategories(categoriesData);
        setServices(initialServicesData.services.map(transformApiService));
        setLastVisible(initialServicesData.lastVisible);
        setHasMore(initialServicesData.lastVisible !== null);
        console.log('[Home] ✅ تم تحميل البيانات بنجاح', {
          categories: categoriesData.length,
          services: initialServicesData.services.length,
          time: new Date().toISOString(),
          durationMs: Date.now() - start
        });
      } catch (error: any) {
        console.error('[Home] ❌ خطأ أثناء تحميل البيانات:', error, { time: new Date().toISOString() });
        setError(error.message || 'فشل في تحميل البيانات');
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const loadMoreServices = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
      const { services: newServices, lastVisible: newLastVisible } = await servicesApi.getAll(lastVisible, 6);
      setServices(prev => [...prev, ...newServices.map(transformApiService)]);
      setLastVisible(newLastVisible);
      setHasMore(newLastVisible !== null);
    } catch (error) {
      console.error('Error loading more services:', error);
      toast.error('فشل في تحميل المزيد من الخدمات');
    } finally {
      setLoadingMore(false);
    }
  };

  // Get popular services (already fetched)
  const getPopularServices = () => {
    return services; // services state now only contains popular services initially
  };

  // Scroll Animation Hook
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target); // توقف المراقبة بعد أول ظهور لتحسين الأداء
        }
      });
    }, observerOptions);

    // راقب جميع العناصر التي لم يظهر عليها الأنيميشن بعد
    const animatedElements = document.querySelectorAll('.scroll-animate:not(.animate-in)');
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [categories, services]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case '🚚':
        return <Truck size={32} />;
      case '🔧':
        return <Wrench size={32} />;
      case '🗺️':
        return <MapPin size={32} />;
      default:
        return <Settings size={32} />;
    }
  };
  
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      case 'green':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      case 'orange':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      default:
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
    }
  };

  // Helper functions
  function getDefaultImage(categoryId: string) {
    const images: Record<string, string> = {
      'internal_delivery': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500',
      'external_trips': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
      'home_maintenance': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=500'
    };
    return images[categoryId] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500';
  }

  function getDefaultDuration(categoryId: string) {
    const durations: Record<string, string> = {
      'internal_delivery': '30-60 دقيقة',
      'external_trips': '2-8 ساعات',
      'home_maintenance': '1-4 ساعات'
    };
    return durations[categoryId] || '1-2 ساعة';
  }

  function getDefaultPrice(categoryId: string) {
    const prices: Record<string, string> = {
      'internal_delivery': 'من 20 ريال',
      'external_trips': 'من 250 ريال',
      'home_maintenance': 'حسب الخدمة'
    };
    return prices[categoryId] || 'حسب الطلب';
  }

  // Handle quick booking
  const handleQuickBooking = async (service?: Service) => {
    if (service && service.id) {
      // جلب بيانات الخدمة الكاملة مع الأسئلة المخصصة
      try {
        const fullService = await servicesApi.getById(service.id);
        if (fullService) {
          // تحويل البيانات للنوع المطلوب
          const formattedService: Service = {
            ...fullService,
            category: fullService.category || service.category || '',
            categoryName: fullService.categoryName || service.categoryName || '',
            homeShortDescription: fullService.homeShortDescription || service.homeShortDescription || '',
            customQuestions: fullService.customQuestions || []
          };
          setSelectedService(formattedService);
        } else {
          setSelectedService(service);
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
        setSelectedService(service);
      }
    } else {
      setSelectedService(service || null);
    }
    setShowBookingModal(true);
  };

  // Handle quick booking with default service data
  const handleQuickBookingByCategory = async (category: string) => {
    // البحث عن أول خدمة في هذه الفئة لجلب الأسئلة المخصصة
    try {
      const categoryServices = services.filter(s => s.category === category);
      let serviceWithQuestions = null;
      
      if (categoryServices.length > 0) {
        // جلب بيانات الخدمة الأولى الكاملة
        const fullService = await servicesApi.getById(categoryServices[0].id);
        serviceWithQuestions = fullService;
      }
      
      const defaultService: Service = {
        id: serviceWithQuestions?.id || `quick-${category}`,
        name: category === 'internal_delivery' ? 'توصيل أغراض داخلي' : 
              category === 'external_trips' ? 'مشاوير خارجية' : 
              'صيانة منزلية',
        category: category || '',
        categoryName: category === 'internal_delivery' ? 'توصيل داخلي' : 
                     category === 'external_trips' ? 'مشاوير خارجية' : 
                     'صيانة منزلية',
        homeShortDescription: category === 'internal_delivery' ? 'خدمة توصيل سريعة داخل المدينة' : 
                             category === 'external_trips' ? 'مشاوير خارجية لخميس مشيط وأبها' : 
                             'خدمات صيانة منزلية شاملة',
        price: category === 'internal_delivery' ? '20 ريال' : 
               category === 'external_trips' ? 'من 250 ريال' : 
               'حسب المطلوب',
        customQuestions: serviceWithQuestions?.customQuestions || []
      };
      
      setSelectedService(defaultService);
      setShowBookingModal(true);
    } catch (error) {
      console.error('Error fetching category service:', error);
      // استخدام البيانات الافتراضية في حالة الخطأ
      const defaultService: Service = {
        id: `quick-${category}`,
        name: category === 'internal_delivery' ? 'توصيل أغراض داخلي' : 
              category === 'external_trips' ? 'مشاوير خارجية' : 
              'صيانة منزلية',
        category: category || '',
        categoryName: category === 'internal_delivery' ? 'توصيل داخلي' : 
                     category === 'external_trips' ? 'مشاوير خارجية' : 
                     'صيانة منزلية',
        homeShortDescription: category === 'internal_delivery' ? 'خدمة توصيل سريعة داخل المدينة' : 
                             category === 'external_trips' ? 'مشاوير خارجية لخميس مشيط وأبها' : 
                             'خدمات صيانة منزلية شاملة',
        price: category === 'internal_delivery' ? '20 ريال' : 
               category === 'external_trips' ? 'من 250 ريال' : 
               'حسب المطلوب',
        customQuestions: []
      };
      
      setSelectedService(defaultService);
      setShowBookingModal(true);
    }
  };

  // Close booking modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
  };

  return (
    <div dir="rtl" className="overflow-x-hidden bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#f0faff] via-[#e0f2fe] to-[#bae6fd] overflow-hidden py-12 sm:py-16 lg:py-20">
        {/* Professional Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-br from-blue-300/30 to-cyan-400/30 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-40 left-40 w-64 h-64 bg-gradient-to-br from-cyan-400/35 to-blue-300/35 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
          </div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 lg:order-1 text-right space-y-8 scroll-animate opacity-0 translate-y-8 px-4 sm:px-6 lg:px-0">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-800 leading-tight">
                  <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-l from-cyan-600 to-blue-600"> لبيه </span>
                  <br className="hidden sm:block" /> 
                  <span className="text-3xl sm:text-4xl lg:text-5xl">طلبك بين ايديك </span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 max-w-2xl leading-relaxed font-medium">
                  عالم جديد في خدمة توصيل الطلبات ومشاويرك الخاصة لأهالي الخارجة وما حولها.
                </p>
                <p className="text-base sm:text-lg lg:text-xl text-cyan-700 font-semibold max-w-2xl italic">
                  "You ask, we deliver — your request is in your hands."
                </p>
              </div>

              {/* Professional Stats */}
              <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-cyan-200/50">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600 mb-2">+1000</div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">عميل سعيد</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600 mb-2">24/7</div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">خدمة متواصلة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-cyan-600 mb-2">100%</div>
                  <div className="text-sm sm:text-base text-slate-600 font-medium">رضا العملاء</div>
                </div>
              </div>

              {/* Professional CTA Buttons */}
              <div className="flex justify-center lg:justify-end pt-6">
                <Link 
                  to="/categories" 
                  className="inline-flex items-center space-x-reverse space-x-3 px-12 py-6 bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-2xl text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 hover:scale-105"
                >
                  <Package className="w-8 h-8" />
                  <span>تصفح خدماتنا</span>
                  <ArrowRight className="w-6 h-6 transform -rotate-180" />
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end scroll-animate opacity-0 translate-x-8">
              <div className="relative max-w-lg w-full">
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                <img
                    src="/coverr.png" 
                  alt="لبيه - خدمات توصيل وصيانة"
                    className="w-full h-auto rounded-3xl shadow-2xl"
                  />
                  
                  {/* Professional Floating Elements */}
                  <div className="absolute -top-3 -right-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-xl animate-float">
                    <div className="flex items-center space-x-reverse space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-slate-700">خدمة متاحة</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  </div>
                  
                  <div className="absolute -bottom-3 -left-3 bg-white/90 backdrop-blur-sm rounded-xl p-2 shadow-xl animate-float" style={{animationDelay: '1s'}}>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4.9</div>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                      <span className="text-xs font-semibold text-slate-700">تقييم ممتاز</span>
                  </div>
                  </div>
                </div>
                
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/50 to-blue-200/50 rounded-3xl blur-3xl opacity-30 -z-10 transform scale-110"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              خدماتنا
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              نوفر لك مجموعة متنوعة من الخدمات لتلبية احتياجاتك اليومية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
                <p className="mt-4 text-slate-600">جاري تحميل الفئات...</p>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/services?category=${category.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 border border-cyan-100/50 scroll-animate opacity-0 translate-y-8"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${getColorClass(category.color || '')} transition-colors duration-300`}>
                        {getIconComponent(category.icon || '')}
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-cyan-600">
                      {category.name}
                    </h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-end text-cyan-600 group-hover:text-cyan-700">
                      <span className="font-semibold ml-2">استعراض الخدمات</span>
                      <ArrowRight className="w-5 h-5 transform -rotate-180 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">لا توجد فئات متاحة حالياً</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12 scroll-animate opacity-0 translate-y-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 transition-colors duration-300"
            >
              <span>عرض جميع الخدمات</span>
              <ArrowRight className="w-5 h-5 transform -rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Booking Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-700 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">حجز سريع وفوري</h2>
            <p className="text-lg text-green-100 max-w-2xl mx-auto">
              احجز خدمتك الآن في ثوانٍ معدودة - سنصلك في أسرع وقت!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover-lift">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">توصيل أغراض داخلي</h3>
              <p className="text-green-100 text-sm mb-4">صيدلية، بقالة، مستشفى، توصيلات أونلاين</p>
              <div className="text-2xl font-bold text-yellow-300 mb-4">20 ريال</div>
              <button
                onClick={() => handleQuickBookingByCategory('internal_delivery')}
                className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors border border-white/30"
              >
                احجز الآن
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover-lift">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">مشاوير خارجية</h3>
              <p className="text-green-100 text-sm mb-4">خميس مشيط، أبها، المطار، المرافق العامة</p>
              <div className="text-2xl font-bold text-yellow-300 mb-4">من 250 ريال</div>
              <button
                onClick={() => handleQuickBookingByCategory('external_trips')}
                className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors border border-white/30"
              >
                احجز الآن
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover-lift">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">صيانة منزلية</h3>
              <p className="text-green-100 text-sm mb-4">سباكة، كهرباء، نظافة عامة</p>
              <div className="text-2xl font-bold text-yellow-300 mb-4">حسب المطلوب</div>
              <button
                onClick={() => handleQuickBookingByCategory('home_maintenance')}
                className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors border border-white/30"
              >
                احجز الآن
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => handleQuickBooking()}
              className="inline-flex items-center gap-3 px-12 py-6 bg-white hover:bg-gray-100 text-green-700 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl transform hover:scale-105 animate-bounce"
            >
              <Bell className="w-8 h-8" />
              احجز الآن - خدمة فورية!
            </button>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-20 bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">خدماتنا الشائعة</h2>
            <p className="text-xl text-slate-600">أشهر الخدمات المطلوبة من عملائنا الكرام</p>
          </div>

            {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 text-lg">جاري تحميل الخدمات...</p>
              </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-4">⚠️ {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : getPopularServices().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg mb-4">لا توجد خدمات متاحة حالياً</p>
                <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors inline-block"
              >
                إضافة خدمات جديدة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getPopularServices().map((service) => (
                <div key={service.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-cyan-100/50 hover:-translate-y-1">
                  <div className="relative h-48 mb-6 rounded-xl overflow-hidden bg-gray-100">
                    {service.mainImage ? (
                        <img
                          src={service.mainImage}
                          alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                        <div className="text-4xl">
                          {service.category === 'internal_delivery' && '🚚'}
                          {service.category === 'external_trips' && '🗺️'}
                          {service.category === 'home_maintenance' && '🔧'}
                          {!['internal_delivery', 'external_trips', 'home_maintenance'].includes(service.category || '') && '⚙️'}
                        </div>
                      </div>
                    )}
                        </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{service.name}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-2">{service.homeShortDescription}</p>
                  
                      <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full">
                      {service.categoryName}
                    </span>
                    {service.price && (
                      <span className="text-amber-600 font-bold">
                        {service.price}
                      </span>
                        )}
                      </div>
                  
                  <div className="flex gap-3">
                    <Link
                      to={`/services/${service.id}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      عرض التفاصيل
                    </Link>
                    <button
                      onClick={() => handleQuickBooking(service)}
                      className="flex-1 text-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      احجز الآن
                    </button>
                    </div>
                    </div>
              ))}
              </div>
            )}

          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={loadMoreServices}
                disabled={loadingMore}
                className="bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-400"
              >
                {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد من الخدمات'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-cyan-600 to-blue-700 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-custom px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">خدماتنا المتميزة</h2>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              نقدم خدمات عالية الجودة ومتنوعة لتلبية جميع احتياجاتكم
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <Users className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">متنوعة</div>
                <div className="text-cyan-100 text-sm">خدمات شاملة</div>
              </div>
            </div>
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <Award className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">متخصصة</div>
                <div className="text-cyan-100 text-sm">فئات متميزة</div>
              </div>
            </div>
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <Star className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">ممتازة</div>
                <div className="text-cyan-100 text-sm">جودة عالية</div>
              </div>
            </div>
            <div className="text-center scroll-animate opacity-0 translate-y-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 hover-lift">
                <CheckCircle className="w-8 h-8 text-white mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">موثوقة</div>
                <div className="text-cyan-100 text-sm">دائماً متاحة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How we help section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#e0f2fe] to-[#f0faff] overflow-hidden">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">كيف نساعدك؟</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              جعل حياة الناس سهلة وأكثر سلاسة بسهولة الطلب والاستجابة.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex justify-center items-center mb-6">
                  <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <Clock size={32} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-center">أنت في دوامك؟</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  لا تأكل هم مقاضيك، تصلك إلى باب بيتك. إيش تنتظر؟ تواصل وبس.
                </p>
              </div>
            </div>
            
            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex justify-center items-center mb-6">
                  <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <Heart size={32} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-center">احتياجاتك اليومية</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  نمد إيدينا ونساعدك في تلبية احتياجاتك الأسرية اليومية. إيش تبي؟ لا تتردد واطلب الآن.
                </p>
              </div>
            </div>

            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex justify-center items-center mb-6">
                  <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <Zap size={32} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 text-center">سهولة وسلاسة</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  جعل حياة الناس سهلة وأكثر سلاسة بسهولة الطلب والاستجابة. اطلب الآن.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#f0faff] to-[#e0f2fe] overflow-hidden">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">لماذا تختار لبيه؟</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نحن نقدم خدمات عالية الجودة مع التركيز على راحة وسعادة عملائنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                      <Clock size={28} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">خدمة سريعة</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  نصل إليك في أسرع وقت ممكن لتلبية احتياجاتك
                </p>
              </div>
            </div>

            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                      <Shield size={28} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">موثوقية وأمان</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  فريق عمل محترف ومعتمد لضمان أعلى معايير الجودة
                </p>
              </div>
            </div>

            <div className="relative group scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="bg-cyan-100 rounded-xl p-4 group-hover:bg-cyan-600 transition-colors duration-300">
                      <ThumbsUp size={28} className="text-cyan-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">رضا العملاء</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  نسعى دائماً لتقديم تجربة مميزة تفوق توقعات عملائنا
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-[#e0f2fe] to-[#f0faff]">
        <div className="container-custom">
          <div className="text-center mb-12 scroll-animate opacity-0 translate-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4">كيف نعمل</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نظام عملنا بسيط وسهل لضمان تجربة مريحة لعملائنا
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex-1 text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-cyan-100/50 scroll-animate opacity-0 translate-y-8">
              <div className="bg-cyan-100 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                اطلب الخدمة
              </h3>
              <p className="text-slate-600">
                تواصل معنا عبر الهاتف أو الواتساب لطلب خدمتك
              </p>
            </div>

            <div className="flex-1 text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-cyan-100/50 scroll-animate opacity-0 translate-y-8">
              <div className="bg-cyan-100 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                حدد موقعك
              </h3>
              <p className="text-slate-600">
                أخبرنا بموقعك ليصلك فريقنا في أسرع وقت
              </p>
            </div>

            <div className="flex-1 text-center p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-cyan-100/50 scroll-animate opacity-0 translate-y-8">
              <div className="bg-cyan-100 rounded-xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={32} className="text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                استمتع بالخدمة
              </h3>
              <p className="text-slate-600">
                استرخِ ودع فريقنا المحترف يهتم بكل التفاصيل
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-[#f0faff] to-[#e0f2fe] relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-cyan-300/15 to-blue-300/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              <span>تقييمات العملاء</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-6">
              ما يقوله <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-l from-cyan-600 to-blue-600">عملاؤنا</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              نفخر بثقة عملائنا الكرام ونسعى دائماً لتقديم تجربة استثنائية تفوق التوقعات
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial Card 1 */}
            <div className="group relative scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">أ</span>
                  </div>
                </div>
                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                  "تجربة رائعة حقاً! الفريق محترف جداً والخدمة سريعة وموثوقة. أنصح الجميع بالتعامل معهم."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">أحمد محمد</p>
                    <p className="text-cyan-600 font-medium">مهندس معماري</p>
                  </div>
                  <div className="text-cyan-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.309 17.708C22.196 15.66 22.006 13.03 22 13V5a1 1 0 0 0-1-1h-6c-1.103 0-2 .897-2 2v7a1 1 0 0 0 1 1h3.078a2.89 2.89 0 0 1-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.152.493.646c.102.134 2.293 3.003 5.602 3.182.001.001 4.068.018 6.787-3.293z"/>
                      <path d="M8.309 17.708C10.196 15.66 10.006 13.03 10 13V5a1 1 0 0 0-1-1H3C1.897 4 1 4.897 1 6v7a1 1 0 0 0 1 1h3.078a2.89 2.89 0 0 1-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.152.493.646c.102.134 2.293 3.003 5.602 3.182.001.001 4.068.018 6.787-3.293z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="group relative scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">ف</span>
                  </div>
                </div>
                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                  "خدمة توصيل متميزة وسرعة في الاستجابة. الفريق ودود ومحترف، والأسعار معقولة جداً."
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">فاطمة أحمد</p>
                    <p className="text-cyan-600 font-medium">طبيبة أطفال</p>
                  </div>
                  <div className="text-cyan-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.309 17.708C22.196 15.66 22.006 13.03 22 13V5a1 1 0 0 0-1-1h-6c-1.103 0-2 .897-2 2v7a1 1 0 0 0 1 1h3.078a2.89 2.89 0 0 1-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.152.493.646c.102.134 2.293 3.003 5.602 3.182.001.001 4.068.018 6.787-3.293z"/>
                      <path d="M8.309 17.708C10.196 15.66 10.006 13.03 10 13V5a1 1 0 0 0-1-1H3C1.897 4 1 4.897 1 6v7a1 1 0 0 0 1 1h3.078a2.89 2.89 0 0 1-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.152.493.646c.102.134 2.293 3.003 5.602 3.182.001.001 4.068.018 6.787-3.293z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="group relative scroll-animate opacity-0 translate-y-8">
              <div className="absolute inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">س</span>
                  </div>
                </div>
                <blockquote className="text-slate-700 mb-6 text-lg leading-relaxed italic">
                  "أفضل خدمة صيانة تعاملت معها. حلوا مشكلتي بسرعة ومهارة عالية. شكراً لكم!"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-lg">سارة علي</p>
                    <p className="text-cyan-600 font-medium">مديرة مشاريع</p>
                  </div>
                  <div className="text-cyan-600">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.309 17.708C22.196 15.66 22.006 13.03 22 13V5a1 1 0 0 0-1-1h-6c-1.103 0-2 .897-2 2v7a1 1 0 0 0 1 1h3.078a2.89 2.89 0 0 1-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.152.493.646c.102.134 2.293 3.003 5.602 3.182.001.001 4.068.018 6.787-3.293z"/>
                      <path d="M8.309 17.708C10.196 15.66 10.006 13.03 10 13V5a1 1 0 0 0-1-1H3C1.897 4 1 4.897 1 6v7a1 1 0 0 0 1 1h3.078a2.89 2.89 0 0 1-.429 1.396c-.508.801-1.465 1.348-2.846 1.624l-.803.152.493.646c.102.134 2.293 3.003 5.602 3.182.001.001 4.068.018 6.787-3.293z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center scroll-animate opacity-0 translate-y-8">
            <div className="inline-flex items-center gap-8 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-cyan-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">+1500</p>
                  <p className="text-sm text-slate-600">عميل راضٍ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">4.9/5</p>
                  <p className="text-sm text-slate-600">تقييم عام</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">100%</p>
                  <p className="text-sm text-slate-600">موثوقية</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Premium Footer - Enhanced */}
      <footer className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 overflow-hidden">
        {/* Enhanced Background Patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600"></div>
          <div className="absolute top-10 left-1/4 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-cyan-100/30 to-blue-100/30 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="container-custom relative z-10 px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12 scroll-animate opacity-0 translate-y-8">
            
            {/* Company Info - Enhanced */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="شعار لبيه"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-lg object-contain transform transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">لبيه</h3>
                  <p className="text-sm md:text-base text-blue-600 font-semibold">خدمات متكاملة لحياة أسهل</p>
                </div>
              </div>
              
              <p className="text-slate-600 leading-relaxed mb-6 max-w-md text-sm md:text-base">
                نحن نقدم خدمات متكاملة وحلول مبتكرة لتلبية احتياجاتكم اليومية. نسعى دائماً لتقديم أفضل تجربة ممكنة لعملائنا الكرام بأعلى معايير الجودة والاحترافية.
              </p>
              
              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-sm">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">+1500</div>
                  <div className="text-xs md:text-sm text-slate-600">عميل سعيد</div>
                </div>
                <div className="text-center border-x border-blue-100">
                  <div className="text-xl md:text-2xl font-bold text-cyan-600 mb-1">24/7</div>
                  <div className="text-xs md:text-sm text-slate-600">خدمة مستمرة</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">4.9★</div>
                  <div className="text-xs md:text-sm text-slate-600">تقييم ممتاز</div>
                </div>
              </div>
            </div>

            {/* Quick Links - Enhanced */}
            <div>
              <h4 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                روابط سريعة
              </h4>
              <ul className="space-y-3">
                {[
                  { name: 'الرئيسية', href: '/', icon: '🏠' },
                  { name: 'خدماتنا', href: '/categories', icon: '📦' },
                  { name: 'من نحن', href: '/about', icon: '👥' },
                  { name: 'اتصل بنا', href: '/contact', icon: '📞' }
                ].map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-all duration-300 group py-2 px-3 rounded-lg hover:bg-white/40 hover:backdrop-blur-sm"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                      <span className="font-medium">{link.name}</span>
                      <ArrowRight className="w-4 h-4 transform -rotate-180 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info - Enhanced */}
            <div>
              <h4 className="text-lg md:text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                تواصل معنا
              </h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-600 group">
                  <div className="p-2 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">+966 56 980 6839</p>
                    <p className="text-xs text-slate-500">متاح 24/7</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-slate-600 group">
                  <div className="p-2 bg-cyan-100 group-hover:bg-cyan-200 text-cyan-600 rounded-lg transition-colors duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">elsadig6839@gmail.com</p>
                    <p className="text-xs text-slate-500">رد سريع</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-slate-600 group">
                  <div className="p-2 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">خدمة مستمرة</p>
                    <p className="text-xs text-slate-500">طوال أيام الأسبوع</p>
                  </div>
                </li>
              </ul>

              {/* Social Links - New */}
              <div className="mt-6 pt-6 border-t border-blue-100">
                <p className="text-sm font-semibold text-slate-700 mb-3">تابعنا</p>
                <div className="flex items-center gap-3">
                  <a href="#" className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-300 transform hover:scale-110">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="p-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-600 rounded-lg transition-all duration-300 transform hover:scale-110">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.74.099.12.112.225.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.162-1.499-.69-2.436-2.878-2.436-4.624 0-3.784 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                    </svg>
                  </a>
                  <a href="#" className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-300 transform hover:scale-110">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Newsletter Section */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-6 md:p-8 mb-8 text-white scroll-animate opacity-0 translate-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h4 className="text-xl md:text-2xl font-bold mb-3">ابق على اطلاع بآخر العروض</h4>
              <p className="text-blue-100 mb-6 text-sm md:text-base">اشترك في نشرتنا الإخبارية لتصلك أحدث الخدمات والعروض الحصرية</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="flex-1 px-4 py-3 rounded-xl text-slate-800 placeholder-slate-500 border-0 focus:ring-2 focus:ring-white/50 transition-all duration-300"
                />
                <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105">
                  <Send className="w-4 h-4" />
                  <span>اشتراك</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Enhanced */}
          <div className="pt-6 border-t border-blue-200/50">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm">
              <div className="text-slate-600 text-center lg:text-right order-2 lg:order-1">
                <p className="mb-1">© {new Date().getFullYear()} <span className="text-blue-600 font-bold">لبيه</span> - جميع الحقوق محفوظة</p>
                <p className="flex items-center justify-center lg:justify-start gap-1">
                  تم التطوير بواسطة 
                  <a 
                    href="https://www.instagram.com/artc.ode39?igsh=aW4zZTM4Z2I1a29l" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300 flex items-center gap-1 hover:underline"
                  >
                    ArtCode
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 text-slate-600 order-1 lg:order-2">
                <a href="#" className="hover:text-blue-600 transition-colors duration-300 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  سياسة الخصوصية
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-300 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  الشروط والأحكام  
                </a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-300 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  اتفاقية الاستخدام
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Top Button - Enhanced */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50 group"
        >
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transform rotate-90 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={closeBookingModal}
        service={selectedService}
      />
    </div>
  );
};

export default Home;