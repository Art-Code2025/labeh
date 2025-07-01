import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Send,
  Loader2,
  Star,
  ChevronRight,
  Package,
  Shield,
  Award
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';

// تعريف نوع الخدمة
interface Service {
  id: string | number;
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
  customQuestions?: CustomQuestion[];
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

// تعريف نوع بيانات النموذج
interface BookingFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  serviceDetails: string;
  priority: 'normal' | 'urgent' | 'emergency';
  preferredTime: string;
  notes: string;
  // خصائص إضافية للفئات المختلفة
  deliveryLocation?: string;
  urgentDelivery?: string;
  startLocation?: string;
  destination?: string;
  destinationType?: string;
  appointmentTime?: string;
  returnTrip?: string;
  passengers?: string;
  issueDescription?: string;
  urgencyLevel?: string;
  customAnswers?: Record<string, any>;
}

const BookService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    serviceDetails: '',
    priority: 'normal',
    preferredTime: '',
    notes: '',
    customAnswers: {}
  });
  
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!id) return;
    
    const fetchService = async () => {
      try {
        setLoading(true);
        const servicesRef = collection(db, 'services');
        const snapshot = await getDocs(servicesRef);
        
        let foundService: Service | null = null;
        snapshot.forEach((doc: QueryDocumentSnapshot) => {
          if (doc.id === id) {
            const data = doc.data() as Omit<Service, 'id'>;
            foundService = { id: doc.id, ...data };
          }
        });

        if (foundService) {
          setService(foundService);
          console.log('🔎 list.length بعد query category', snapshot.size);
          console.log('🔁 list.length بعد query categoryId', snapshot.size);
        } else {
          toast.error('الخدمة غير موجودة');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('حدث خطأ أثناء تحميل الخدمة');
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
      'external_trips': '2-4 ساعات',
      'home_maintenance': 'حسب نوع الصيانة'
    };
    return durations[categoryId] || 'يحدد عند الطلب';
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof BookingFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Partial<BookingFormData> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        errors.fullName = 'الاسم الكامل مطلوب';
      }

      if (!formData.phoneNumber.trim()) {
        errors.phoneNumber = 'رقم الهاتف مطلوب';
      } else if (!/^(05|5)[0-9]{8}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
        errors.phoneNumber = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05)';
      }

      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'البريد الإلكتروني غير صحيح';
      }
    }

    if (step === 2) {
      if (!formData.address.trim()) {
        errors.address = 'العنوان مطلوب';
      }

      if (!formData.city.trim()) {
        errors.city = 'المدينة مطلوبة';
      }
    }

    if (step === 3) {
      if (!formData.serviceDetails.trim()) {
        errors.serviceDetails = 'وصف الخدمة المطلوبة مطلوب';
      }

      // تحقق من الأسئلة المخصصة
      if (service && service.customQuestions) {
        service.customQuestions.forEach(q => {
          if (q.required) {
            const ans = formData.customAnswers?.[q.id];
            if (!ans || (Array.isArray(ans) && ans.length === 0)) {
              (errors as any)[`custom_${q.id}`] = 'مطلوب';
            }
          }
        });
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('يرجى تصحيح الأخطاء في النموذج');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service) return;
    
    try {
      setSubmitting(true);
      
      // إعداد بيانات الحجز مع معلومات الأسئلة المخصصة
      const customAnswersWithQuestions: Record<string, { question: string; answer: any; type: string }> = {};
      
      if (service && service.customQuestions) {
        service.customQuestions.forEach((q) => {
          const answer = formData.customAnswers?.[q.id];
          if (answer !== undefined && answer !== '') {
            customAnswersWithQuestions[q.id] = {
              question: q.question,
              answer: answer,
              type: q.type
            };
          }
        });
      }
      
      // استخدام bookingsApi الجديد
      const { createBooking } = await import('../services/bookingsApi');
      
      const bookingData = {
        serviceId: service.id.toString(),
        serviceName: service.name,
        serviceCategory: service.category,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        serviceDetails: formData.serviceDetails,
        // إضافة بيانات خاصة بالفئة
        ...(service.category === 'internal_delivery' && {
          deliveryLocation: formData.deliveryLocation,
          urgentDelivery: formData.urgentDelivery === 'true'
        }),
        ...(service.category === 'external_trips' && {
          startLocation: formData.startLocation,
          destination: formData.destination,
          destinationType: formData.destinationType,
          appointmentTime: formData.appointmentTime,
          returnTrip: formData.returnTrip === 'true',
          passengers: parseInt(formData.passengers || '1') || 1
        }),
        ...(service.category === 'home_maintenance' && {
          issueDescription: formData.issueDescription,
          urgencyLevel: formData.urgencyLevel,
          preferredTime: formData.preferredTime
        }),
        // إجابات الأسئلة المخصَّصة (لجميع الفئات إن وُجدت)
        customAnswers: formData.customAnswers, // الإجابات القديمة للتوافق
        customAnswersWithQuestions: customAnswersWithQuestions // الإجابات مع معلومات الأسئلة
      };

      const result = await createBooking(bookingData);
      
      toast.success('تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً.');
      navigate('/');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error('فشل في إرسال طلب الحجز. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const getImageSrc = (image: string) => {
    return image;
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return { label: 'عاجل', color: 'text-orange-400' };
      case 'emergency': return { label: 'طارئ', color: 'text-red-400' };
      default: return { label: 'عادي', color: 'text-green-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg mb-6">{error || 'الخدمة غير موجودة'}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/services')}
              className="btn-secondary-modern flex-1"
            >
              العودة للخدمات
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary-modern flex-1"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient" dir="rtl">
      {/* Header */}
      <section className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-gray-300 mb-8 animate-slide-up">
            <Link to="/" className="hover:text-yellow transition-colors">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/services" className="hover:text-yellow transition-colors">الخدمات</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/service/${service.id}`} className="hover:text-yellow transition-colors">{service.name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-yellow">حجز الخدمة</span>
          </div>

          {/* Page Title */}
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              احجز خدمة: {service.name}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              املأ النموذج التالي وسنتواصل معك في أقرب وقت لتأكيد موعد الخدمة
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Service Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6">ملخص الخدمة</h3>
                
                {/* Service Image */}
                <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-gray-700">
                  {service.mainImage ? (
                    <img
                      src={getImageSrc(service.mainImage)}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <h4 className="text-lg font-bold text-white mb-2">{service.name}</h4>
                <p className="text-gray-300 text-sm mb-4">{service.detailsShortDescription}</p>

                {/* Service Details */}
                <div className="space-y-3 mb-6">
                  {service.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-yellow" />
                      <span className="text-sm">المدة: {service.duration}</span>
                    </div>
                  )}
                  {service.availability && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-yellow" />
                      <span className="text-sm">التوفر: {service.availability}</span>
                    </div>
                  )}
                  {service.price && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Award className="w-4 h-4 text-yellow" />
                      <span className="text-sm">السعر: {service.price}</span>
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <Shield className="w-4 h-4" />
                    ضمان الجودة 100%
                  </div>
                  <div className="flex items-center gap-2 text-blue-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    فريق محترف ومدرب
                  </div>
                  <div className="flex items-center gap-2 text-yellow text-sm">
                    <Star className="w-4 h-4" />
                    خدمة عملاء متميزة
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                  {[
                    { step: 1, title: 'المعلومات الشخصية', icon: User },
                    { step: 2, title: 'العنوان', icon: MapPin },
                    { step: 3, title: 'تفاصيل الخدمة', icon: FileText },
                    { step: 4, title: 'تأكيد الطلب', icon: CheckCircle }
                  ].map(({ step, title, icon: Icon }) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        currentStep >= step 
                          ? 'bg-yellow text-navy-primary' 
                          : 'bg-white bg-opacity-10 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm text-center ${
                        currentStep >= step ? 'text-yellow' : 'text-gray-400'
                      }`}>
                        {title}
                      </span>
                      {step < 4 && (
                        <div className={`hidden md:block w-full h-1 mt-4 ${
                          currentStep > step ? 'bg-yellow' : 'bg-white bg-opacity-10'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-slide-up">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">المعلومات الشخصية</h3>
                        <p className="text-gray-300">أدخل بياناتك الشخصية للتواصل معك</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">الاسم الكامل *</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow"
                            placeholder="أدخل اسمك الكامل"
                          />
                          {formErrors.fullName && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">رقم الهاتف *</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow"
                            placeholder="05xxxxxxxx"
                          />
                          {formErrors.phoneNumber && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.phoneNumber}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">البريد الإلكتروني</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow"
                          placeholder="your@email.com"
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Address */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-slide-up">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">معلومات العنوان</h3>
                        <p className="text-gray-300">أدخل عنوانك لتحديد موقع تقديم الخدمة</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">المدينة *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow"
                            placeholder="الرياض"
                          />
                          {formErrors.city && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">العنوان التفصيلي *</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow"
                            placeholder="الحي، الشارع، رقم المنزل"
                          />
                          {formErrors.address && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Service Details */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-slide-up">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">تفاصيل الخدمة</h3>
                        <p className="text-gray-300">أخبرنا بالتفصيل عن الخدمة التي تحتاجها</p>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">وصف الخدمة المطلوبة *</label>
                        <textarea
                          name="serviceDetails"
                          value={formData.serviceDetails}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow resize-none"
                          placeholder="اشرح بالتفصيل ما تحتاجه من الخدمة..."
                        />
                        {formErrors.serviceDetails && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.serviceDetails}</p>
                        )}
                      </div>

                      {/* الأسئلة المخصصة */}
                      {service?.customQuestions && service.customQuestions.length > 0 && (
                        <div className="space-y-6">
                          <h4 className="text-lg font-semibold text-white">أسئلة إضافية</h4>
                          {service.customQuestions.map((q) => (
                            <div key={q.id} className="space-y-2">
                              <label className="block text-sm font-medium text-white">
                                {q.question} {q.required && <span className="text-red-400">*</span>}
                              </label>

                              {q.type === 'text' && (
                                <input
                                  type="text"
                                  value={formData.customAnswers?.[q.id] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    customAnswers: { ...(prev.customAnswers || {}), [q.id]: e.target.value }
                                  }))}
                                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow"
                                  placeholder={q.placeholder || ''}
                                  required={q.required}
                                />
                              )}

                              {q.type === 'number' && (
                                <input
                                  type="number"
                                  value={formData.customAnswers?.[q.id] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    customAnswers: { ...(prev.customAnswers || {}), [q.id]: e.target.value }
                                  }))}
                                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow"
                                  placeholder={q.placeholder || ''}
                                  required={q.required}
                                />
                              )}

                              {q.type === 'select_single' && q.options && (
                                <select
                                  value={formData.customAnswers?.[q.id] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    customAnswers: { ...(prev.customAnswers || {}), [q.id]: e.target.value }
                                  }))}
                                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow"
                                  required={q.required}
                                >
                                  <option value="">اختر خياراً</option>
                                  {q.options.map((opt, idx) => (
                                    <option key={idx} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}

                              {q.type === 'select_multiple' && q.options && (
                                <div className="space-y-2">
                                  {q.options.map((opt, idx) => (
                                    <label key={idx} className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={(formData.customAnswers?.[q.id] || []).includes(opt)}
                                        onChange={(e) => {
                                          const current = formData.customAnswers?.[q.id] || [];
                                          const newArr = e.target.checked ? [...current, opt] : current.filter((o: string) => o !== opt);
                                          setFormData(prev => ({
                                            ...prev,
                                            customAnswers: { ...(prev.customAnswers || {}), [q.id]: newArr }
                                          }));
                                        }}
                                        className="w-4 h-4 text-yellow bg-white/10 border-white/20 rounded"
                                      />
                                      <span className="text-white">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {q.type === 'date' && (
                                <input
                                  type="date"
                                  value={formData.customAnswers?.[q.id] || ''}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    customAnswers: { ...(prev.customAnswers || {}), [q.id]: e.target.value }
                                  }))}
                                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow"
                                  required={q.required}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">أولوية الخدمة</label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow"
                          >
                            <option value="normal" className="bg-navy-primary">عادي</option>
                            <option value="urgent" className="bg-navy-primary">عاجل</option>
                            <option value="emergency" className="bg-navy-primary">طارئ</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-white text-sm font-semibold mb-2">الوقت المفضل</label>
                          <input
                            type="datetime-local"
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-semibold mb-2">ملاحظات إضافية</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow resize-none"
                          placeholder="أي ملاحظات أو طلبات خاصة..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Confirmation */}
                  {currentStep === 4 && (
                    <div className="text-center animate-slide-up">
                      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h3>
                      <p className="text-gray-300 mb-8 max-w-md mx-auto">
                        شكراً لك على ثقتك بنا. سيتواصل معك فريقنا خلال 24 ساعة لتأكيد موعد الخدمة.
                      </p>

                      {/* Booking Summary */}
                      <div className="glass-card p-6 mb-8 text-right">
                        <h4 className="text-lg font-bold text-white mb-4">ملخص طلبك</h4>
                        <div className="space-y-2 text-gray-300">
                          <div className="flex justify-between">
                            <span>الخدمة:</span>
                            <span className="text-white">{service.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الاسم:</span>
                            <span className="text-white">{formData.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الهاتف:</span>
                            <span className="text-white">{formData.phoneNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>المدينة:</span>
                            <span className="text-white">{formData.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الأولوية:</span>
                            <span className={getPriorityLabel(formData.priority).color}>
                              {getPriorityLabel(formData.priority).label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 justify-center">
                        <Link to="/services" className="btn-secondary-modern">
                          تصفح خدمات أخرى
                        </Link>
                        <Link to="/" className="btn-primary-modern">
                          العودة للرئيسية
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  {currentStep < 4 && (
                    <div className="flex justify-between pt-8">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        disabled={currentStep === 1}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          currentStep === 1
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                        }`}
                      >
                        السابق
                      </button>

                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="btn-primary-modern"
                        >
                          التالي
                          <ArrowRight className="w-5 h-5 mr-2" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={submitting}
                          className="btn-primary-modern"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin ml-2" />
                              جاري الإرسال...
                            </>
                          ) : (
                            <>
                              إرسال الطلب
                              <Send className="w-5 h-5 mr-2" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default BookService; 