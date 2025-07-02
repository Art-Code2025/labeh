import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin, CheckCircle, Package, Truck, Wrench, User, Phone, Home, MessageSquare, Calendar, AlertCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '../firebase.config';
import BookingModal from '../components/BookingModal';

interface Service {
  id: string;
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
  customQuestions?: Array<{
    id: string;
    question: string;
    type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }>;
}

interface TripDetails {
  destination: string;
  price: string;
  duration: string;
  startLocation: string;
  endLocation: string;
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
  const [priceOptions, setPriceOptions] = useState<Array<{ name: string; price: string }>>([]);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: '',
    // خيارات مخصصة حسب الفئة
    selectedOption: '',
    selectedDestination: '',
    startLocation: '',
    endLocation: '',
    appointmentTime: '',
    urgentDelivery: false,
    returnTrip: false,
    passengers: 1,
    urgencyLevel: 'medium',
    preferredTime: 'morning',
    customAnswers: {} as Record<string, any>,
    tripDetails: {
      destination: '',
      price: '',
      duration: '',
      startLocation: '',
      endLocation: ''
    } as TripDetails
  });
  const [submitting, setSubmitting] = useState(false);
  const [showQuickBookingServices, setShowQuickBookingServices] = useState(false);
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string>('');
  const [quickCategoryServices, setQuickCategoryServices] = useState<Service[]>([]);
  const [loadingQuickServices, setLoadingQuickServices] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // جلب الخدمة من Firebase مباشرة
        const { collection, getDocs } = await import('firebase/firestore');
        
        // البحث عن الخدمة بـ ID
        const servicesRef = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesRef);
        
        const serviceDoc = servicesSnapshot.docs.find(doc => doc.id === id);

        if (serviceDoc) {
          const serviceData = serviceDoc.data();
          const foundService: Service = {
            id: serviceDoc.id,
            name: serviceData.name || '',
            category: serviceData.categoryId || serviceData.category || '',
            categoryName: serviceData.categoryName || '',
            description: serviceData.description || serviceData.homeShortDescription || getDetailedDescription(serviceData.categoryId || serviceData.category || ''),
            mainImage: serviceData.mainImage || getDefaultImage(serviceData.categoryId || serviceData.category || ''),
            detailedImages: serviceData.detailedImages || [],
            features: serviceData.features || getDefaultFeatures(serviceData.categoryId || serviceData.category || ''),
            duration: serviceData.duration || serviceData.expectedDuration || "غير محدد",
            availability: serviceData.availability || "متاح 24/7",
            price: serviceData.price || serviceData.pricing || getDefaultPrice(serviceData.categoryId || serviceData.category || ''),
            homeShortDescription: serviceData.homeShortDescription || '',
            customQuestions: serviceData.customQuestions || []
          };
          
          // إضافة logging تفصيلي
          console.log('[ServiceDetail] 🎯 تم تحميل الخدمة:', {
            id: foundService.id,
            name: foundService.name,
            category: foundService.category,
            categoryName: foundService.categoryName,
            isExternalTrip: foundService.category === 'external_trips'
          });
          
          setService(foundService);

          const isComplexPrice = foundService.price && typeof foundService.price === 'string' && foundService.price.includes('|');
          console.log('[ServiceDetail] 💰 نوع السعر:', isComplexPrice ? 'أسعار متعددة' : 'سعر واحد', foundService.price);

          if (isComplexPrice) {
            const options = (foundService.price as string).split('|').map((item: string) => {
              const parts = item.trim().split(/(\s+)/);
              const price = parts.pop() || '';
              const name = parts.join('').trim();
              return { name, price: price.replace('ريال', '').trim() + ' ريال' };
            });
            setPriceOptions(options);
            console.log('[ServiceDetail] 📋 خيارات الأسعار:', options);
            if (options.length > 0) {
              setSelectedPrice(`${options[0].name} ${options[0].price}`);
              setFormData(prev => ({...prev, selectedDestination: options[0].name }));
            }
          } else if (foundService.price) {
            setSelectedPrice(foundService.price);
          }
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
    
    console.log('[ServiceDetail] 🚀 بدء عملية الحجز:', {
      serviceName: service.name,
      serviceCategory: service.category,
      formData: {
        selectedDestination: formData.selectedDestination,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation
      }
    });
    
    // التحقق من البيانات المطلوبة
    if (!formData.fullName || !formData.phoneNumber || !formData.address) {
      toast.error('يرجى ملء جميع البيانات المطلوبة (الاسم، الهاتف، العنوان)');
      return;
    }

    // التحقق من اختيار الوجهة للمشاوير الخارجية
    if (service.category === 'external_trips') {
      console.log('[ServiceDetail] ✅ التحقق من بيانات المشوار الخارجي...');
      
      if (!formData.selectedDestination) {
        console.log('[ServiceDetail] ❌ لم يتم اختيار الوجهة');
        toast.error('🎯 يرجى اختيار الوجهة أولاً (خميس مشيط أو أبها)');
        
        // التمرير إلى قسم اختيار الوجهة
        const destinationSection = document.querySelector('[data-section="destination-selection"]');
        if (destinationSection) {
          destinationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      
      if (!formData.startLocation || !formData.endLocation) {
        console.log('[ServiceDetail] ❌ لم يتم تحديد مواقع الرحلة');
        toast.error('📍 يرجى تحديد موقع الانطلاق ونقطة الوصول للمشوار الخارجي');
        return;
      }
      
      console.log('[ServiceDetail] ✅ جميع بيانات المشوار الخارجي مكتملة:', {
        destination: formData.selectedDestination,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        price: selectedPrice
      });
    }

    // التحقق من الأسئلة المخصصة الإجبارية
    if (service.customQuestions) {
      for (const question of service.customQuestions) {
        if (question.required) {
          const answer = formData.customAnswers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && answer.trim() === '')) {
            toast.error(`📝 يرجى الإجابة على السؤال: ${question.question}`);
            return;
          }
        }
      }
    }

    try {
      setSubmitting(true);
      console.log('[ServiceDetail] 📤 جاري إرسال البيانات...');
      
      // إعداد بيانات الحجز مع معلومات الأسئلة المخصصة
      const customAnswersWithQuestions: Record<string, { question: string; answer: any; type: string }> = {};
      
      if (service && service.customQuestions) {
        service.customQuestions.forEach((q) => {
          const answer = formData.customAnswers[q.id];
          if (answer !== undefined && answer !== '') {
            customAnswersWithQuestions[q.id] = {
              question: q.question,
              answer: answer,
              type: q.type
            };
          }
        });
      }
      
      // تجهيز بيانات الحجز بشكل مضمون
      const isExternalTrip = service.category === 'external_trips' || service.categoryName === 'مشاوير خارجية';
      // اجبار تعيين السعر والوجهة
      let bookingPrice = selectedPrice || service.price || (priceOptions.length > 0 ? `${priceOptions[0].name} ${priceOptions[0].price}` : 'غير محدد');
      let bookingDestination = formData.selectedDestination || (priceOptions.length > 0 ? priceOptions[0].name : 'غير محدد');
      let bookingStart = formData.startLocation || 'غير محدد';
      let bookingEnd = formData.endLocation || 'غير محدد';
      let bookingServiceName = service.name || 'غير محدد';

      const bookingData = {
        serviceId: service.id,
        serviceName: bookingServiceName,
        serviceCategory: service.category,
        serviceCategorySlug: service.category === 'external_trips' || service.category === 'internal_delivery' || service.category === 'home_maintenance' ? service.category : (service.categoryName === 'مشاوير خارجية' ? 'external_trips' : service.category),
        serviceCategoryName: service.categoryName || '',
        price: bookingPrice,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        serviceDetails: formData.serviceDetails,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customAnswers: formData.customAnswers,
        customAnswersWithQuestions: customAnswersWithQuestions,
        ...(service.category === 'internal_delivery' && {
          selectedOption: formData.selectedOption,
          urgentDelivery: formData.urgentDelivery
        }),
        ...(isExternalTrip && {
          selectedOption: formData.selectedOption,
          selectedDestination: bookingDestination,
          startLocation: bookingStart,
          endLocation: bookingEnd,
          appointmentTime: formData.appointmentTime,
          returnTrip: formData.returnTrip,
          passengers: formData.passengers,
          tripDetails: {
            destination: bookingDestination,
            price: bookingPrice,
            duration: '9 ساعات كحد أقصى',
            startLocation: bookingStart,
            endLocation: bookingEnd
          }
        }),
        ...(service.category === 'home_maintenance' && {
          selectedOption: formData.selectedOption,
          urgencyLevel: formData.urgencyLevel,
          preferredTime: formData.preferredTime
        }),
      };

      console.log('🔥 [ServiceDetail] البيانات اللي هتتبعت:', {
        serviceName: bookingServiceName,
        price: bookingPrice,
        isExternalTrip: isExternalTrip,
        selectedDestination: isExternalTrip ? bookingDestination : 'غير مطلوب',
        startLocation: isExternalTrip ? bookingStart : 'غير مطلوب',
        endLocation: isExternalTrip ? bookingEnd : 'غير مطلوب',
        fullBookingData: bookingData
      });

      // إرسال البيانات إلى Firebase
      const { collection, addDoc } = await import('firebase/firestore');
      
      const result = await addDoc(collection(db, 'bookings'), bookingData);
      console.log('✅ [ServiceDetail] تم الإرسال لـ Firebase بنجاح - ID:', result.id);
      console.log('📊 [ServiceDetail] البيانات المحفوظة:', bookingData);
      
      console.log('[ServiceDetail] ✅ تم إرسال الحجز بنجاح');
      toast.success('🎉 تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً');
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
        endLocation: '',
        appointmentTime: '',
        urgentDelivery: false,
        returnTrip: false,
        passengers: 1,
        urgencyLevel: 'medium',
        preferredTime: 'morning',
        customAnswers: {},
        tripDetails: {
          destination: '',
          price: '',
          duration: '',
          startLocation: '',
          endLocation: ''
        }
      });
      
    } catch (error) {
      console.error('[ServiceDetail] ❌ خطأ في إرسال الحجز:', error);
      toast.error('❌ فشل في إرسال طلب الحجز. حاول مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePriceSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    const option = priceOptions.find(o => o.name === selected);
    if(option) {
      setSelectedPrice(`${option.name} ${option.price}`);
      setFormData(prev => ({...prev, selectedDestination: option.name }));
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

  // إضافة وظائف الحجز السريع
  const handleQuickBookingByCategory = async (category: string) => {
    try {
      console.log('[ServiceDetail] 🔍 جاري البحث عن خدمات الفئة:', category);
      setSelectedQuickCategory(category);
      setLoadingQuickServices(true);
      
      // جلب الخدمات من Firebase
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const servicesRef = collection(db, 'services');
      
      // إنشاء استعلام للبحث عن الخدمات في نفس الفئة
      const servicesQuery = query(
        servicesRef,
        where('categoryId', '==', category)
      );
      
      const querySnapshot = await getDocs(servicesQuery);
      const categoryServices: Service[] = [];
      
      querySnapshot.forEach((doc) => {
        const serviceData = doc.data();
        const transformedService: Service = {
          id: doc.id,
          name: serviceData.name || '',
          category: serviceData.categoryId || serviceData.category || '',
          categoryName: serviceData.categoryName || '',
          description: serviceData.description || serviceData.homeShortDescription || '',
          mainImage: serviceData.mainImage || getDefaultImage(serviceData.categoryId || serviceData.category || ''),
          detailedImages: serviceData.detailedImages || [],
          features: serviceData.features || [],
          duration: serviceData.duration || serviceData.expectedDuration || "غير محدد",
          availability: serviceData.availability || "متاح 24/7",
          price: serviceData.price || serviceData.pricing || '',
          homeShortDescription: serviceData.homeShortDescription || '',
          customQuestions: serviceData.customQuestions || []
        };
        
        // لا نضيف الخدمة الحالية إلى القائمة
        if (doc.id !== service?.id) {
          categoryServices.push(transformedService);
        }
      });
      
      console.log('[ServiceDetail] 📦 تم العثور على', categoryServices.length, 'خدمة في الفئة');
      setQuickCategoryServices(categoryServices);
      setShowQuickBookingServices(true);
      
    } catch (error) {
      console.error('[ServiceDetail] ❌ خطأ في جلب الخدمات:', error);
      toast.error('حدث خطأ في تحميل الخدمات المشابهة');
    } finally {
      setLoadingQuickServices(false);
    }
  };

  // وظيفة اختيار خدمة من الحجز السريع
  const handleQuickServiceSelect = (selectedService: Service) => {
    try {
      console.log('[ServiceDetail] ✅ تم اختيار الخدمة:', selectedService.name);
      
      // تحديث الخدمة المعروضة وإعادة تعيين النموذج
      setService(selectedService);
      
      // تحديث خيارات السعر إذا كانت موجودة
      const isComplexPrice = selectedService.price && typeof selectedService.price === 'string' && selectedService.price.includes('|');
      if (isComplexPrice) {
        const options = (selectedService.price as string).split('|').map((item: string) => {
          const parts = item.trim().split(/(\s+)/);
          const price = parts.pop() || '';
          const name = parts.join('').trim();
          return { name, price: price.replace('ريال', '').trim() + ' ريال' };
        });
        setPriceOptions(options);
        if (options.length > 0) {
          setSelectedPrice(`${options[0].name} ${options[0].price}`);
          setFormData(prev => ({...prev, selectedDestination: options[0].name }));
        }
      } else if (selectedService.price) {
        setSelectedPrice(selectedService.price);
      }
      
      // إعادة تعيين النموذج مع الاحتفاظ بالبيانات الأساسية
      setFormData(prev => ({
        ...prev,
        selectedOption: '',
        selectedDestination: isComplexPrice && priceOptions.length > 0 ? priceOptions[0].name : '',
        startLocation: '',
        endLocation: '',
        appointmentTime: '',
        urgentDelivery: false,
        returnTrip: false,
        passengers: 1,
        urgencyLevel: 'medium',
        preferredTime: 'morning',
        customAnswers: {}
      }));
      
      // إخفاء قائمة الخدمات وإظهار فورم الحجز
      setShowQuickBookingServices(false);
      setShowBookingModal(true);
      
    } catch (error) {
      console.error('[ServiceDetail] ❌ خطأ في اختيار الخدمة:', error);
      toast.error('حدث خطأ في اختيار الخدمة');
    }
  };

  // إغلاق قائمة خدمات الحجز السريع
  const closeQuickBookingServices = () => {
    setShowQuickBookingServices(false);
    setSelectedQuickCategory('');
    setQuickCategoryServices([]);
  };

  // الحصول على اسم الفئة
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'internal_delivery': return 'التوصيل الداخلي';
      case 'external_trips': return 'المشاوير الخارجية';
      case 'home_maintenance': return 'الصيانة المنزلية';
      default: return 'خدمات متنوعة';
    }
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
    <div className="min-h-screen bg-gradient-to-b from-[#f0faff] to-[#e0f2fe]">
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-300"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للخدمات
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Service Image Section - First */}
        <div className="mb-8 sm:mb-12">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-white">
            <div className="aspect-w-16 aspect-h-9 sm:aspect-h-6">
              <img
                src={service.mainImage}
                alt={service.name}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>

            {/* Floating Service Badge */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-cyan-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  {getCategoryIcon(service.category)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {service.categoryName || categoryOptions[service.category as keyof typeof categoryOptions]?.name}
                  </p>
                  <p className="text-xs text-cyan-600 font-semibold">متاح الآن</p>
                </div>
              </div>
            </div>

            {/* Price Badge */}
            <div className="absolute top-6 left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
              {service.price}
            </div>
          </div>
        </div>

        {/* Service Info Section - Second */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-cyan-100">
            <div className="text-center mb-8">
              {/* Service Name - After Image */}
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-800 mb-4 sm:mb-6">
                {service.name}
              </h1>
              
              {/* Service Description - After Name */}
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 sm:p-6 rounded-2xl border border-cyan-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-slate-600 mb-1">المدة المتوقعة</p>
                <p className="font-bold text-slate-800">{service.duration}</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-2xl border border-green-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-slate-600 mb-1">حالة التوفر</p>
                <p className="font-bold text-slate-800">{service.availability}</p>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 rounded-2xl border border-amber-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-slate-600 mb-1">تقييم الخدمة</p>
                <p className="font-bold text-slate-800">⭐ 4.9/5</p>
              </div>
            </div>

            {/* Main CTA Button */}
            <div className="text-center">
              <button
                onClick={() => setShowBookingModal(true)}
                className="group inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 hover:scale-105"
              >
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" />
                احجز الخدمة الآن
                <ArrowRight className="w-5 h-5 transform -rotate-180 group-hover:-translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              مميزات الخدمة
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نقدم لك أفضل خدمة بأعلى معايير الجودة والاحترافية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {service.features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">
                      {feature}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      ميزة متقدمة تضمن لك أفضل تجربة خدمة ممكنة
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Options Section */}
        {getCategoryOptions() && (
          <div className="mb-8 sm:mb-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                خيارات الخدمة المتاحة
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                اختر من بين مجموعة متنوعة من الخيارات المتخصصة
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {getCategoryOptions()?.options.map((option, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      {getCategoryIcon(service.category)}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                      {option}
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    خدمة متخصصة ومهنية بأعلى معايير الجودة والأمان
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      متاح الآن
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Why Choose Us */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-cyan-100">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              لماذا تختارنا؟
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-slate-600">فريق عمل محترف ومدرب على أعلى مستوى</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-slate-600">خدمة عملاء متميزة على مدار الساعة</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-slate-600">أسعار تنافسية وشفافية كاملة في التعامل</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-slate-600">ضمان الجودة والرضا التام للعملاء</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-cyan-100">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              تواصل معنا
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Phone className="w-5 h-5 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-600">هاتف</p>
                  <p className="font-semibold text-slate-800" dir="ltr"> +966 56 980 6839</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">واتساب</p>
                  <p className="font-semibold text-slate-800" dir="ltr">+966 56 980 6839</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">ساعات العمل</p>
                  <p className="font-semibold text-slate-800">24/7 طوال الأسبوع</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      {/* Enhanced Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 sm:p-8 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    احجز خدمة: {service.name}
                  </h2>
                  <p className="text-cyan-100">املأ البيانات التالية لإتمام الحجز</p>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-white/80 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleBookingSubmit} className="space-y-8">
                {/* البيانات الأساسية */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    البيانات الشخصية
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        الاسم الكريم *
                      </label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-300"
                          placeholder="أدخل اسمك الكامل"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        رقم الجوال *
                      </label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-300"
                          placeholder="05xxxxxxxx"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      العنوان بالتفصيل *
                    </label>
                    <div className="relative">
                      <Home className="absolute right-3 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-300"
                        placeholder="أدخل عنوانك بالتفصيل (الحي، الشارع، رقم المبنى)"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* خيارات مخصصة حسب الفئة */}
                {getCategoryOptions() && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        {getCategoryIcon(service.category)}
                      </div>
                      تفاصيل الخدمة
                    </h3>

                    <div className="space-y-6">
                      {priceOptions.length > 0 ? (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            اختر الباقة أو الوجهة *
                          </label>
                          <select
                            name="selectedDestination"
                            value={formData.selectedDestination}
                            onChange={handlePriceSelectionChange}
                            required
                            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 shadow-sm transition-all duration-300"
                          >
                            {priceOptions.map((option, index) => (
                              <option key={index} value={option.name}>
                                {option.name} ({option.price})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-3">
                            نوع الخدمة المطلوبة
                          </label>
                          <select
                            name="selectedOption"
                            value={formData.selectedOption}
                            onChange={handleInputChange}
                            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 shadow-sm transition-all duration-300"
                          >
                            <option value="">اختر نوع الخدمة</option>
                            {getCategoryOptions()?.options.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* تفاصيل المشوار الخارجي - لكل خدمة من هذه الفئة */}
                      {service.category === 'external_trips' && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-6 mb-6 border-2 border-amber-300 shadow-xl">
                          <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-6 h-6" />
                            <h3 className="text-xl font-bold">تفاصيل المشوار الخارجي</h3>
                          </div>

                          {/* تنبيه مهم */}
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/30">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-amber-200" />
                              <span className="font-bold text-amber-100">مطلوب: اختيار الوجهة</span>
                            </div>
                            <p className="text-sm text-amber-100">
                              يرجى اختيار وجهة المشوار من الخيارات أدناه لإتمام عملية الحجز
                            </p>
                          </div>

                          {/* اختيار الوجهة */}
                          <div className="mb-6" data-section="destination-selection">
                            <label className="block text-lg font-bold mb-4 flex items-center gap-2">
                              <span className="text-red-300">*</span>
                              اختر الوجهة المطلوبة
                            </label>
                            
                            {!formData.selectedDestination && (
                              <div className="bg-red-500/20 border border-red-300 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 text-red-200" />
                                  <span className="text-red-200 font-medium">لم يتم اختيار الوجهة بعد</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* خميس مشيط */}
                              <button
                                type="button"
                                onClick={() => {
                                  console.log('[ServiceDetail] 🎯 تم اختيار: خميس مشيط');
                                  setSelectedPrice('250 ريال');
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedDestination: 'خميس مشيط',
                                    tripDetails: {
                                      ...prev.tripDetails,
                                      destination: 'خميس مشيط',
                                      price: '250 ريال',
                                      duration: '9 ساعات كحد أقصى'
                                    }
                                  }));
                                }}
                                className={`w-full p-6 rounded-xl text-right transition-all duration-300 transform hover:scale-105 ${
                                  formData.selectedDestination === 'خميس مشيط'
                                  ? 'bg-green-600 border-2 border-green-300 scale-105 shadow-2xl'
                                  : 'bg-white/10 border-2 border-white/30 hover:border-green-300 hover:bg-white/20'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                      {formData.selectedDestination === 'خميس مشيط' && (
                                        <CheckCircle className="w-5 h-5 text-green-200" />
                                      )}
                                      خميس مشيط
                                    </h4>
                                    <p className="text-sm text-gray-200">9 ساعات كحد أقصى</p>
                                    <p className="text-xs text-gray-300 mt-1">المسافة: ~150 كم</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-yellow-300">250 ريال</div>
                                    <div className="text-xs text-gray-300">شامل الوقود</div>
                                  </div>
                                </div>
                              </button>

                              {/* أبها */}
                              <button
                                type="button"
                                onClick={() => {
                                  console.log('[ServiceDetail] 🎯 تم اختيار: أبها');
                                  setSelectedPrice('300 ريال');
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedDestination: 'أبها',
                                    tripDetails: {
                                      ...prev.tripDetails,
                                      destination: 'أبها',
                                      price: '300 ريال',
                                      duration: '9 ساعات كحد أقصى'
                                    }
                                  }));
                                }}
                                className={`w-full p-6 rounded-xl text-right transition-all duration-300 transform hover:scale-105 ${
                                  formData.selectedDestination === 'أبها'
                                  ? 'bg-green-600 border-2 border-green-300 scale-105 shadow-2xl'
                                  : 'bg-white/10 border-2 border-white/30 hover:border-green-300 hover:bg-white/20'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                      {formData.selectedDestination === 'أبها' && (
                                        <CheckCircle className="w-5 h-5 text-green-200" />
                                      )}
                                      أبها
                                    </h4>
                                    <p className="text-sm text-gray-200">9 ساعات كحد أقصى</p>
                                    <p className="text-xs text-gray-300 mt-1">المسافة: ~200 كم</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-yellow-300">300 ريال</div>
                                    <div className="text-xs text-gray-300">شامل الوقود</div>
                                  </div>
                                </div>
                              </button>
                            </div>
                            
                            {/* رسالة تأكيد الاختيار */}
                            {formData.selectedDestination && (
                              <div className="mt-4 bg-green-500/20 border border-green-300 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-200" />
                                  <span className="text-green-200 font-medium">
                                    تم اختيار: {formData.selectedDestination} - {selectedPrice}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* موقع الانطلاق ونقطة الوصول */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold mb-2 flex items-center gap-1">
                                <span className="text-red-300">*</span>
                                موقع الانطلاق
                              </label>
                              <input
                                type="text"
                                name="startLocation"
                                value={formData.startLocation}
                                onChange={handleInputChange}
                                placeholder="مثال: الخارجة - حي السلام"
                                className="w-full p-4 rounded-xl bg-white/10 border-2 border-white/30 focus:border-yellow-300 text-white placeholder-gray-300 shadow-lg transition-all duration-300"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold mb-2 flex items-center gap-1">
                                <span className="text-red-300">*</span>
                                نقطة الوصول
                              </label>
                              <input
                                type="text"
                                name="endLocation"
                                value={formData.endLocation}
                                onChange={handleInputChange}
                                placeholder={`مثال: ${formData.selectedDestination || '[الوجهة]'} - المستشفى العام`}
                                className="w-full p-4 rounded-xl bg-white/10 border-2 border-white/30 focus:border-yellow-300 text-white placeholder-gray-300 shadow-lg transition-all duration-300"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* الأسئلة المخصصة */}
                {service && service.customQuestions && service.customQuestions.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      أسئلة خاصة بالخدمة ({service.customQuestions.length})
                    </h3>
                    
                    <div className="space-y-6">
                      {service.customQuestions.map((question, index) => (
                        <div key={question.id} className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">
                            {question.question}
                            {question.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          
                          {/* حقل النص */}
                          {question.type === 'text' && (
                            <input
                              type="text"
                              value={formData.customAnswers[question.id] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                customAnswers: {
                                  ...prev.customAnswers,
                                  [question.id]: e.target.value
                                }
                              }))}
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-300"
                              placeholder={question.placeholder || ''}
                              required={question.required}
                            />
                          )}
                          
                          {/* حقل الرقم */}
                          {question.type === 'number' && (
                            <input
                              type="number"
                              value={formData.customAnswers[question.id] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                customAnswers: {
                                  ...prev.customAnswers,
                                  [question.id]: e.target.value
                                }
                              }))}
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-800 placeholder-slate-400 shadow-sm transition-all duration-300"
                              placeholder={question.placeholder || ''}
                              required={question.required}
                            />
                          )}
                          
                          {/* اختيار واحد */}
                          {question.type === 'select_single' && question.options && (
                            <select
                              value={formData.customAnswers[question.id] || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                customAnswers: {
                                  ...prev.customAnswers,
                                  [question.id]: e.target.value
                                }
                              }))}
                              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-800 shadow-sm transition-all duration-300"
                              required={question.required}
                            >
                              <option value="">اختر خياراً</option>
                              {question.options.map((option, optionIndex) => (
                                <option key={optionIndex} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {/* اختيار متعدد */}
                          {question.type === 'select_multiple' && question.options && (
                            <div className="space-y-3">
                              {question.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={(formData.customAnswers[question.id] || []).includes(option)}
                                    onChange={(e) => {
                                      const currentAnswers = formData.customAnswers[question.id] || [];
                                      const newAnswers = e.target.checked
                                        ? [...currentAnswers, option]
                                        : currentAnswers.filter((item: string) => item !== option);
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        customAnswers: {
                                          ...prev.customAnswers,
                                          [question.id]: newAnswers
                                        }
                                      }));
                                    }}
                                    className="mr-3 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500"
                                  />
                                  <span className="text-slate-700">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {/* حقل التاريخ */}
                          {question.type === 'date' && (
                            <div className="relative">
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <input
                                type="date"
                                value={formData.customAnswers[question.id] || ''}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  customAnswers: {
                                    ...prev.customAnswers,
                                    [question.id]: e.target.value
                                  }
                                }))}
                                className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-800 shadow-sm transition-all duration-300"
                                required={question.required}
                              />
                            </div>
                          )}
                          
                          {/* حقل الملف */}
                          {question.type === 'file' && (
                            <div className="relative">
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setFormData(prev => ({
                                      ...prev,
                                      customAnswers: {
                                        ...prev.customAnswers,
                                        [question.id]: file.name
                                      }
                                    }));
                                  }
                                }}
                                className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 shadow-sm transition-all duration-300"
                                required={question.required}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* تفاصيل إضافية */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    تفاصيل إضافية
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      ملاحظات خاصة (اختياري)
                    </label>
                    <textarea
                      name="serviceDetails"
                      value={formData.serviceDetails}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-slate-800 placeholder-slate-400 resize-none shadow-sm transition-all duration-300"
                      placeholder="أي تفاصيل إضافية تود إضافتها..."
                    />
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-300"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
        </div>
      )}

      {/* Quick Category Services Modal */}
      {showQuickBookingServices && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 sm:p-8 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Package className="w-8 h-8" />
                    خدمات {getCategoryName(selectedQuickCategory)}
                  </h2>
                  <p className="text-cyan-100">اختر الخدمة التي تريد حجزها</p>
                </div>
                <button
                  onClick={closeQuickBookingServices}
                  className="text-white/80 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {loadingQuickServices ? (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-150 mx-auto"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">جاري تحميل الخدمات</h3>
                  <p className="text-gray-600">يرجى الانتظار قليلاً...</p>
                </div>
              ) : quickCategoryServices.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد خدمات في هذه الفئة</h3>
                  <p className="text-slate-500 mb-6">لم نجد خدمات متاحة في فئة {getCategoryName(selectedQuickCategory)} حالياً</p>
                  <button
                    onClick={closeQuickBookingServices}
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickCategoryServices.map((service) => (
                    <div key={service.id} className="group bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl p-6 border border-cyan-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Service Image */}
                      <div className="relative h-40 mb-4 rounded-xl overflow-hidden bg-slate-100">
                        {service.mainImage ? (
                          <img
                            src={service.mainImage}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-100">
                            <div className="text-4xl">
                              {selectedQuickCategory === 'internal_delivery' && '🚚'}
                              {selectedQuickCategory === 'external_trips' && '🗺️'}
                              {selectedQuickCategory === 'home_maintenance' && '🔧'}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Service Info */}
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {service.homeShortDescription || service.description}
                      </p>
                      
                      {/* Price and Duration */}
                      <div className="flex items-center justify-between mb-4">
                        {service.duration && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                            <Clock className="w-3 h-3" />
                            {service.duration}
                          </span>
                        )}
                        {service.price && (
                          <span className="text-lg font-bold text-amber-600">
                            {typeof service.price === 'string' && service.price.includes('|') ? 
                              service.price.split('|')[0].trim() : service.price
                            }
                          </span>
                        )}
                      </div>
                      
                      {/* Custom Questions Count */}
                      {service.customQuestions && service.customQuestions.length > 0 && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                            <MessageSquare className="w-3 h-3" />
                            {service.customQuestions.length} أسئلة مخصصة
                          </span>
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <button
                        onClick={() => handleQuickServiceSelect(service)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                      >
                        احجز هذه الخدمة
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Back to Categories */}
              <div className="text-center mt-8">
                <button
                  onClick={closeQuickBookingServices}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
                >
                  العودة لاختيار فئة أخرى
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal unified */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        service={service}
      />
    </div>
  );
}