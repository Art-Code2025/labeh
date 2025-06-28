import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2,
  Package,
  Tag,
  FileText,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// تعريف نوع الخدمة
interface Service {
  id?: number;
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

// تعريف نوع السؤال المخصص
interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
  required: boolean;
  options?: string[]; // للأسئلة من نوع select
  placeholder?: string;
}

function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [formData, setFormData] = useState<Service>({
    name: '',
    category: 'daily_services',
    categoryName: 'الخدمات اليومية / المشاوير الداخلية',
    homeShortDescription: '',
    detailsShortDescription: '',
    description: '',
    mainImage: '',
    detailedImages: [],
    imageDetails: [],
    features: [''],
    duration: '',
    availability: '24/7',
    price: '',
    customQuestions: []
  });

  const [errors, setErrors] = useState<Partial<Service>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const categories = [
    {
      id: 'daily_services',
      name: 'الخدمات اليومية / المشاوير الداخلية',
      icon: '🚚',
      color: 'blue'
    },
    {
      id: 'external_errands',
      name: 'المشاوير الخارجية',
      icon: '🗺️',
      color: 'green'
    },
    {
      id: 'home_maintenance',
      name: 'الأعمال المنزلية والفنية',
      icon: '🔧',
      color: 'orange'
    }
  ];

  const steps = [
    { 
      id: 1, 
      title: 'المعلومات الأساسية', 
      icon: Package,
      fields: ['name', 'category', 'homeShortDescription', 'detailsShortDescription']
    },
    { 
      id: 2, 
      title: 'الوصف والتفاصيل', 
      icon: FileText,
      fields: ['description', 'features', 'duration', 'availability', 'price']
    },
    { 
      id: 3, 
      title: 'الصور والوسائط', 
      icon: ImageIcon,
      fields: ['mainImage', 'detailedImages']
    },
    { 
      id: 4, 
      title: 'الأسئلة المخصصة', 
      icon: Tag,
      fields: ['customQuestions']
    }
  ];

  useEffect(() => {
    if (isEditing && id) {
      fetchService(parseInt(id));
    }
  }, [id, isEditing]);

  const fetchService = async (serviceId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/services/${serviceId}`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الخدمة');
      }
      const data = await response.json();
      setFormData(data);
    } catch (error: any) {
      toast.error(error.message);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const selectedCategory = categories.find(cat => cat.id === value);
      setFormData(prev => ({
        ...prev,
        category: value,
        categoryName: selectedCategory?.name || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof Service]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    try {
      setImageUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!response.ok) {
        throw new Error('فشل في رفع الصورة');
      }

      const result = await response.json();
      
      if (isMain) {
        setFormData(prev => ({ ...prev, mainImage: result.imageUrl }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          detailedImages: [...prev.detailedImages, result.imageUrl] 
        }));
      }

      toast.success('تم رفع الصورة بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في رفع الصورة');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: number, isMain = false) => {
    if (isMain) {
      setFormData(prev => ({ ...prev, mainImage: '' }));
    } else {
      const newImages = formData.detailedImages.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, detailedImages: newImages }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Service> = {};
    const stepFields = steps[step - 1].fields;

    stepFields.forEach(field => {
      if (field === 'name' && !formData.name.trim()) {
        newErrors.name = 'اسم الخدمة مطلوب';
      }
      if (field === 'homeShortDescription' && !formData.homeShortDescription.trim()) {
        newErrors.homeShortDescription = 'الوصف المختصر مطلوب';
      }
      if (field === 'description' && !formData.description.trim()) {
        newErrors.description = 'وصف الخدمة مطلوب';
      }
      if (field === 'features' && formData.features.filter(f => f.trim()).length === 0) {
        newErrors.features = ['يجب إضافة ميزة واحدة على الأقل'];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setSaving(true);
      
      // تنظيف الميزات من القيم الفارغة
      const cleanedFeatures = formData.features.filter(feature => feature.trim() !== '');
      const dataToSubmit = { ...formData, features: cleanedFeatures };

      const url = isEditing 
        ? `/.netlify/functions/services/${id}`
        : '/.netlify/functions/services';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        throw new Error(isEditing ? 'فشل في تحديث الخدمة' : 'فشل في إنشاء الخدمة');
      }

      const result = await response.json();
      toast.success(result.message || (isEditing ? 'تم تحديث الخدمة بنجاح' : 'تم إنشاء الخدمة بنجاح'));
      
      // العودة إلى لوحة التحكم بعد 2 ثانية
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const getImageSrc = (image: string) => {
    return image;
  };

  // دوال إدارة الأسئلة المخصصة
  const addCustomQuestion = () => {
    const newQuestion: CustomQuestion = {
      id: `question_${Date.now()}`,
      question: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setFormData(prev => ({
      ...prev,
      customQuestions: [...(prev.customQuestions || []), newQuestion]
    }));
  };

  const removeCustomQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleCustomQuestionChange = (index: number, field: keyof CustomQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions?.map((question, i) => {
        if (i === index) {
          const updatedQuestion = { ...question, [field]: value };
          
          // إضافة خيارات فارغة عند تغيير النوع إلى select
          if (field === 'type' && (value === 'select_single' || value === 'select_multiple')) {
            if (!updatedQuestion.options || updatedQuestion.options.length === 0) {
              updatedQuestion.options = [''];
            }
          }
          
          // إزالة الخيارات عند تغيير النوع لشيء آخر غير select
          if (field === 'type' && value !== 'select_single' && value !== 'select_multiple') {
            delete updatedQuestion.options;
          }
          
          return updatedQuestion;
        }
        return question;
      }) || []
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">جاري تحميل بيانات الخدمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
              </h1>
              <p className="text-gray-400 text-sm">
                {isEditing ? 'قم بتحديث تفاصيل الخدمة' : 'أضف خدمة جديدة إلى النظام'}
              </p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-200 ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    React.createElement(step.icon, { className: "w-5 h-5" })
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 transition-all duration-200 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-700'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {React.createElement(steps[currentStep - 1].icon, { 
                className: "w-8 h-8 text-blue-400" 
              })}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-gray-400">الخطوة {currentStep} من {steps.length}</p>
              </div>
            </div>
            
            {/* Mobile Progress */}
            <div className="sm:hidden flex items-center justify-center gap-2">
              {steps.map((step) => (
                <div key={step.id} className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentStep >= step.id ? 'bg-blue-500' : 'bg-gray-600'
                }`}></div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Service Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      اسم الخدمة *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="مثال: توصيل البقالة"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      فئة الخدمة *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                            formData.category === category.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={category.id}
                            checked={formData.category === category.id}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div className="text-3xl mb-2">{category.icon}</div>
                            <div className="text-sm font-medium text-white">
                              {category.name}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Short Descriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        الوصف المختصر للصفحة الرئيسية *
                      </label>
                      <textarea
                        name="homeShortDescription"
                        value={formData.homeShortDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-colors resize-none ${
                          errors.homeShortDescription ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                        }`}
                        placeholder="وصف مختصر يظهر في الصفحة الرئيسية..."
                      />
                      {errors.homeShortDescription && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.homeShortDescription}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        الوصف المختصر لصفحة التفاصيل
                      </label>
                      <textarea
                        name="detailsShortDescription"
                        value={formData.detailsShortDescription}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-colors resize-none"
                        placeholder="وصف مختصر يظهر في صفحة تفاصيل الخدمة..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Description and Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      وصف مفصل للخدمة *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-xl focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 transition-colors resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                      }`}
                      placeholder="اكتب وصف مفصل للخدمة يشرح ما تقدمه وكيفية عملها..."
                    />
                    {errors.description && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      مميزات الخدمة *
                    </label>
                    <div className="space-y-3">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-3">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-colors"
                            placeholder={`الميزة ${index + 1}`}
                          />
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeature}
                        className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة ميزة
                      </button>
                    </div>
                    {errors.features && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.features[0]}
                      </p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        المدة المتوقعة
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-colors"
                        placeholder="مثال: 30-60 دقيقة"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        ساعات التوفر
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                      >
                        <option value="24/7">24/7</option>
                        <option value="ساعات العمل">ساعات العمل</option>
                        <option value="حسب الطلب">حسب الطلب</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        السعر
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 transition-colors"
                        placeholder="مثال: يبدأ من 50 ريال"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Images */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Main Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      الصورة الرئيسية
                    </label>
                    {formData.mainImage ? (
                      <div className="relative">
                        <img
                          src={getImageSrc(formData.mainImage)}
                          alt="الصورة الرئيسية"
                          className="w-full h-48 object-cover rounded-xl border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(0, true)}
                          className="absolute top-2 left-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="sr-only"
                          id="main-image"
                          disabled={imageUploading}
                        />
                        <label
                          htmlFor="main-image"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-gray-500 transition-colors"
                        >
                          {imageUploading ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-gray-400">اضغط لرفع الصورة الرئيسية</span>
                              <span className="text-gray-500 text-sm">PNG, JPG, JPEG (حد أقصى 5MB)</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      صور إضافية
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.detailedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={getImageSrc(image)}
                            alt={`صورة إضافية ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 left-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Add Image Button */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false)}
                          className="sr-only"
                          id="additional-image"
                          disabled={imageUploading}
                        />
                        <label
                          htmlFor="additional-image"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
                        >
                          {imageUploading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          ) : (
                            <>
                              <Plus className="w-6 h-6 text-gray-400 mb-1" />
                              <span className="text-gray-400 text-sm">إضافة صورة</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Custom Questions */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <h3 className="text-xl font-bold text-white mb-2">الأسئلة المخصصة في نموذج الحجز</h3>
                    <p className="text-gray-400">أضف أسئلة مخصصة ستظهر في نموذج الحجز لهذه الخدمة</p>
                  </div>

                  {/* Custom Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-300">
                        الأسئلة المخصصة ({(formData.customQuestions || []).length})
                      </label>
                      <button
                        type="button"
                        onClick={addCustomQuestion}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة سؤال جديد
                      </button>
                    </div>

                    {(formData.customQuestions || []).length === 0 ? (
                      <div className="text-center py-8 bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-600">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 mb-4">لم يتم إضافة أي أسئلة مخصصة بعد</p>
                        <button
                          type="button"
                          onClick={addCustomQuestion}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          إضافة السؤال الأول
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(formData.customQuestions || []).map((question, index) => (
                          <div key={question.id} className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-medium text-white">السؤال {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeCustomQuestion(index)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="حذف السؤال"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* نص السؤال */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  نص السؤال *
                                </label>
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) => handleCustomQuestionChange(index, 'question', e.target.value)}
                                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                                  placeholder="مثال: ما هو العنوان التفصيلي؟"
                                  required
                                />
                              </div>

                              {/* نوع السؤال */}
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  نوع السؤال *
                                </label>
                                <select
                                  value={question.type}
                                  onChange={(e) => handleCustomQuestionChange(index, 'type', e.target.value)}
                                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                                >
                                  <option value="text">نص</option>
                                  <option value="number">رقم</option>
                                  <option value="select_single">اختيار واحد</option>
                                  <option value="select_multiple">اختيار متعدد</option>
                                  <option value="date">تاريخ</option>
                                  <option value="file">مرفق</option>
                                </select>
                              </div>

                              {/* السؤال إجباري */}
                              <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => handleCustomQuestionChange(index, 'required', e.target.checked)}
                                    className="mr-2 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-gray-300 font-medium">سؤال إجباري</span>
                                </label>
                              </div>

                              {/* النص الإرشادي */}
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                  النص الإرشادي (اختياري)
                                </label>
                                <input
                                  type="text"
                                  value={question.placeholder || ''}
                                  onChange={(e) => handleCustomQuestionChange(index, 'placeholder', e.target.value)}
                                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                                  placeholder="مثال: أدخل العنوان بالتفصيل"
                                />
                              </div>

                              {/* خيارات الاختيار */}
                              {(question.type === 'select_single' || question.type === 'select_multiple') && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-300 mb-2">
                                    خيارات الاختيار *
                                  </label>
                                  <div className="space-y-2">
                                    {(question.options || []).map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex gap-2">
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...(question.options || [])];
                                            newOptions[optionIndex] = e.target.value;
                                            handleCustomQuestionChange(index, 'options', newOptions);
                                          }}
                                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                                          placeholder={`الخيار ${optionIndex + 1}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
                                            handleCustomQuestionChange(index, 'options', newOptions);
                                          }}
                                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOptions = [...(question.options || []), ''];
                                        handleCustomQuestionChange(index, 'options', newOptions);
                                      }}
                                      className="flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors text-sm"
                                    >
                                      <Plus className="w-3 h-3" />
                                      إضافة خيار
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-700">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                    السابق
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                    إلغاء
                  </button>
                )}

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    التالي
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEditing ? 'تحديث الخدمة' : 'إنشاء الخدمة'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

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
}

export default ServiceForm;