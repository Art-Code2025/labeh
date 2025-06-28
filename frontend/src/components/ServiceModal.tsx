import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Image as ImageIcon, DollarSign, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadImageToCloudinary, isCloudinaryUrl } from '../services/cloudinary';
import { Service, Category } from '../services/servicesApi';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: any) => void;
  editingService: any | null;
  categories: Category[];
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingService,
  categories
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    categoryName: '',
    homeShortDescription: '',
    detailsShortDescription: '',
    description: '',
    mainImage: '',
    features: [] as string[],
    price: '',
    expectedDuration: '',
    customQuestions: [] as CustomQuestion[]
  });

  // UI state
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pricing option state
  const [priceOption, setPriceOption] = useState<'fixed' | 'on_demand' | 'trips'>('on_demand');
  const [tripPrices, setTripPrices] = useState({ khamis: '250', abha: '300' });

  // Custom question type
  interface CustomQuestion {
    id: string;
    question: string;
    type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
    required: boolean;
    options?: string[];
    placeholder?: string;
  }

  // Initialize form when modal opens or editing service changes
  useEffect(() => {
    if (isOpen) {
      if (editingService) {
        // Load existing service data
        setFormData({
          name: editingService.name || '',
          category: editingService.category || '',
          categoryName: editingService.categoryName || '',
          homeShortDescription: editingService.homeShortDescription || '',
          detailsShortDescription: editingService.detailsShortDescription || '',
          description: editingService.description || '',
          mainImage: editingService.mainImage || '',
          features: editingService.features || [],
          price: editingService.price || '',
          expectedDuration: editingService.expectedDuration || '',
          customQuestions: editingService.customQuestions || []
        });
        setImagePreview(editingService.mainImage || null);
        if (editingService.price === 'حسب الطلب') {
          setPriceOption('on_demand');
        } else if (editingService.price?.includes('خميس')) {
          setPriceOption('trips');
          const parts = editingService.price.split('|');
          setTripPrices({
            khamis: parts[0]?.match(/(\d+)/)?.[0] || '250',
            abha: parts[1]?.match(/(\d+)/)?.[0] || '300'
          });
        } else {
          setPriceOption('fixed');
        }
      } else {
        // Reset for new service
        setFormData({
          name: '',
          category: '',
          categoryName: '',
          homeShortDescription: '',
          detailsShortDescription: '',
          description: '',
          mainImage: '',
          features: [],
          price: '',
          expectedDuration: '',
          customQuestions: []
        });
        setImagePreview(null);
        setPriceOption('on_demand');
        setTripPrices({ khamis: '250', abha: '300' });
      }
    }
  }, [isOpen, editingService]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUploading(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
      categoryName: name === 'category' ? categories.find(c => c.id === value)?.name || '' : prev.categoryName
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, mainImage: imageUrl }));
        setImagePreview(imageUrl);
        toast.success('تم رفع الصورة بنجاح!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, mainImage: '' }));
    setImagePreview(null);
  };

  // ====== إدارة خيارات الأسئلة من نوع اختيار ======
  const addOption = (qIdx: number) => {
    setFormData(prev => {
      const questions = [...prev.customQuestions];
      const opts = questions[qIdx].options ? [...questions[qIdx].options] : [];
      opts.push('');
      questions[qIdx].options = opts;
      return { ...prev, customQuestions: questions };
    });
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    setFormData(prev => {
      const questions = [...prev.customQuestions];
      if (questions[qIdx].options) {
        questions[qIdx].options = questions[qIdx].options!.filter((_, i) => i !== optIdx);
      }
      return { ...prev, customQuestions: questions };
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setFormData(prev => {
      const questions = [...prev.customQuestions];
      if (!questions[qIdx].options) questions[qIdx].options = [];
      questions[qIdx].options![optIdx] = value;
      return { ...prev, customQuestions: questions };
    });
  };

  // Functions to manage custom questions
  const addCustomQuestion = () => {
    const newQ: CustomQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'text',
      required: false,
      placeholder: ''
    };
    setFormData(prev => ({ ...prev, customQuestions: [...prev.customQuestions, newQ] }));
  };
  const removeCustomQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };
  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: any) => {
    setFormData(prev => {
      const updatedQuestions = prev.customQuestions.map((q, i) => {
        if (i !== index) return q;
        let updated: CustomQuestion = { ...q, [field]: value };

        // إذا تغير نوع السؤال إلى اختيار، أضف خيارات افتراضية
        if (field === 'type') {
          if (value === 'select_single' || value === 'select_multiple') {
            updated.options = updated.options && updated.options.length > 0 ? updated.options : ['', ''];
          } else {
            delete updated.options;
          }
        }
        return updated;
      });
      return { ...prev, customQuestions: updatedQuestions };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploading) {
      toast.error('يرجى انتظار انتهاء رفع الصورة');
      return;
    }

    if (!formData.name || !formData.category || !formData.homeShortDescription) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    let finalPrice = formData.price;
    if (priceOption === 'trips') {
      finalPrice = `خميس مشيط ${tripPrices.khamis} ريال | أبها ${tripPrices.abha} ريال`;
    } else if (priceOption === 'on_demand') {
      finalPrice = 'حسب الطلب';
    }

    const serviceData = {
      ...formData,
      price: finalPrice,
      isCloudinaryMainImage: !!formData.mainImage && formData.mainImage.includes('cloudinary'),
      customQuestions: formData.customQuestions
    };

    onSave(serviceData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            {editingService ? 'تحديث الخدمة' : 'إضافة خدمة جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار الفئة */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الفئة *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              required
            >
              <option value="">اختر الفئة</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* اسم الخدمة */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اسم الخدمة *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder="أدخل اسم الخدمة"
              required
            />
          </div>

          {/* وصف مختصر */}
          <div>
            <label htmlFor="homeShortDescription" className="block text-sm font-medium text-gray-300 mb-2">
              وصف مختصر *
            </label>
            <input
              id="homeShortDescription"
              type="text"
              name="homeShortDescription"
              value={formData.homeShortDescription}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder="وصف مختصر للخدمة"
              required
            />
          </div>

          {/* وصف تفصيلي */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              وصف تفصيلي
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
              placeholder="وصف تفصيلي للخدمة..."
            />
          </div>

          {/* السعر */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">السعر</label>
            <div className="space-y-3 bg-gray-700/40 p-4 rounded-lg border border-gray-600">
              <label className="flex items-center gap-2 text-gray-200 text-sm">
                <input
                  type="radio"
                  name="priceOption"
                  value="fixed"
                  checked={priceOption === 'fixed'}
                  onChange={() => setPriceOption('fixed')}
                />
                سعر ثابت
              </label>
              {priceOption === 'fixed' && (
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-2 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="مثال: 150 ريال"
                />
              )}

              <label className="flex items-center gap-2 text-gray-200 text-sm">
                <input
                  type="radio"
                  name="priceOption"
                  value="on_demand"
                  checked={priceOption === 'on_demand'}
                  onChange={() => {
                    setPriceOption('on_demand');
                    setFormData(prev => ({ ...prev, price: 'حسب الطلب' }));
                  }}
                />
                على حسب الطلب
              </label>

              <label className="flex items-center gap-2 text-gray-200 text-sm">
                <input
                  type="radio"
                  name="priceOption"
                  value="trips"
                  checked={priceOption === 'trips'}
                  onChange={() => setPriceOption('trips')}
                />
                مشاوير خارجية (خميس مشيط / أبها)
              </label>
              {priceOption === 'trips' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <input
                    type="text"
                    value={tripPrices.khamis}
                    onChange={e => setTripPrices(p => ({ ...p, khamis: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="خميس مشيط (ريال)"
                  />
                  <input
                    type="text"
                    value={tripPrices.abha}
                    onChange={e => setTripPrices(p => ({ ...p, abha: e.target.value }))}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    placeholder="أبها (ريال)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* المدة المتوقعة - اختياري */}
          <div>
            <label htmlFor="expectedDuration" className="block text-sm font-medium text-gray-300 mb-2">
              المدة المتوقعة (اختياري)
            </label>
            <input
              id="expectedDuration"
              type="text"
              name="expectedDuration"
              value={formData.expectedDuration}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder="مثال: 30-60 دقيقة أو 3 ساعات"
            />
          </div>

          {/* رفع الصورة */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الصورة الرئيسية
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                  id="imageUpload"
                />
                <label
                  htmlFor="imageUpload"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                    uploading 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      اختر صورة
                    </>
                  )}
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    حذف الصورة
                  </button>
                )}
              </div>

              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-64 h-40 object-cover rounded-xl border border-gray-600"
                  />
                  {isCloudinaryUrl(imagePreview) && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Cloudinary
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Custom Questions Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الأسئلة المخصصة</label>
            <div className="space-y-3">
              {formData.customQuestions.map((q, idx) => (
                <div key={q.id} className="bg-gray-700/40 p-4 rounded-lg border border-gray-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">سؤال {idx + 1}</span>
                    <button type="button" onClick={() => removeCustomQuestion(idx)} className="text-red-400 hover:bg-red-500/20 p-1 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateCustomQuestion(idx,'question',e.target.value)}
                    placeholder="نص السؤال"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={q.type}
                      onChange={e=>updateCustomQuestion(idx,'type',e.target.value)}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    >
                      <option value="text">نص</option>
                      <option value="number">رقم</option>
                      <option value="select_single">اختيار واحد</option>
                      <option value="select_multiple">اختيار متعدد</option>
                      <option value="date">تاريخ</option>
                      <option value="file">مرفق</option>
                    </select>
                    <label className="inline-flex items-center text-gray-300 text-sm">
                      <input type="checkbox" checked={q.required} onChange={e=>updateCustomQuestion(idx,'required',e.target.checked)} className="mr-2" />
                      إجباري
                    </label>
                  </div>

                  {/* خيارات السؤال إذا كان من نوع اختيار */}
                  {(q.type === 'select_single' || q.type === 'select_multiple') && (
                    <div className="space-y-2">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={e => handleOptionChange(idx, optIdx, e.target.value)}
                            placeholder={`الخيار ${optIdx + 1}`}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                          />
                          {(q.options || []).length > 2 && (
                            <button type="button" onClick={() => removeOption(idx, optIdx)} className="text-red-400 hover:bg-red-500/20 p-1 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(idx)}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        إضافة خيار
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addCustomQuestion} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <Plus className="w-4 h-4" />
                إضافة سؤال
              </button>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'جاري الرفع...' : editingService ? 'تحديث الخدمة' : 'إضافة الخدمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal; 