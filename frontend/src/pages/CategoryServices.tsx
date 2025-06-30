import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Search, Grid, List, Package, Truck, Wrench, MapPin, Settings, AlertCircle } from 'lucide-react';
import { categoriesApi, servicesApi, Category, Service as ApiService } from '../services/servicesApi';
import { toast } from 'react-hot-toast';

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

const CategoryServices: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch category and services data
  useEffect(() => {
    const loadData = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories and services data
        const [categoriesData, servicesData] = await Promise.all([
          categoriesApi.getAll(),
          servicesApi.getAll()
        ]);
        
        // Find the specific category
        const categoryData = categoriesData.find(cat => cat.id === categoryId);
        if (!categoryData) {
          throw new Error('الفئة غير موجودة');
        }
        
        setCategory(categoryData);
        
        // Filter services for this category
        const categoryServices = servicesData.services
          .filter((service: ApiService) => service.category === categoryId)
          .map(transformApiService);
        
        setServices(categoryServices);
        setFilteredServices(categoryServices);
        
        console.log('✅ Category data loaded:', { 
          category: categoryData.name, 
          services: categoryServices.length 
        });
      } catch (error: any) {
        console.error('❌ Error loading category data:', error);
        setError(error.message || 'فشل في تحميل البيانات');
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  // Filter services based on search term
  useEffect(() => {
    let filtered = services;
    
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.homeShortDescription ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
  }, [services, searchTerm]);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case '🚚':
        return <Truck className="w-8 h-8" />;
      case '🔧':
        return <Wrench className="w-8 h-8" />;
      case '🗺️':
        return <MapPin className="w-8 h-8" />;
      default:
        return <Settings className="w-8 h-8" />;
    }
  };

  const getImageSrc = (image?: string) => {
    return image || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">جاري تحميل خدمات الفئة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0faff] to-[#e0f2fe] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto text-center shadow-2xl border border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">عذراً!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للفئات
          </Link>
        </div>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للفئات
          </Link>
        </div>
      </div>

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm font-medium mb-4">
                <span className="text-2xl">{category.icon || '📦'}</span>
                <span>فئة {category.name}</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              {category.name}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
              {category.description}
            </p>
            <div className="mt-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                <Package className="w-4 h-4" />
                <span>{services.length} خدمة متاحة</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Search and Filters */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث في خدمات هذه الفئة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-4 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                />
              </div>

              {/* Results Info and View Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="text-slate-600">
                  <span className="text-sm">
                    عرض {filteredServices.length} من {services.length} خدمة
                  </span>
                </div>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <List className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Display */}
        <div>
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchTerm 
                  ? 'لا توجد خدمات تطابق البحث'
                  : 'لا توجد خدمات في هذه الفئة حالياً'
                }
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm 
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'تحقق من الفئات الأخرى أو تواصل معنا لطلب خدمة مخصصة'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    مسح البحث
                  </button>
                )}
                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <ArrowRight className="w-4 h-4" />
                  تصفح فئات أخرى
                </Link>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
                : 'space-y-6'
            }>
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                  }`}
                >
                  {/* Service Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' 
                      ? 'w-full sm:w-64 h-48 sm:h-auto flex-shrink-0' 
                      : 'h-48 sm:h-56'
                  }`}>
                    {service.mainImage ? (
                      <img
                        src={getImageSrc(service.mainImage ?? '')}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <div className="text-4xl sm:text-5xl">
                          {category.icon || '⚙️'}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  {/* Service Content */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors duration-300">
                            {service.name}
                          </h3>
                          <p className="text-slate-600 text-sm sm:text-base line-clamp-2 leading-relaxed">
                            {service.homeShortDescription ?? ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          {service.duration && (
                            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              {service.duration}
                            </span>
                          )}
                        </div>
                        {service.price && (
                          <span className="text-lg sm:text-xl font-bold text-amber-600">
                            {service.price}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/services/${service.id}`}
                        className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl transition-all duration-300 font-medium transform hover:scale-105 shadow-md"
                      >
                        عرض التفاصيل
                      </Link>
                      <Link
                        to={`/services/${service.id}`}
                        className="flex-1 text-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 font-medium transform hover:scale-105 shadow-md"
                      >
                        احجز الآن
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {filteredServices.length > 0 && (
          <div className="text-center mt-12 sm:mt-16">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-cyan-200">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                هل تحتاج مساعدة في اختيار الخدمة المناسبة؟
              </h3>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                فريقنا جاهز لمساعدتك في العثور على أفضل خدمة تناسب احتياجاتك
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                تواصل معنا
                <ArrowRight className="w-5 h-5 transform rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryServices; 