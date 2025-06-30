import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, Filter, Grid, List, Package, Truck, Wrench, MapPin, Settings, Plus } from 'lucide-react';
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

const Categories: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Fetch data from API/Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both categories and services
        const [categoriesData, servicesData] = await Promise.all([
          categoriesApi.getAll(),
          servicesApi.getAll()
        ]);
        
        setCategories(categoriesData);
        setServices(servicesData.services.map(transformApiService));
        
        console.log('✅ Categories data loaded:', { 
          categories: categoriesData.length, 
          services: servicesData.services.length 
        });
      } catch (error: any) {
        console.error('❌ Error loading categories data:', error);
        setError(error.message || 'فشل في تحميل البيانات');
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply category filter from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Filter services based on selected category and search term
  useEffect(() => {
    let filtered = services;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.homeShortDescription ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.categoryName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

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
          <p className="text-gray-800 text-lg">جاري تحميل الفئات والخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <p className="text-red-400 text-lg mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
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
                <Package className="w-4 h-4" />
                <span>استكشف خدماتنا</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              فئات الخدمات
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
              اكتشف جميع خدماتنا المتنوعة واختر ما يناسب احتياجاتك
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Categories Grid */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              الفئات المتاحة
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              اختر الفئة التي تناسبك لعرض الخدمات المتاحة
            </p>
          </div>
          
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg mb-6">لا توجد فئات متاحة حالياً</p>
              <Link 
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                إضافة فئات جديدة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* All Services Button */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`group p-6 sm:p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 ${
                  selectedCategory === 'all'
                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-lg'
                    : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-500 group-hover:text-white'
                  }`}>
                    <Grid className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600">
                    جميع الخدمات
                  </h3>
                  <p className="text-sm text-slate-500">
                    {services.length} خدمة متاحة
                  </p>
                </div>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group p-6 sm:p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 border-2 ${
                    selectedCategory === category.id
                      ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-lg'
                      : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-500 group-hover:text-white'
                    }`}>
                      <span className="text-2xl">{category.icon || '📦'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedCategory === category.id
                          ? 'bg-cyan-500 text-white'
                          : 'bg-cyan-100 text-cyan-600'
                      } transition-colors duration-300`}>
                        {services.filter(s => s.category === category.id).length} خدمة متاحة
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث في الخدمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-12 pl-4 py-4 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  جميع الخدمات
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="text-slate-600">
                  <span className="text-sm">
                    {selectedCategory === 'all' 
                      ? `عرض ${filteredServices.length} من ${services.length} خدمة`
                      : `عرض ${filteredServices.length} خدمة في ${categories.find(c => c.id === selectedCategory)?.name}`
                    }
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

        {/* Enhanced Services Display */}
        <div>
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {searchTerm 
                  ? 'لا توجد خدمات تطابق البحث'
                  : selectedCategory === 'all'
                    ? 'لا توجد خدمات متاحة حالياً'
                    : 'لا توجد خدمات في هذه الفئة'
                }
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm 
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'تحقق من الفئات الأخرى أو أضف خدمات جديدة'
                }
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <Grid className="w-4 h-4" />
                  عرض جميع الخدمات
                </button>
              )}
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
                          {service.category === 'internal_delivery' && '🚚'}
                          {service.category === 'external_trips' && '🗺️'}
                          {service.category === 'home_maintenance' && '🔧'}
                          {!['internal_delivery', 'external_trips', 'home_maintenance'].includes(service.category || '') && '⚙️'}
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
                        <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                          {service.categoryName ?? ''}
                        </span>
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
                        to={`/book/${service.id}`}
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
      </div>
    </div>
  );
};

export default Categories;  