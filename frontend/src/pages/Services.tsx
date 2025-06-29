import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Truck, 
  Wrench, 
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  Grid,
  List,
  Package,
  CheckCircle,
  Award,
  Users,
  AlertCircle,
  Calendar,
  Shield,
  ChevronRight
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

// تعريف نوع الخدمة
interface Service {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  homeShortDescription: string;
  detailsShortDescription: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  imageDetails: string[];
  features: string[];
  duration?: string;
  availability?: string;
  price?: string;
}

// تعريف فئات الخدمات
interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  services: Service[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// خيارات مخصصة لكل فئة حسب طلب المستخدم
const categoryOptions = {
  'internal_delivery': {
    name: 'خدمة توصيل أغراض داخلي',
    price: '20 ريال',
    options: ['صيدلية', 'بقالة', 'مستشفى', 'توصيلات أونلاين']
  },
  'external_trips': {
    name: 'مشاوير خارجية',
    destinations: {
      'خميس مشيط': { price: '250 ريال', duration: '9 ساعات كحد أقصى' },
      'أبها': { price: '300 ريال', duration: '9 ساعات كحد أقصى' }
    },
    options: ['حجز مستشفى', 'حجز مشغل', 'الحدائق', 'المرافق العامة', 'المطار']
  },
  'home_maintenance': {
    name: 'صيانة منزلية',
    price: 'على حسب المطلوب',
    options: ['سباكة', 'كهرباء', 'نظافة عامة']
  }
};

function Services() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // جلب الخدمات من الخادم
  useEffect(() => {
    fetchData();
  }, []);

  // تطبيق فلتر الفئة من URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // فلترة الخدمات حسب الفئة والبحث
  useEffect(() => {
    if (!services) return;

    let filtered = services;
    
    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // فلترة حسب البحث
    if (searchTerm.trim()) {
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchServices()]);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
        }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesData: Category[] = [];
      
      categoriesSnapshot.forEach((doc) => {
        const categoryData = doc.data();
        categoriesData.push({
          id: doc.id,
          name: categoryData.name || '',
          description: categoryData.description || '',
          icon: categoryData.icon || '📦',
          color: categoryData.color || 'blue'
        });
      });

      setCategories(categoriesData);
      console.log('✅ Categories loaded:', categoriesData.length);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const servicesRef = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesRef);
      const servicesData: Service[] = [];
      
      servicesSnapshot.forEach((doc) => {
        servicesData.push({ id: doc.id, ...doc.data() } as Service);
      });

      setServices(servicesData);
      
      // تجميع الخدمات حسب الفئات
      const groupedCategories = groupServicesByCategory(servicesData);
      setServiceCategories(groupedCategories);
      
      console.log('✅ Services loaded:', servicesData.length);
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      toast.error('حدث خطأ أثناء تحميل الخدمات');
    }
  };

  // Helper functions (same as in Netlify Functions)
  function getDefaultImage(categoryId: string) {
    const images: Record<string, string> = {
      'internal_delivery': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500',
      'external_trips': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
      'home_maintenance': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=500'
    };
    return images[categoryId] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500';
  }

  function getDetailedDescription(categoryId: string) {
    const descriptions: Record<string, string> = {
      'internal_delivery': 'خدمات التوصيل السريعة داخل المدينة مع ضمان الوصول في الوقت المحدد. نوفر خدمات توصيل البقالة، الأدوية، والوثائق بأمان تام.',
      'external_trips': 'رحلات آمنة ومريحة للمسافات البعيدة مع سائقين محترفين. نغطي جميع المحافظات مع إمكانية الحجز المسبق والرحلات العاجلة.',
      'home_maintenance': 'خدمات صيانة شاملة للمنازل والمكاتب مع فنيين متخصصين. نقدم خدمات السباكة، الكهرباء، التكييف، والدهانات بضمان الجودة.'
    };
    return descriptions[categoryId] || 'خدمة متميزة بجودة عالية';
  }

  function getDefaultFeatures(categoryId: string) {
    const features: Record<string, string[]> = {
      'internal_delivery': ['توصيل سريع خلال ساعة', 'خدمة 24/7', 'تتبع الطلب مباشر', 'ضمان الأمان'],
      'external_trips': ['سائقين محترفين', 'سيارات حديثة ومريحة', 'أسعار تنافسية', 'رحلات آمنة'],
      'home_maintenance': ['فنيين معتمدين', 'ضمان على الخدمة', 'قطع غيار أصلية', 'خدمة طوارئ']
    };
    return features[categoryId] || ['خدمة عالية الجودة', 'أسعار مناسبة', 'ضمان الرضا'];
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

  // تجميع الخدمات حسب الفئات
  const groupServicesByCategory = (services: Service[]): ServiceCategory[] => {
    const categoryMap = new Map<string, ServiceCategory>();
    
    services.forEach(service => {
      if (!categoryMap.has(service.category)) {
        // إنشاء فئة جديدة
        let categoryInfo = {
          id: service.category,
          name: service.categoryName,
          description: `خدمات ${service.categoryName}`,
          icon: <Package className="w-6 h-6" />,
        color: 'blue',
        services: []
        };

        // تحديد الأيقونة والوصف بناء على نوع الفئة
        if (service.category.includes('internal') || service.category.includes('delivery')) {
          categoryInfo.icon = <Truck className="w-6 h-6" />;
          categoryInfo.color = 'blue';
          categoryInfo.description = 'خدمات التوصيل والمشاوير اليومية داخل المدينة';
        } else if (service.category.includes('external') || service.category.includes('trips')) {
          categoryInfo.icon = <MapPin className="w-6 h-6" />;
          categoryInfo.color = 'green';
          categoryInfo.description = 'المشاوير والتوصيل للمسافات البعيدة بين المدن';
        } else if (service.category.includes('maintenance') || service.category.includes('home')) {
          categoryInfo.icon = <Wrench className="w-6 h-6" />;
          categoryInfo.color = 'orange';
          categoryInfo.description = 'خدمات الصيانة والإصلاح المنزلي المتخصصة';
        }

        categoryMap.set(service.category, categoryInfo);
      }
      
      // إضافة الخدمة للفئة
      const category = categoryMap.get(service.category);
      if (category) {
        category.services.push(service);
      }
    });

    return Array.from(categoryMap.values());
  };

  const getImageSrc = (image: string) => {
    return image;
  };

  const getIconComponent = (iconString: string) => {
    switch (iconString) {
      case '🚚': return <Truck className="w-6 h-6" />;
      case '🗺️': return <MapPin className="w-6 h-6" />;
      case '🔧': return <Wrench className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getColorClass = (color: string) => {
    const colorClasses: Record<string, string> = {
      'blue': 'bg-blue-500/20 text-blue-400',
      'green': 'bg-green-500/20 text-green-400',
      'orange': 'bg-orange-500/20 text-orange-400',
      'purple': 'bg-purple-500/20 text-purple-400',
      'red': 'bg-red-500/20 text-red-400',
      'cyan': 'bg-cyan-500/20 text-cyan-400'
    };
    return colorClasses[color] || 'bg-blue-500/20 text-blue-400';
  };

  // تصفية الخدمات
  const filteredServiceCategories = serviceCategories.filter(category => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) {
      return false;
    }
    
    if (searchTerm) {
      return category.services.some(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.homeShortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">جاري تحميل الخدمات</h3>
          <p className="text-gray-600 text-lg">يرجى الانتظار قليلاً...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto text-center shadow-2xl border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">عذراً!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
            </div>
            
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              خدماتنا المتميزة
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              نوفر لك مجموعة شاملة من الخدمات عالية الجودة لتلبية جميع احتياجاتك اليومية
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن الخدمة التي تحتاجها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-14 pl-6 py-4 bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-2 focus:ring-white focus:border-white text-gray-800 placeholder-gray-500 shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                }`}
              >
                جميع الخدمات
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium">طريقة العرض:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">لا توجد خدمات</h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm ? 'لم نجد خدمات تطابق بحثك' : 'لا توجد خدمات في هذه الفئة حالياً'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
                    <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory === 'all' ? 'جميع الخدمات' : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredServices.length} خدمة متاحة
                </p>
                  </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>متاح 24/7</span>
              </div>
            </div>

            {/* Services Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'space-y-6'
            }>
              {filteredServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  viewMode={viewMode}
                />
            ))}
          </div>
          </>
        )}
      </div>

      <ToastContainer
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

// مكون ServiceCard الجميل
interface ServiceCardProps {
  service: Service;
  viewMode: 'grid' | 'list';
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, viewMode }) => {
  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-xl">
        <div className="flex gap-6">
          {/* Service Image */}
          <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {service.mainImage ? (
              <img
                src={service.mainImage}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Service Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {service.name}
                </h3>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {service.categoryName}
                </span>
              </div>
              {service.price && (
                <span className="text-lg font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                  {service.price}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{service.homeShortDescription}</p>

            {/* Service Features */}
            {service.features && service.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {service.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100"
                  >
                    {feature}
                  </span>
                ))}
                {service.features.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    +{service.features.length - 3} المزيد
                  </span>
                )}
              </div>
            )}

            {/* Service Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {service.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>ضمان الجودة</span>
                </div>
              </div>

              <Link
                to={`/services/${service.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                عرض التفاصيل
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2">
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {service.mainImage ? (
          <img
            src={service.mainImage}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-800 text-sm font-medium rounded-full border border-blue-100">
          {service.categoryName}
        </div>

        {/* Price Badge */}
        {service.price && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
            {service.price}
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{service.homeShortDescription}</p>
        </div>

        {/* Service Features */}
        {service.features && service.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {service.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
              >
                {feature}
              </span>
            ))}
            {service.features.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{service.features.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Service Meta */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          {service.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>متاح الآن</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/services/${service.id}`}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          احجز الآن
          <Calendar className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default Services; 