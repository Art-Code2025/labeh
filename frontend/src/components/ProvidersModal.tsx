import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Star, Phone, User, MapPin } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  category: string;
  whatsapp: string;
  services: string[];
  rating: number;
  available: boolean;
  specialties?: string[];
  destinations?: string[];
}

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails: string;
  status: string;
  createdAt: string;
  // بيانات إضافية حسب الفئة
  deliveryLocation?: string;
  urgentDelivery?: boolean;
  startLocation?: string;
  destination?: string;
  destinationType?: string;
  appointmentTime?: string;
  returnTrip?: boolean;
  passengers?: number;
  issueDescription?: string;
  urgencyLevel?: string;
  preferredTime?: string;
}

interface ProvidersModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProvidersModal: React.FC<ProvidersModalProps> = ({ booking, isOpen, onClose }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      fetchProviders(booking.serviceCategory);
    }
  }, [isOpen, booking]);

  const fetchProviders = async (category: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/.netlify/functions/providers?category=${category}`);
      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = (provider: Provider) => {
    if (!booking) return '';

    let message = `🔥 *طلب جديد من منصة لبيه*\n\n`;
    message += `👤 *اسم العميل:* ${booking.fullName}\n`;
    message += `📞 *رقم الجوال:* ${booking.phoneNumber}\n`;
    message += `📍 *العنوان:* ${booking.address}\n`;
    message += `🛠️ *الخدمة المطلوبة:* ${booking.serviceName}\n\n`;

    // إضافة تفاصيل خاصة بكل فئة
    if (booking.serviceCategory === 'internal_delivery') {
      message += `📦 *تفاصيل التوصيل:*\n`;
      if (booking.deliveryLocation) {
        message += `• موقع التوصيل: ${booking.deliveryLocation}\n`;
      }
      if (booking.urgentDelivery) {
        message += `• ⚡ توصيل عاجل\n`;
      }
      message += `• تفاصيل الطلب: ${booking.serviceDetails}\n`;
    } else if (booking.serviceCategory === 'external_trips') {
      message += `🚗 *تفاصيل الرحلة:*\n`;
      if (booking.startLocation) {
        message += `• نقطة الانطلاق: ${booking.startLocation}\n`;
      }
      if (booking.destination) {
        message += `• الوجهة: ${booking.destination}\n`;
      }
      if (booking.appointmentTime) {
        message += `• وقت الموعد: ${new Date(booking.appointmentTime).toLocaleString('ar-SA')}\n`;
      }
      if (booking.passengers) {
        message += `• عدد المسافرين: ${booking.passengers}\n`;
      }
      if (booking.returnTrip) {
        message += `• رحلة ذهاب وعودة ✓\n`;
      }
      if (booking.serviceDetails) {
        message += `• ملاحظات: ${booking.serviceDetails}\n`;
      }
    } else if (booking.serviceCategory === 'home_maintenance') {
      message += `🔧 *تفاصيل المشكلة:*\n`;
      if (booking.issueDescription) {
        message += `• وصف المشكلة: ${booking.issueDescription}\n`;
      }
      if (booking.urgencyLevel) {
        const urgencyText = {
          low: 'عادي',
          medium: 'متوسط',
          high: 'عاجل'
        }[booking.urgencyLevel] || booking.urgencyLevel;
        message += `• مستوى الاستعجال: ${urgencyText}\n`;
      }
      if (booking.preferredTime) {
        const timeText = {
          morning: 'صباحاً (8-12)',
          afternoon: 'ظهراً (12-4)',
          evening: 'مساءً (4-8)'
        }[booking.preferredTime] || booking.preferredTime;
        message += `• الوقت المفضل: ${timeText}\n`;
      }
      if (booking.serviceDetails) {
        message += `• تفاصيل إضافية: ${booking.serviceDetails}\n`;
      }
    }

    message += `\n⏰ *تاريخ الطلب:* ${new Date(booking.createdAt).toLocaleString('ar-SA')}\n`;
    message += `🆔 *رقم الطلب:* ${booking.id}\n\n`;
    message += `يرجى التواصل مع العميل في أقرب وقت ممكن.\nشكراً لكم 🙏`;

    return encodeURIComponent(message);
  };

  const openWhatsApp = (provider: Provider) => {
    const message = generateWhatsAppMessage(provider);
    const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gray-700 p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">مقدمو الخدمة</h2>
              <p className="text-gray-300 text-sm">طلب: {booking.serviceName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* معلومات الطلب */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">تفاصيل الطلب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">العميل:</span>
                <span className="text-white">{booking.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">الجوال:</span>
                <span className="text-white">{booking.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">العنوان:</span>
                <span className="text-white">{booking.address}</span>
              </div>
            </div>
          </div>

          {/* مقدمو الخدمة */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-300">جاري تحميل مقدمي الخدمة...</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-300">لا يوجد مقدمو خدمة متاحون حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                مقدمو الخدمة المتاحون ({providers.length})
              </h3>
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{provider.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-300">{provider.rating}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{provider.whatsapp}</span>
                        </div>
                        
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
                              +{provider.services.length - 3} أخرى
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openWhatsApp(provider)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvidersModal; 