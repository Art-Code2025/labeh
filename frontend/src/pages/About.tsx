import React, { useState } from 'react';
import aboutImage from '../assets/about.png';
import managerImage from '../assets/manger.png';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Target, 
  Heart, 
  Users, 
  Lightbulb, 
  Shield, 
  Award, 
  Clock,
  CheckCircle,
  Star,
  ArrowLeft,
  ArrowRight,
  Truck,
  MapPin,
  Settings
} from 'lucide-react';

// 1) واجهة نوع السؤال والجواب
interface FAQItem {
  question: string;
  answer: string;
}

// 2) مكون الأسئلة الشائعة المحسن للغة العربية
function FAQ({ questions }: { questions: FAQItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number): void => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {questions.map((item: FAQItem, index: number) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden border-r-4 border-green-600"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <button
            className="w-full p-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
            onClick={() => toggleQuestion(index)}
            aria-expanded={activeIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50 border border-green-200">
              <svg 
                className={`w-4 h-4 text-green-600 transition-transform duration-300 ${
                  activeIndex === index ? 'transform rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </div>
            <span className="text-lg font-medium text-gray-800 text-right">{item.question}</span>
          </button>
          <div
            id={`faq-answer-${index}`}
            className={`p-5 bg-gray-50 transition-all duration-300 border-t border-gray-100 ${
              activeIndex === index ? 'block' : 'hidden'
            }`}
          >
            <p className="text-gray-700 whitespace-pre-line text-right pr-8">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const About: React.FC = () => {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">مشروع "لبيه"</h1>
          <p className="text-xl text-blue-100 mb-6">لبيه لطلبك بأي طريقة</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <Calendar className="w-5 h-5" />
            <span>تأسس عام 2015م</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Project Overview */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">نظرة عامة عن المشروع</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">بداية مشروع "لبيه"</h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                بدأ المشروع فعلياً عام 2015م بتأسيس متجر إلكتروني لتسجيل الطلبات بأسرع وأبسط الطرق التقنية الحديثة، 
                وكانت بداية خدماتنا تشمل نطاقاً حديثاً لطرق توصيل متنوعة وسهلة من خلال الجدولة الإلكترونية.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                تأسيس مشروع "لبيه" باسم حياة عام 2015م مع خطة تسجيل حياة كنطاق شامل، 
                والهدف تسهيل حياة الناس بخدمة سريعة وفعالة.
              </p>
              <div className="flex items-center gap-3 text-blue-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">نسعى لتوسيع خدماتنا، نقدم تجارب حديثة وفعالة تواكب متطلبات السوق</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <h4 className="text-xl font-bold text-white mb-6">خدماتنا الأساسية</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Truck className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">التوصيل والمشاوير الداخلية</h5>
                    <p className="text-gray-400 text-sm">خدمات التوصيل والمشاوير داخل المدينة</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <MapPin className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">المشاوير الخارجية</h5>
                    <p className="text-gray-400 text-sm">الرحلات والمشاوير بين المدن</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Settings className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-white">الصيانة المنزلية</h5>
                    <p className="text-gray-400 text-sm">خدمات الصيانة والإصلاح المنزلي</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-12 text-center border border-blue-500/20">
            <Target className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-6">رؤيتنا المستقبلية</h3>
            <blockquote className="text-xl text-gray-200 leading-relaxed italic mb-6">
              "نحن نهدف لتسهيل الحياة للناس بجعل الخدمات أكثر سلاسة"
            </blockquote>
            <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
              من خلال تقديم خدمات إلكترونية حديثة تسهّل على المستخدم الوصول للطلبات بأسلوب مريح وموثوق، 
              وتوفير كل ما يلزم لبناء علاقة مميزة مع عملائنا.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">قيمنا ومبادئنا</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* الأمانة */}
            <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">الأمانة</h3>
              <p className="text-gray-300 leading-relaxed">
                نحرص على تقديم خدماتنا بصدق وشفافية مطلقة.
              </p>
            </div>

            {/* الاحترافية */}
            <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">الاحترافية</h3>
              <p className="text-gray-300 leading-relaxed">
                نقدم خدماتنا باحترافية ومهارة عالية من خلال كوادر مدربة وتعمل لإرضاء العملاء.
              </p>
            </div>

            {/* الابتكار */}
            <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">الابتكار</h3>
              <p className="text-gray-300 leading-relaxed">
                نحرص دائماً على إيجاد طرق جديدة لتطوير خدماتنا وتحسين تجربة العميل، 
                ونسعى لتقديم أحدث الخدمات التقنية.
              </p>
            </div>

            {/* خدمة العميل */}
            <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">خدمة العميل</h3>
              <p className="text-gray-300 leading-relaxed">
                العميل هو محور اهتمامنا، نسعى دائماً لتقديم أفضل تجربة من خلال المنصات الإلكترونية.
              </p>
          </div>
        </div>
      </section>

        {/* Future Vision Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">نظرة مستقبلية</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>

          <div className="bg-gray-800 rounded-3xl p-12 border border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">سائقو التوصيل</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  هم الواجهة التي تمثلنا في المشاريع، حيث يقومون بتوصيل الطلبات بأمان وسرعة 
                  ويُقيّمون بشكل دوري لضمان تقديم أفضل خدمة ممكنة.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">تدريب مستمر ومتطور</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">تقييم دوري للأداء</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">ضمان الأمان والسرعة</span>
                  </div>
                </div>
        </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/20">
                <div className="text-center">
                  <Users className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                  <h4 className="text-xl font-bold text-white mb-4">فريق عمل محترف</h4>
                  <p className="text-gray-300 leading-relaxed">
                    نحرص على اختيار أفضل الكوادر وتدريبهم باستمرار لضمان تقديم خدمة متميزة تليق بعملائنا الكرام.
              </p>
                </div>
            </div>
          </div>
        </div>
      </section>

        {/* Timeline Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">رحلتنا عبر الزمن</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
          </div>

          <div className="relative">
            <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <div className="space-y-12">
              <div className="relative flex items-center gap-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg relative z-10">
                  2015
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 flex-1 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-3">البداية الرسمية</h3>
                  <p className="text-gray-300 leading-relaxed">
                    تأسيس مشروع "لبيه" باسم حياة عام 2015م مع خطة تسجيل حياة كنطاق شامل، 
                    والهدف تسهيل حياة الناس بخدمة سريعة وفعالة.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold relative z-10">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 flex-1 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-3">التطوير التقني</h3>
                  <p className="text-gray-300 leading-relaxed">
                    بدأ المشروع فعلياً بتأسيس متجر إلكتروني لتسجيل الطلبات بأسرع وأبسط الطرق التقنية الحديثة، 
                    وكانت بداية خدماتنا تشمل نطاقاً حديثاً لطرق توصيل متنوعة وسهلة.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-8">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold relative z-10">
                  <Target className="w-8 h-8" />
                </div>
                <div className="bg-gray-800 rounded-2xl p-6 flex-1 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-3">التوسع والنمو</h3>
                  <p className="text-gray-300 leading-relaxed">
                    نسعى لتوسيع خدماتنا، نقدم تجارب حديثة وفعالة تواكب متطلبات السوق، 
                    مع التركيز على تقديم أفضل تجربة للعملاء من خلال المنصات الإلكترونية.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">إنجازاتنا بالأرقام</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">9+</div>
                <div className="text-blue-100">سنوات من الخبرة</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">1000+</div>
                <div className="text-blue-100">عميل راضٍ</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100">خدمة متواصلة</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="text-4xl font-bold text-white mb-2">4.8</div>
                <div className="text-blue-100 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-current" />
                  تقييم العملاء
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gray-800 rounded-3xl p-12 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-6">انضم إلى رحلتنا</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              نهايةً، نحن نؤمن بأن النجاح يأتي من خلال تقديم خدمة متميزة تفوق توقعات عملائنا. 
              انضم إلينا واكتشف الفرق في جودة الخدمة.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
              >
                استكشف خدماتنا
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                تواصل معنا
                <ArrowRight className="w-5 h-5" />
              </Link>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default About;