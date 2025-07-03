import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, Save, Calculator } from 'lucide-react';
import { Order } from '../services/ordersApi';
import { Provider } from '../services/providersApi';

interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'adminProfit'>) => Promise<void>;
  provider: Provider;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onSave, provider }) => {
  const [formData, setFormData] = useState({
    orderCost: '',
    profitPercentage: '30',
    orderDate: new Date().toISOString().split('T')[0], // تاريخ اليوم
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // حساب ربح الأدمن المتوقع
  const calculateProfit = () => {
    const cost = parseFloat(formData.orderCost) || 0;
    const percentage = parseFloat(formData.profitPercentage) || 0;
    return (cost * percentage) / 100;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderCost || parseFloat(formData.orderCost) <= 0) {
      newErrors.orderCost = 'يجب إدخال تكلفة صحيحة أكبر من صفر';
    }

    if (!formData.profitPercentage || parseFloat(formData.profitPercentage) < 0 || parseFloat(formData.profitPercentage) > 100) {
      newErrors.profitPercentage = 'يجب إدخال نسبة ربح بين 0 و 100';
    }

    if (!formData.orderDate) {
      newErrors.orderDate = 'يجب تحديد تاريخ الأوردر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        providerId: provider.id,
        providerName: provider.name,
        orderCost: parseFloat(formData.orderCost),
        profitPercentage: parseFloat(formData.profitPercentage),
        orderDate: new Date(formData.orderDate).toISOString(),
        notes: formData.notes.trim() || undefined
      };

      await onSave(orderData);
      
      // إعادة تعيين النموذج
      setFormData({
        orderCost: '',
        profitPercentage: '30',
        orderDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        orderCost: '',
        profitPercentage: '30',
        orderDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 relative">
        <button 
          onClick={handleClose} 
          disabled={loading}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            إضافة أوردر جديد
          </h3>
          <p className="text-gray-600 text-sm">
            للمورد: <span className="font-semibold text-gray-900">{provider.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* تكلفة الأوردر */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تكلفة الأوردر *
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.orderCost}
                onChange={(e) => setFormData(prev => ({ ...prev, orderCost: e.target.value }))}
                className={`w-full pr-10 pl-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.orderCost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            {errors.orderCost && (
              <p className="text-red-500 text-xs mt-1">{errors.orderCost}</p>
            )}
          </div>

          {/* نسبة الربح */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نسبة ربح الأدمن (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.profitPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, profitPercentage: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.profitPercentage ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.profitPercentage && (
              <p className="text-red-500 text-xs mt-1">{errors.profitPercentage}</p>
            )}
          </div>

          {/* ربح الأدمن المحسوب */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">ربح الأدمن المتوقع:</span>
              <span className="font-bold text-lg">
                {calculateProfit().toFixed(2)} ريال
              </span>
            </div>
          </div>

          {/* تاريخ الأوردر */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ الأوردر *
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                className={`w-full pr-10 pl-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.orderDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            </div>
            {errors.orderDate && (
              <p className="text-red-500 text-xs mt-1">{errors.orderDate}</p>
            )}
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="أي ملاحظات إضافية..."
                disabled={loading}
              />
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ الأوردر
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal; 