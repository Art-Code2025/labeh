import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Provider } from '../services/providersApi';
import { Category } from '../services/servicesApi';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingProvider: Provider | null;
  categories: Category[];
}

const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, onClose, onSave, editingProvider, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (editingProvider) {
        setFormData({
          name: editingProvider.name || '',
          phone: editingProvider.phone || '',
          category: editingProvider.category || ''
        });
      } else {
        setFormData({ name: '', phone: '', category: '' });
      }
    }
  }, [isOpen, editingProvider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.category) return;
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            {editingProvider ? 'تعديل مورّد' : 'إضافة مورّد جديد'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الاسم *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              placeholder="اسم المورّد"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">رقم واتساب *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              placeholder="مثال: 9665xxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">الفئة *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">اختر الفئة</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold transition-colors">إلغاء</button>
            <button type="submit" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg">
              {editingProvider ? 'تحديث المورّد' : 'إضافة المورّد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProviderModal; 