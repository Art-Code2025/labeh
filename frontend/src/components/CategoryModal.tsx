import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Category } from '../services/servicesApi';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingCategory: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
      setFormData({
          name: editingCategory.name || '',
          description: editingCategory.description || '',
          icon: editingCategory.icon || '',
          color: editingCategory.color || '#3B82F6'
      });
    } else {
      setFormData({
        name: '',
        description: '',
          icon: '',
          color: '#3B82F6'
      });
      }
    }
  }, [isOpen, editingCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      return;
    }

    onSave(formData);
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editingCategory ? 'تعديل فئة' : 'إضافة فئة جديدة'}
              </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              اسم الفئة *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder="أدخل اسم الفئة"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              وصف الفئة *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400 resize-none"
              placeholder="وصف مختصر للفئة"
              required
            />
          </div>

          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-2">
              الأيقونة
            </label>
            <input
              id="icon"
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              placeholder="مثال: 🏠"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
              اللون
            </label>
            <input
              id="color"
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full h-12 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              {editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal; 