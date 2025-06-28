import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, CheckCircle, Package, Truck, Wrench, User, Phone, Home, MessageSquare, Calendar, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Service {
  id: string; // تغيير من number إلى string
  name: string;
  category: string;
  categoryName: string;
  description: string;
  mainImage: string;
  detailedImages: string[];
  features: string[];
  duration: string;
  availability: string;
  price: string;
  homeShortDescription: string;
}

// خيارات مخصصة لكل فئة
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

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: '',
    // خيارات مخصصة حسب الفئة
    selectedOption: '',
    selectedDestination: '',
    startLocation: '',
    appointmentTime: '',
    urgentDelivery: false,
    returnTrip: false,
    passengers: 1,
    urgencyLevel: 'medium',
    preferredTime: 'morning'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  const fetchService = async () => {
      if (!id) return;
      
    try {
      setLoading(true);
        
        // جلب الخدمة من Firebase مباشرة
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
        
        // البحث عن الخدمة بـ ID
        const servicesRef = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesRef);
        let foundService: Service | null = null;
        
        servicesSnapshot.forEach((doc) => {
          if (doc.id === id) {
            const serviceData = doc.data();
            foundService = {
              id: doc.id,
              name: serviceData.name || '',
              category: serviceData.categoryId || serviceData.category || '',
              categoryName: serviceData.categoryName || '',
              description: serviceData.description || serviceData.homeShortDescription || getDetailedDescription(serviceData.categoryId || serviceData.category || ''),
              mainImage: serviceData.mainImage || getDefaultImage(serviceData.categoryId || serviceData.category || ''),
              detailedImages: serviceData.detailedImages || [],
              features: serviceData.features || getDefaultFeatures(serviceData.categoryId || serviceData.category || ''),
              duration: serviceData.duration || getDefaultDuration(serviceData.categoryId || serviceData.category || ''),
              availability: serviceData.availability || "متاح 24/7",
              price: serviceData.price || serviceData.pricing || getDefaultPrice(serviceData.categoryId || serviceData.category || ''),
              homeShortDescription: serviceData.homeShortDescription || ''
            };
          }
        });

        if (foundService) {
          setService(foundService);
        } else {
          setError('الخدمة غير موجودة');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        setError('فشل في تحميل الخدمة');
    } finally {
      setLoading(false);
    }
  };

    fetchService();
  }, [id]);

  // Helper functions
  function getDefaultImage(categoryId: string) {
    const images: Record<string, string> = {
      'internal_delivery': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=500',
      'external_trips': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500',
      'home_maintenance': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=500'
    };
    return images[categoryId] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500';
  }

  function getDefaultPrice(categoryId: string) {
    const prices: Record<string, string> = {
      'internal_delivery': 'من 20 ريال',
      'external_trips': 'من 250 ريال',
      'home_maintenance': 'حسب الخدمة'
    };
    return prices[categoryId] || 'حسب الطلب';
  }

  function getDefaultDuration(categoryId: string) {
    const durations: Record<string, string> = {
      'internal_delivery': '30-60 دقيقة',
      'external_trips': '2-8 ساعات',
      'home_maintenance': '1-4 ساعات'
    };
    return durations[categoryId] || '1-2 ساعة';
  }

  function getDefaultFeatures(categoryId: string) {
    const features: Record<string, string[]> = {
      'internal_delivery': ['توصيل سريع خلال ساعة', 'خدمة 24/7', 'تتبع الطلب مباشر', 'ضمان الأمان'],
      'external_trips': ['سائقين محترفين', 'سيارات حديثة ومريحة', 'أسعار تنافسية', 'رحلات آمنة'],
      'home_maintenance': ['فنيين معتمدين', 'ضمان على الخدمة', 'قطع غيار أصلية', 'خدمة طوارئ']
    };
    return features[categoryId] || ['خدمة عالية الجودة', 'أسعار مناسبة', 'ضمان الرضا'];
  }

  function getDetailedDescription(categoryId: string) {
    const descriptions: Record<string, string> = {
      'internal_delivery': 'خدمات التوصيل السريعة داخل المدينة مع ضمان الوصول في الوقت المحدد. نوفر خدمات توصيل البقالة، الأدوية، والوثائق بأمان تام.',
      'external_trips': 'رحلات آمنة ومريحة للمسافات البعيدة مع سائقين محترفين. نغطي جميع المحافظات مع إمكانية الحجز المسبق والرحلات العاجلة.',
      'home_maintenance': 'خدمات صيانة شاملة للمنازل والمكاتب مع فنيين متخصصين. نقدم خدمات السباكة، الكهرباء، التكييف، والدهانات بضمان الجودة.'
    };
    return descriptions[categoryId] || 'خدمة متميزة بجودة عالية';
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;
    
    // التحقق من البيانات المطلوبة
    if (!formData.fullName || !formData.phoneNumber || !formData.address) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      
      // إعداد بيانات الحجز
      const bookingData = {
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        serviceDetails: formData.serviceDetails,
        status: 'pending',
        createdAt: new Date().toISOString(),
        // بيانات مخصصة حسب الفئة
        ...(service.category === 'internal_delivery' && {
          selectedOption: formData.selectedOption,
          urgentDelivery: formData.urgentDelivery
        }),
        ...(service.category === 'external_trips' && {
          selectedOption: formData.selectedOption,
          selectedDestination: formData.selectedDestination,
          startLocation: formData.startLocation,
          appointmentTime: formData.appointmentTime,
          returnTrip: formData.returnTrip,
          passengers: formData.passengers
        }),
        ...(service.category === 'home_maintenance' && {
          selectedOption: formData.selectedOption,
          urgencyLevel: formData.urgencyLevel,
          preferredTime: formData.preferredTime
        })
      };

      // إرسال البيانات إلى Firebase
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, addDoc } = await import('firebase/firestore');
      
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
      
      await addDoc(collection(db, 'bookings'), bookingData);
      
      toast.success('تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً');
      setShowBookingForm(false);
      
      // إعادة تعيين النموذج
      setFormData({
        fullName: '',
        phoneNumber: '',
        address: '',
        serviceDetails: '',
        selectedOption: '',
        selectedDestination: '',
        startLocation: '',
        appointmentTime: '',
        urgentDelivery: false,
        returnTrip: false,
        passengers: 1,
        urgencyLevel: 'medium',
        preferredTime: 'morning'
      });
      
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('فشل في إرسال طلب الحجز. حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'internal_delivery': return <Truck className="w-6 h-6" />;
      case 'external_trips': return <MapPin className="w-6 h-6" />;
      case 'home_maintenance': return <Wrench className="w-6 h-6" />;
      default: return <Package className="w-6 h-6" />;
    }
  };

  const getCategoryOptions = () => {
    if (!service) return null;
    return categoryOptions[service.category as keyof typeof categoryOptions];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">جاري تحميل تفاصيل الخدمة</h3>
          <p className="text-gray-600">يرجى الانتظار قليلاً...</p>
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
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للخدمات
          </Link>
        </div>
      </div>
    );
  }

  if (!service) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-transparent"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl"></div>
            </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-medium transition-all duration-300 border border-white/20"
            >
              <ArrowRight className="w-4 h-4" />
              العودة للخدمات
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Service Info */}
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  {getCategoryIcon(service.category)}
                </div>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                  {service.categoryName || categoryOptions[service.category as keyof typeof categoryOptions]?.name}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {service.name}
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {service.description}
              </p>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">المدة</p>
                    <p className="font-semibold">{service.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">السعر</p>
                    <p className="font-semibold">{service.price}</p>
        </div>
      </div>

                <div className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">التوفر</p>
                    <p className="font-semibold">{service.availability}</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowBookingForm(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <Calendar className="w-6 h-6 group-hover:scale-110 transition-transform" />
                احجز الخدمة الآن
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>

            {/* Service Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src={service.mainImage}
                  alt={service.name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">متاح الآن</p>
                    <p className="text-lg font-bold text-gray-800">خدمة فورية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">مميزات الخدمة</h2>
            <p className="text-xl text-gray-600">نقدم لك أفضل خدمة بأعلى معايير الجودة</p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {service.features.map((feature, index) => (
                    <div
                      key={index}
                className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature}</h3>
                    <p className="text-gray-600">ميزة متقدمة تضمن لك أفضل تجربة خدمة</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">احجز خدمة: {service.name}</h2>
                <p className="text-gray-600">املأ البيانات التالية لإتمام الحجز</p>
              </div>
              <button
                onClick={() => setShowBookingForm(false)}
                className="text-gray-400 hover:text-gray-600 p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-8">
              {/* البيانات الأساسية */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  البيانات الشخصية
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      الاسم الكريم *
                    </label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
                        placeholder="أدخل اسمك الكامل"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      رقم الجوال *
                    </label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    العنوان بالتفصيل *
                  </label>
                  <div className="relative">
                    <Home className="absolute right-3 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
                      placeholder="أدخل عنوانك بالتفصيل (الحي، الشارع، رقم المبنى)"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* خيارات مخصصة حسب الفئة */}
              {getCategoryOptions() && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                      {getCategoryIcon(service.category)}
                    </div>
                    تفاصيل الخدمة
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        نوع الخدمة المطلوبة
                      </label>
                      <select
                        name="selectedOption"
                        value={formData.selectedOption}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                      >
                        <option value="">اختر نوع الخدمة</option>
                        {getCategoryOptions()?.options.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
          </div>

                    {/* خيارات خاصة بالتوصيل الداخلي */}
                    {service.category === 'internal_delivery' && (
                      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="urgentDelivery"
                            name="urgentDelivery"
                            checked={formData.urgentDelivery}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="urgentDelivery" className="text-gray-700 font-medium">
                            توصيل عاجل (+10 ريال)
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 mr-8">
                          سيتم التوصيل خلال 30 دقيقة كحد أقصى
                        </p>
                  </div>
                )}

                    {/* خيارات خاصة بالمشاوير الخارجية */}
                    {service.category === 'external_trips' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              نقطة الانطلاق
                            </label>
                            <div className="relative">
                              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="text"
                                name="startLocation"
                                value={formData.startLocation}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 shadow-sm"
                                placeholder="من أين تريد الانطلاق؟"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              الوجهة
                            </label>
                            <select
                              name="selectedDestination"
                              value={formData.selectedDestination}
                              onChange={handleInputChange}
                              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                            >
                              <option value="">اختر الوجهة</option>
                              {service.category === 'external_trips' && 'destinations' in categoryOptions.external_trips && 
                                Object.entries(categoryOptions.external_trips.destinations).map(([dest, info]) => (
                                  <option key={dest} value={dest}>{dest} - {info.price}</option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              وقت الموعد المفضل
                            </label>
                            <div className="relative">
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="datetime-local"
                                name="appointmentTime"
                                value={formData.appointmentTime}
                                onChange={handleInputChange}
                                className="w-full pr-12 pl-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              عدد المسافرين
                            </label>
                            <input
                              type="number"
                              name="passengers"
                              value={formData.passengers}
                              onChange={handleInputChange}
                              min="1"
                              max="8"
                              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="returnTrip"
                              name="returnTrip"
                              checked={formData.returnTrip}
                              onChange={handleInputChange}
                              className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="returnTrip" className="text-gray-700 font-medium">
                              رحلة ذهاب وإياب
                            </label>
                          </div>
                          <p className="text-sm text-gray-500 mt-2 mr-8">
                            سيتم انتظارك في الوجهة والعودة معك
                          </p>
                        </div>
                  </div>
                )}

                    {/* خيارات خاصة بالصيانة المنزلية */}
                    {service.category === 'home_maintenance' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              مستوى الأولوية
                            </label>
                            <select
                              name="urgencyLevel"
                              value={formData.urgencyLevel}
                              onChange={handleInputChange}
                              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                            >
                              <option value="normal">عادي</option>
                              <option value="medium">متوسط</option>
                              <option value="urgent">عاجل</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              الوقت المفضل
                            </label>
                            <select
                              name="preferredTime"
                              value={formData.preferredTime}
                              onChange={handleInputChange}
                              className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                            >
                              <option value="morning">صباحاً (8 ص - 12 م)</option>
                              <option value="afternoon">بعد الظهر (12 م - 6 م)</option>
                              <option value="evening">مساءً (6 م - 10 م)</option>
                            </select>
                          </div>
                        </div>
                  </div>
                )}
              </div>
                </div>
              )}

              {/* تفاصيل إضافية */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                </div>
                  تفاصيل إضافية
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ملاحظات خاصة (اختياري)
                  </label>
                  <textarea
                    name="serviceDetails"
                    value={formData.serviceDetails}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 placeholder-gray-400 resize-none shadow-sm"
                    placeholder="أي تفاصيل إضافية تود إضافتها..."
                  />
        </div>
      </div>

              {/* أزرار التحكم */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </div>
                  ) : (
                    'تأكيد الحجز'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Options Section */}
      {getCategoryOptions() && (
        <div className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">خيارات الخدمة المتاحة</h2>
              <p className="text-xl text-gray-600">اختر من بين مجموعة متنوعة من الخيارات</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getCategoryOptions()?.options.map((option, index) => (
                <div
                  key={index}
                  className="group p-6 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-2xl border border-gray-200 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                      {getCategoryIcon(service.category)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{option}</h3>
                  </div>
                  <p className="text-gray-600">خدمة متخصصة ومهنية بأعلى معايير الجودة</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">متاح الآن</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}