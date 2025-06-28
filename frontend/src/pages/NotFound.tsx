import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowRight } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/404-illustration.svg" 
              alt="404 Error" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            عذراً، الصفحة غير موجودة
          </h1>
          
          <p className="text-lg text-slate-600 mb-8">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم نقلها أو حذفها أو أدخلت عنوان URL خاطئ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors duration-300"
            >
              <Home className="w-5 h-5" />
              <span>العودة للرئيسية</span>
            </Link>
            <Link 
              to="/categories"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-cyan-600 border-2 border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors duration-300"
            >
              <Search className="w-5 h-5" />
              <span>تصفح الخدمات</span>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">هل تحتاج إلى مساعدة؟</h2>
            <p className="text-slate-600 mb-4">
              إذا كنت تعتقد أن هناك مشكلة أو تحتاج إلى مساعدة، يمكنك التواصل مع فريق خدمة العملاء.
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 transition-colors duration-300"
            >
              <span>تواصل معنا</span>
              <ArrowRight className="w-5 h-5 transform -rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 