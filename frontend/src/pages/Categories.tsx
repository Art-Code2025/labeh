import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Plus } from 'lucide-react';
import { categoriesApi, Category } from '../services/servicesApi';
import { toast } from 'react-hot-toast';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API/Firebase
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const categoriesData = await categoriesApi.getAll();
        setCategories(categoriesData);
        
        console.log('✅ Categories data loaded:', categoriesData.length);
      } catch (error: any) {
        console.error('❌ Error loading categories data:', error);
        setError(error.message || 'فشل في تحميل البيانات');
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">جاري تحميل الفئات...</p>
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
              اختر الفئة التي تناسبك لاستكشاف الخدمات المتاحة
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="group p-8 sm:p-10 rounded-3xl transition-all duration-300 transform hover:scale-105 border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-2xl hover:border-cyan-300"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 bg-slate-100 text-slate-600 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-500 group-hover:text-white group-hover:shadow-lg">
                      <span className="text-3xl">{category.icon || '📦'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-cyan-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-slate-600 text-center leading-relaxed mb-6 line-clamp-3">
                      {category.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-full text-cyan-700 font-medium text-sm group-hover:from-cyan-500 group-hover:to-blue-500 group-hover:text-white transition-all duration-300">
                      <span>استكشف الخدمات</span>
                      <ArrowRight className="w-4 h-4 transform rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-8 sm:p-12 border border-cyan-200">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              لم تجد ما تبحث عنه؟
            </h3>
            <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
              تواصل معنا وسنساعدك في العثور على الخدمة المناسبة لاحتياجاتك
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
      </div>
    </div>
  );
};

export default Categories;  