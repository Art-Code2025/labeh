import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Phone, MessageCircle, User, MapPin, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  fetchProviders as apiFetchProviders,
  createProvider,
  updateProvider,
  deleteProvider
} from '../services/providersApi';

interface Provider {
  id: string;
  name: string;
  category: 'internal_delivery' | 'external_trips' | 'home_maintenance';
  whatsapp: string;
  services: string[];
  rating: number;
  available: boolean;
  specialties?: string[];
  destinations?: string[];
}

interface ProvidersManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProvidersManagement: React.FC<ProvidersManagementProps> = ({ isOpen, onClose }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'internal_delivery' as 'internal_delivery' | 'external_trips' | 'home_maintenance',
    whatsapp: '',
    services: [''],
    rating: 5,
    available: true,
    specialties: [''],
    destinations: ['']
  });

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await apiFetchProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      toast.error('فشل تحميل مزودي الخدمة.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const providerData = {
        ...formData,
        services: formData.services.filter(s => s.trim()),
        specialties: formData.specialties?.filter(s => s.trim()) || [],
        destinations: formData.destinations?.filter(s => s.trim()) || []
      };

      if (editingProvider) {
        await updateProvider(editingProvider.id, providerData);
        toast.success('تم تحديث المقدم بنجاح');
      } else {
        await createProvider(providerData);
        toast.success('تم إضافة المقدم بنجاح');
      }
      
      setShowAddModal(false);
      setEditingProvider(null);
      resetForm();
      fetchProviders();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المقدم؟')) return;

    try {
      await deleteProvider(id);
      toast.success('تم حذف المقدم بنجاح');
      fetchProviders();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      category: provider.category,
      whatsapp: provider.whatsapp,
      services: provider.services,
      rating: provider.rating,
      available: provider.available,
      specialties: provider.specialties || [''],
      destinations: provider.destinations || ['']
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'internal_delivery' as 'internal_delivery' | 'external_trips' | 'home_maintenance',
      whatsapp: '',
      services: [''],
      rating: 5,
      available: true,
      specialties: [''],
      destinations: ['']
    });
  };

  const addServiceField = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, '']
    }));
  };

  const removeServiceField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateServiceField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => i === index ? value : service)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gray-700 p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">إدارة مقدمي الخدمة</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setEditingProvider(null);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة مقدم جديد
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div key={provider.id} className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{provider.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-300">{provider.rating}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          provider.available 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {provider.available ? 'متاح' : 'غير متاح'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(provider)}
                        className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Phone className="w-4 h-4" />
                      <span>{provider.whatsapp}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MessageCircle className="w-4 h-4" />
                      <span>{provider.whatsapp}</span>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-2">الخدمات:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.services.slice(0, 3).map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                            +{provider.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">
                  {editingProvider ? 'تعديل مقدم الخدمة' : 'إضافة مقدم خدمة جديد'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الاسم</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">الفئة</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'internal_delivery' | 'external_trips' | 'home_maintenance' }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="internal_delivery">التوصيل الداخلي</option>
                      <option value="external_trips">الرحلات الخارجية</option>
                      <option value="home_maintenance">الصيانة المنزلية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">واتساب</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">التقييم</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
                    />
                    <label htmlFor="available" className="text-sm text-gray-300">متاح للعمل</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">الخدمات المقدمة</label>
                  {formData.services.map((service, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => updateServiceField(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="اسم الخدمة"
                      />
                      {formData.services.length > 1 && (
                        <button
                          onClick={() => removeServiceField(index)}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addServiceField}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                  >
                    إضافة خدمة
                  </button>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    {editingProvider ? 'تحديث' : 'إضافة'}
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvidersManagement; 