import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Clock, Package, Truck, Wrench, Send, DollarSign, AlertCircle, FileText, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { createBooking } from '../services/bookingsApi';
import { servicesApi, Service } from '../services/servicesApi';
import { collection, query as fbQuery, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
}

function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: '',
    selectedDestination: '',
    startLocation: '',
    endLocation: '',
    urgencyLevel: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    customAnswers: {} as Record<string, any> // إجابات الأسئلة المخصصة
  });

  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryServices, setCategoryServices] = useState<any[]>([]);
  const [chosenService, setChosenService] = useState<any | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  // الخدمة النشطة (إما من الـ props أو المختارة من القائمة)
  const activeService = service || chosenService;
  const currentCategory = activeService ? activeService.category : selectedCategory;

  // تحديد فئة الخدمة عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      if (service && service.category) {
        setSelectedCategory(service.category);
      } else {
        setSelectedCategory('');
      }
      setChosenService(null);
      setCategoryServices([]);
      // إعادة تعيين النموذج
      setFormData({
        fullName: '',
        phoneNumber: '',
        address: '',
        serviceDetails: '',
        selectedDestination: '',
        startLocation: '',
        endLocation: '',
        urgencyLevel: 'medium',
        notes: '',
        customAnswers: {}
      });
    }
  }, [isOpen, service]);

  // جلب خدمات الفئة المختارة عندما لا تكون هناك خدمة محددة
  useEffect(() => {
    if (!service && selectedCategory) {
      (async () => {
        try {
          setLoadingServices(true);
          const servicesRef = collection(db, 'services');
          const q = fbQuery(servicesRef, where('categoryId', '==', selectedCategory));
          const snapshot = await getDocs(q);
          const list: any[] = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));

          // إذا لم نجد نتائج بالـ categoryId نجرب الحقل category
          if (list.length === 0) {
            const q2 = fbQuery(servicesRef, where('category', '==', selectedCategory));
            const snap2 = await getDocs(q2);
            snap2.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          }

          setCategoryServices(list);
        } catch (err) {
          console.error('[BookingModal] Error loading category services:', err);
          setCategoryServices([]);
        } finally {
          setLoadingServices(false);
        }
      })();
    }
  }, [selectedCategory, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // لابد من وجود خدمة مختارة
    const currentCategory = activeService ? activeService.category : selectedCategory;
    
    if (!currentCategory) {
      toast.error('❌ يرجى اختيار نوع الخدمة أولاً');
      return;
    }

    if (!activeService) {
      toast.error('❌ يرجى اختيار خدمة من القائمة');
      return;
    }

    if (!formData.fullName || !formData.phoneNumber || !formData.address) {
      toast.error('❌ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من الأسئلة المخصصة الإجبارية
    if (activeService && activeService.customQuestions) {
      for (const question of activeService.customQuestions) {
        if (question.required) {
          const answer = formData.customAnswers[question.id];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && answer.trim() === '')) {
            toast.error(`❌ يرجى الإجابة على السؤال: ${question.question}`);
            return;
          }
        }
      }
    }

    // التحقق من الحقول المطلوبة حسب نوع الخدمة
    if (currentCategory === 'external_trips') {
      if (!formData.selectedDestination) {
        toast.error('❌ يرجى اختيار وجهة للمشوار الخارجي');
        return;
      }
      if (!formData.startLocation || !formData.endLocation) {
        toast.error('❌ يرجى تحديد موقع الانطلاق ونقطة الوصول');
        return;
      }
    }

    if (currentCategory === 'home_maintenance' && !formData.serviceDetails) {
      toast.error('❌ يرجى وصف نوع الصيانة المطلوبة');
      return;
    }

    try {
      setSubmitting(true);
      
      // تحديد السعر حسب نوع الخدمة
      let estimatedPrice = '';
      if (currentCategory === 'internal_delivery') {
        estimatedPrice = '20 ريال';
      } else if (currentCategory === 'external_trips') {
        if (formData.selectedDestination === 'خميس مشيط') {
          estimatedPrice = '250 ريال';
        } else if (formData.selectedDestination === 'أبها') {
          estimatedPrice = '300 ريال';
        }
      } else if (currentCategory === 'home_maintenance') {
        estimatedPrice = 'على حسب المطلوب';
      }
      
      // إعداد بيانات الحجز مع معلومات الأسئلة المخصصة
      const customAnswersWithQuestions: Record<string, { question: string; answer: any; type: string }> = {};
      
      if (activeService && activeService.customQuestions) {
        activeService.customQuestions.forEach((q: CustomQuestion) => {
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

      const bookingData = {
        serviceId: activeService ? activeService.id : 'unknown',
        serviceName: activeService ? activeService.name : 'خدمة غير محددة',
        serviceCategory: currentCategory,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        serviceDetails: formData.serviceDetails,
        selectedDestination: formData.selectedDestination,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        urgencyLevel: formData.urgencyLevel,
        notes: formData.notes,
        customAnswers: formData.customAnswers, // الإجابات القديمة للتوافق
        customAnswersWithQuestions: customAnswersWithQuestions, // الإجابات مع معلومات الأسئلة
        status: 'pending',
        createdAt: new Date().toISOString(),
        categoryName: activeService ? activeService.categoryName : getServiceName(currentCategory),
        price: estimatedPrice
      };

      await createBooking(bookingData);
      
      toast.success('✅ تم إرسال طلب الحجز بنجاح! سنتواصل معك قريباً');
      onClose();
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('❌ فشل في إرسال طلب الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setSubmitting(false);
    }
  };

  const getServiceName = (category: string) => {
    switch (category) {
      case 'internal_delivery': return 'خدمة توصيل أغراض داخلي';
      case 'external_trips': return 'مشاوير خارجية';
      case 'home_maintenance': return 'صيانة منزلية';
      default: return 'حجز سريع';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            حجز سريع وفوري
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار نوع الخدمة إذا لم تكن محددة */}
          {!service && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                اختر نوع الخدمة *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('internal_delivery')}
                  className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                    selectedCategory === 'internal_delivery'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🚚</div>
                  <div className="text-sm font-medium">توصيل أغراض داخلي</div>
                  <div className="text-xs text-gray-400 mt-1">20 ريال</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedCategory('external_trips')}
                  className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                    selectedCategory === 'external_trips'
                      ? 'border-green-500 bg-green-500/20 text-green-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🗺️</div>
                  <div className="text-sm font-medium">مشاوير خارجية</div>
                  <div className="text-xs text-gray-400 mt-1">من 250 ريال</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedCategory('home_maintenance')}
                  className={`p-4 rounded-lg border transition-all duration-200 text-center ${
                    selectedCategory === 'home_maintenance'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                      : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm font-medium">صيانة منزلية</div>
                  <div className="text-xs text-gray-400 mt-1">على حسب المطلوب</div>
                </button>
              </div>
            </div>
          )}

          {/* معلومات الخدمة المختارة */}
          {activeService && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">
                  {activeService.category === 'internal_delivery' && '🚚'}
                  {activeService.category === 'external_trips' && '🗺️'}
                  {activeService.category === 'home_maintenance' && '🔧'}
                </div>
                <div>
                  <h3 className="text-white font-bold">{activeService.name}</h3>
                  <p className="text-yellow-400 font-bold text-base">{activeService.price}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{activeService.homeShortDescription}</p>
            </div>
          )}

          {/* إظهار الحقول دائماً عند وجود خدمة أو اختيار فئة */}
          {activeService && (
            <>
              {/* المعلومات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="مثال: 0501234567"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العنوان *
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="العنوان التفصيلي"
                    required
                  />
                </div>
              </div>

              {/* حقول خاصة بالمشاوير الخارجية */}
              {(currentCategory === 'external_trips') && (
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-400" />
                    تفاصيل المشوار الخارجي
                  </h3>
                  
                  {/* اختيار الوجهة - ديناميكي من بيانات الخدمة */}
                  {service && service.price && typeof service.price === 'string' && service.price.includes('|') ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        اختر الوجهة *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.price.split('|').map((priceOption: string, index: number) => {
                          const parts = priceOption.trim().split(/(\s+)/);
                          const price = parts.pop() || '';
                          const name = parts.join('').trim();
                          const destinationId = name.toLowerCase().replace(/\s+/g, '_');
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, selectedDestination: destinationId }))}
                              className={`p-4 rounded-lg border transition-all duration-200 text-right ${
                                formData.selectedDestination === destinationId
                                  ? 'border-green-500 bg-green-500/20 text-green-300'
                                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="font-semibold text-lg">{name}</div>
                                  <div className="text-xs text-gray-400">9 ساعات كحد أقصى</div>
                                </div>
                                <div className="text-yellow-400 font-bold text-xl">{price}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* خيارات افتراضية للمشاوير الخارجية */
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        اختر الوجهة *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, selectedDestination: 'خميس مشيط' }))}
                          className={`p-4 rounded-lg border transition-all duration-200 text-right ${
                            formData.selectedDestination === 'خميس مشيط'
                              ? 'border-green-500 bg-green-500/20 text-green-300'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-lg">خميس مشيط</div>
                              <div className="text-xs text-gray-400">9 ساعات كحد أقصى</div>
                            </div>
                            <div className="text-yellow-400 font-bold text-xl">250 ريال</div>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, selectedDestination: 'أبها' }))}
                          className={`p-4 rounded-lg border transition-all duration-200 text-right ${
                            formData.selectedDestination === 'أبها'
                              ? 'border-green-500 bg-green-500/20 text-green-300'
                              : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-semibold text-lg">أبها</div>
                              <div className="text-xs text-gray-400">9 ساعات كحد أقصى</div>
                            </div>
                            <div className="text-yellow-400 font-bold text-xl">300 ريال</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* عرض السعر بعد اختيار الوجهة */}
                  {formData.selectedDestination && (
                    <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                      <p className="text-yellow-400 font-bold text-lg">
                        السعر: {formData.selectedDestination === 'خميس مشيط' ? '250 ريال' : formData.selectedDestination === 'أبها' ? '300 ريال' : ''}
                      </p>
                    </div>
                  )}

                  {/* موقع الانطلاق ونقطة الوصول - يظهر دائماً */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        موقع الانطلاق *
                      </label>
                      <input
                        type="text"
                        value={formData.startLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="مثال: الخارجة - حي السلام"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        نقطة الوصول *
                      </label>
                      <input
                        type="text"
                        value={formData.endLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="مثال: خميس مشيط - المستشفى العام"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* حقول خاصة بالصيانة المنزلية */}
              {(selectedCategory === 'home_maintenance' || (service && service.category === 'home_maintenance')) && (
                <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-400" />
                    وصف المشكلة
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      وصف المشكلة بالتفصيل *
                    </label>
                    <textarea
                      value={formData.serviceDetails}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceDetails: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="وصف مفصل للمشكلة أو نوع الصيانة المطلوبة..."
                      rows={3}
                      required
                    />
                    <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      يرجى وصف المشكلة بالتفصيل لتحديد نوع الصيانة والسعر المناسب
                    </p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <p className="text-orange-300 font-bold">السعر: على حسب المطلوب</p>
                    <p className="text-orange-200 text-sm mt-1">
                      سيتم تحديد السعر النهائي بعد معاينة العمل المطلوب
                    </p>
                  </div>
                </div>
              )}

              {/* عرض السعر للتوصيل الداخلي */}
              {(selectedCategory === 'internal_delivery' || (service && service.category === 'internal_delivery')) && (
                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-blue-300">خدمة التوصيل الداخلي</h4>
                      <p className="text-yellow-400 font-bold text-lg">السعر: 20 ريال</p>
                    </div>
                  </div>
                </div>
              )}

              {/* الأسئلة المخصصة */}
              {service && service.customQuestions && service.customQuestions.length > 0 ? (
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    أسئلة إضافية خاصة بالخدمة ({service.customQuestions.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {service.customQuestions.map((question: CustomQuestion, index: number) => {
                      console.log(`[BookingModal] 📝 عرض السؤال ${index + 1}:`, question);
                      return (
                        <div key={question.id} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            {question.question}
                            {question.required && <span className="text-red-400 ml-1">*</span>}
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
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <label key={optionIndex} className="flex items-center cursor-pointer">
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
                                    className="mr-2 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                                  />
                                  <span className="text-gray-300">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          
                          {/* حقل التاريخ */}
                          {question.type === 'date' && (
                            <div className="relative">
                              <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
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
                                className="w-full pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                required={question.required}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                service && (
                  <div className="bg-gray-500/10 rounded-xl p-4 border border-gray-500/30">
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      أسئلة إضافية
                    </h3>
                    <p className="text-xs text-gray-500">
                      لا توجد أسئلة إضافية لهذه الخدمة. يمكنك إضافة تفاصيل أخرى في حقل الملاحظات أدناه.
                    </p>
                  </div>
                )
              )}

              {/* ملاحظات إضافية */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أي تفاصيل إضافية أو ملاحظات خاصة..."
                  rows={2}
                />
              </div>
            </>
          )}

          {/* قائمة الخدمات عند اختيار الفئة ولم يتم اختيار خدمة */}
          {!activeService && selectedCategory && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">اختر الخدمة *</label>
              {loadingServices ? (
                <p className="text-gray-400">جاري تحميل الخدمات...</p>
              ) : categoryServices.length === 0 ? (
                <p className="text-gray-400">لا توجد خدمات متاحة لهذه الفئة حالياً</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryServices.map((srv: any) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setChosenService(srv)}
                      className={`p-4 rounded-lg border transition-all duration-200 text-right ${
                        chosenService && chosenService?.id === srv.id
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-semibold mb-1">{srv.name}</div>
                      {srv.price && (
                        <div className="text-yellow-400 font-bold text-sm">{srv.price}</div>
                      )}
                      {srv.homeShortDescription && (
                        <div className="text-gray-400 text-xs mt-1 line-clamp-2">{srv.homeShortDescription}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || (!selectedCategory && !(service && service.category))}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'جاري الإرسال...' : 'إرسال طلب الحجز'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingModal; 