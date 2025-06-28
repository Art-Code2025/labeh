import React, { useState } from 'react';
import { MapPin, Clock, Phone, User, MessageSquare, Navigation } from 'lucide-react';

interface CustomBookingFormProps {
  serviceId: string;
  serviceName: string;
  category: string;
  categoryName: string;
  onSubmit: (formData: any) => void;
  loading?: boolean;
}

interface BaseFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  serviceDetails: string;
}

interface InternalDeliveryData extends BaseFormData {
  deliveryLocation: string;
  urgentDelivery: boolean;
}

interface ExternalTripsData extends BaseFormData {
  startLocation: string;
  destination: string;
  destinationType: 'khamis_mushait' | 'abha' | 'other';
  appointmentTime: string;
  returnTrip: boolean;
  passengers: number;
}

interface HomeMaintenanceData extends BaseFormData {
  issueDescription: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  preferredTime: string;
  imageUrls?: string[];
}

const CustomBookingForm: React.FC<CustomBookingFormProps> = ({
  serviceId,
  serviceName,
  category,
  categoryName,
  onSubmit,
  loading = false
}) => {
  const [baseData, setBaseData] = useState<BaseFormData>({
    fullName: '',
    phoneNumber: '',
    address: '',
    serviceDetails: ''
  });

  const [internalDeliveryData, setInternalDeliveryData] = useState<Partial<InternalDeliveryData>>({
    deliveryLocation: '',
    urgentDelivery: false
  });

  const [externalTripsData, setExternalTripsData] = useState<Partial<ExternalTripsData>>({
    startLocation: '',
    destination: '',
    destinationType: 'khamis_mushait',
    appointmentTime: '',
    returnTrip: false,
    passengers: 1
  });

  const [homeMaintenanceData, setHomeMaintenanceData] = useState<Partial<HomeMaintenanceData>>({
    issueDescription: '',
    urgencyLevel: 'medium',
    preferredTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let formData = {
      serviceId,
      serviceName,
      category,
      categoryName,
      ...baseData
    };

    // إضافة البيانات المخصصة حسب الفئة
    switch (category) {
      case 'internal_delivery':
        formData = { ...formData, ...internalDeliveryData };
        break;
      case 'external_trips':
        formData = { ...formData, ...externalTripsData };
        break;
      case 'home_maintenance':
        formData = { ...formData, ...homeMaintenanceData };
        break;
    }

    onSubmit(formData);
  };

  const getPriceDisplay = () => {
    switch (category) {
      case 'internal_delivery':
        return '20 ريال';
      case 'external_trips':
        if (externalTripsData.destinationType === 'khamis_mushait') {
          return '250 ريال';
        } else if (externalTripsData.destinationType === 'abha') {
          return '300 ريال';
        }
        return 'حسب الوجهة';
      case 'home_maintenance':
        return 'حسب نوع المشكلة';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* معلومات السعر */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">السعر المتوقع:</span>
          <span className="text-blue-400 font-bold text-lg">{getPriceDisplay()}</span>
        </div>
        {category === 'external_trips' && (
          <p className="text-sm text-gray-400 mt-2">الحد الأقصى: 9 ساعات</p>
        )}
      </div>

      {/* البيانات الأساسية */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">البيانات الأساسية</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline ml-2" />
            الاسم الكامل
          </label>
          <input
            type="text"
            value={baseData.fullName}
            onChange={(e) => setBaseData({...baseData, fullName: e.target.value})}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline ml-2" />
            رقم الجوال
          </label>
          <input
            type="tel"
            value={baseData.phoneNumber}
            onChange={(e) => setBaseData({...baseData, phoneNumber: e.target.value})}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline ml-2" />
            العنوان
          </label>
          <input
            type="text"
            value={baseData.address}
            onChange={(e) => setBaseData({...baseData, address: e.target.value})}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            required
          />
        </div>
      </div>

      {/* فورم التوصيل الداخلي */}
      {category === 'internal_delivery' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">تفاصيل التوصيل</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Navigation className="w-4 h-4 inline ml-2" />
              موقع التوصيل
            </label>
            <input
              type="text"
              value={internalDeliveryData.deliveryLocation}
              onChange={(e) => setInternalDeliveryData({...internalDeliveryData, deliveryLocation: e.target.value})}
              placeholder="مثال: صيدلية النهدي - طريق الملك فهد"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              required
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl">
            <input
              type="checkbox"
              id="urgentDelivery"
              checked={internalDeliveryData.urgentDelivery}
              onChange={(e) => setInternalDeliveryData({...internalDeliveryData, urgentDelivery: e.target.checked})}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="urgentDelivery" className="text-gray-300">
              توصيل عاجل (+10 ريال)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4 inline ml-2" />
              تفاصيل الطلب
            </label>
            <textarea
              value={baseData.serviceDetails}
              onChange={(e) => setBaseData({...baseData, serviceDetails: e.target.value})}
              placeholder="مثال: احضار دواء بنادول من أقرب صيدلية"
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white resize-none"
            />
          </div>
        </div>
      )}

      {/* فورم الرحلات الخارجية */}
      {category === 'external_trips' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">تفاصيل الرحلة</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline ml-2" />
              نقطة الانطلاق
            </label>
            <input
              type="text"
              value={externalTripsData.startLocation}
              onChange={(e) => setExternalTripsData({...externalTripsData, startLocation: e.target.value})}
              placeholder="مثال: منزلي - حي الصفا"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Navigation className="w-4 h-4 inline ml-2" />
              الوجهة
            </label>
            <select
              value={externalTripsData.destinationType}
              onChange={(e) => setExternalTripsData({...externalTripsData, destinationType: e.target.value as any})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="khamis_mushait">خميس مشيط (250 ريال)</option>
              <option value="abha">أبها (300 ريال)</option>
              <option value="other">وجهة أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الوجهة التفصيلية
            </label>
            <input
              type="text"
              value={externalTripsData.destination}
              onChange={(e) => setExternalTripsData({...externalTripsData, destination: e.target.value})}
              placeholder="مثال: مستشفى عسير المركزي - أبها"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline ml-2" />
                وقت الموعد
              </label>
              <input
                type="datetime-local"
                value={externalTripsData.appointmentTime}
                onChange={(e) => setExternalTripsData({...externalTripsData, appointmentTime: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                عدد المسافرين
              </label>
              <select
                value={externalTripsData.passengers}
                onChange={(e) => setExternalTripsData({...externalTripsData, passengers: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'شخص' : 'أشخاص'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-xl">
            <input
              type="checkbox"
              id="returnTrip"
              checked={externalTripsData.returnTrip}
              onChange={(e) => setExternalTripsData({...externalTripsData, returnTrip: e.target.checked})}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="returnTrip" className="text-gray-300">
              رحلة ذهاب وعودة
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ملاحظات إضافية أو تفاصيل التوقيت
            </label>
            <textarea
              value={baseData.serviceDetails}
              onChange={(e) => setBaseData({...baseData, serviceDetails: e.target.value})}
              placeholder="مثال: الموعد في المستشفى الساعة 10 صباحاً، والعودة بعد انتهاء الكشف"
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white resize-none"
            />
          </div>
        </div>
      )}

      {/* فورم الصيانة المنزلية */}
      {category === 'home_maintenance' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">تفاصيل المشكلة</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              وصف المشكلة
            </label>
            <textarea
              value={homeMaintenanceData.issueDescription}
              onChange={(e) => setHomeMaintenanceData({...homeMaintenanceData, issueDescription: e.target.value})}
              placeholder="مثال: يوجد تسريب تحت حوض المطبخ، والماء يتجمع على الأرض"
              rows={4}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              مستوى الاستعجال
            </label>
            <select
              value={homeMaintenanceData.urgencyLevel}
              onChange={(e) => setHomeMaintenanceData({...homeMaintenanceData, urgencyLevel: e.target.value as any})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="low">عادي - يمكن تأجيله</option>
              <option value="medium">متوسط - خلال يومين</option>
              <option value="high">عاجل - اليوم أو غداً</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline ml-2" />
              الوقت المفضل
            </label>
            <select
              value={homeMaintenanceData.preferredTime}
              onChange={(e) => setHomeMaintenanceData({...homeMaintenanceData, preferredTime: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
            >
              <option value="">أي وقت</option>
              <option value="morning">صباحاً (8-12)</option>
              <option value="afternoon">ظهراً (12-4)</option>
              <option value="evening">مساءً (4-8)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              تفاصيل إضافية
            </label>
            <textarea
              value={baseData.serviceDetails}
              onChange={(e) => setBaseData({...baseData, serviceDetails: e.target.value})}
              placeholder="أي تفاصيل إضافية تساعد الفني على فهم المشكلة أكثر"
              rows={2}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white resize-none"
            />
          </div>
        </div>
      )}

      {/* زر الإرسال */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg transition-all duration-200"
      >
        {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
      </button>
    </form>
  );
};

export default CustomBookingForm; 