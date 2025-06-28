import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, Filter, Grid, List, Package, Truck, Wrench, MapPin, Settings } from 'lucide-react';
import { categoriesApi, servicesApi, Category, Service } from '../services/servicesApi';
import { toast } from 'react-hot-toast';

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
        setServices(servicesData);
        
        console.log('✅ Categories data loaded:', { 
          categories: categoriesData.length, 
          services: servicesData.length 
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
    <div dir="rtl" className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">فئات الخدمات</h1>
          <p className="text-xl text-blue-100">اكتشف جميع خدماتنا المتنوعة</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">الفئات المتاحة</h2>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">لا توجد فئات متاحة حالياً</p>
              <Link 
                to="/dashboard"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors inline-block"
              >
                إضافة فئات جديدة
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-right ${
                    selectedCategory === category.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-cyan-100 text-cyan-600">
                      {category.icon || '📦'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {services.filter(s => s.category === category.id).length} خدمة متاحة
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                جميع الخدمات
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث في الخدمات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-100 border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-500'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-500'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services Display */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' 
                ? `جميع الخدمات (${filteredServices.length})`
                : `${categories.find(c => c.id === selectedCategory)?.name} (${filteredServices.length})`
              }
            </h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                {searchTerm 
                  ? 'لا توجد خدمات تطابق البحث'
                  : selectedCategory === 'all'
                    ? 'لا توجد خدمات متاحة حالياً'
                    : 'لا توجد خدمات في هذه الفئة'
                }
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  عرض جميع الخدمات
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              : 'space-y-6'
            }>
              {filteredServices.map((service) => (
                <div key={service.id} className={`bg-white border border-gray-200 rounded-2xl p-6 hover:bg-gray-50 transition-all duration-300 ${
                  viewMode === 'list' ? 'flex gap-6' : ''
                }`}>
                  <div className={`relative rounded-xl overflow-hidden bg-gray-100 ${
                    viewMode === 'list' ? 'w-48 h-32 flex-shrink-0' : 'h-48 mb-6'
                  }`}>
                    {service.mainImage ? (
                      <img
                        src={getImageSrc(service.mainImage ?? '')}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">
                          {service.category === 'internal_delivery' && '🚚'}
                          {service.category === 'external_trips' && '🗺️'}
                          {service.category === 'home_maintenance' && '🔧'}
                          {!['internal_delivery', 'external_trips', 'home_maintenance'].includes(service.category || '') && '⚙️'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{service.homeShortDescription ?? ''}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-cyan-700 bg-cyan-100 px-3 py-1 rounded-full">
                        {service.categoryName ?? ''}
                      </span>
                      {service.price && (
                        <span className="text-yellow-400 font-bold">
                          {service.price}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <Link
                        to={`/services/${service.id}`}
                        className="flex-1 text-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                      >
                        عرض التفاصيل
                      </Link>
                      <Link
                        to={`/book/${service.id}`}
                        className="flex-1 text-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
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