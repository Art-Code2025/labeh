import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Users, 
  Package,
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Menu,
  X,
  Zap,
  Tag,
  Loader2,
  Bell,
  Clock,
  MapPin,
  Phone,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Volume2,
  FileText,
  Send,
  Home
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

import { DocumentSnapshot } from 'firebase/firestore';

// Services
import { servicesApi, categoriesApi, Service, Category } from './services/servicesApi';
import { fetchBookings, Booking, updateBooking, bookingsAPI } from './services/bookingsApi';
import { testCloudinaryConnection } from './services/cloudinary';
import { providersApi, Provider } from './services/providersApi';

// Components
import ServiceModal from './components/ServiceModal';
import CategoryModal from './components/CategoryModal';
import ProviderModal from './components/ProviderModal';

// Add custom scrollbar styles and animations
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.6);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.8);
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customScrollbarStyles;
  document.head.appendChild(styleSheet);
}

function Dashboard() {
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'categories' | 'providers' | 'bookings'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Real-time bookings
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [lastBookingUpdate, setLastBookingUpdate] = useState<Date>(new Date());
  const lastBookingIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Provider modal states
  const [showProviderModalForm, setShowProviderModalForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  
  // Booking edit modal states - جديد
  const [showBookingEditModal, setShowBookingEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  // Provider selection states - محدث
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedBookingForSend, setSelectedBookingForSend] = useState<any | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.6;
    audioRef.current.preload = 'auto';
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Load data on mount and when activeTab changes
  useEffect(() => {
    loadData(true); // `true` to reset data
    if (activeTab === 'bookings') {
      startRealTimeBookings();
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTab]);

  const loadData = async (reset = false) => {
    const start = Date.now();
    try {
      setLoading(true);
      setError(null);
      console.log('[Dashboard] بدء تحميل البيانات...', { time: new Date().toISOString() });
      if(reset) {
        // Reset states
        setServices([]);
        setCategories([]);
        setProviders([]);
        setBookings([]);
        setLastVisible(null);
        setHasMore(true); 
      }

      // تحميل الفئات دائماً لأنها مطلوبة في جميع المودالز
      const categoriesData = await categoriesApi.getAll();
      setCategories(categoriesData);

      let logDetails: any = { categories: categoriesData.length };
      switch(activeTab) {
        case 'services': {
          const serviceResponse = await servicesApi.getAll(null, 10);
          setServices(serviceResponse.services);
          setLastVisible(serviceResponse.lastVisible);
          setHasMore(serviceResponse.lastVisible !== null);
          logDetails.services = serviceResponse.services.length;
          break;
        }
        case 'categories': {
          // الفئات تم تحميلها فعلاً في الأعلى
          break;
        }
        case 'providers': {
          const providerResponse = await providersApi.getAll();
          setProviders(providerResponse);
          logDetails.providers = providerResponse.length;
          break;
        }
        case 'bookings': {
          const bookingsData = await fetchBookings();
          // ترتيب الحجوزات من الأحدث إلى الأقدم
          const sortedBookings = bookingsData.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // الأحدث أولاً
          });
          setBookings(sortedBookings);
          lastBookingIdsRef.current = new Set(sortedBookings.map(booking => booking.id));
          logDetails.bookings = sortedBookings.length;
          break;
        }
        case 'overview': {
          const [servicesData, providersData, bookingsData] = await Promise.all([
            servicesApi.getAll(null, 5),
            providersApi.getAll(),
            fetchBookings()
          ]);
          setServices(servicesData.services);
          setProviders(providersData);
          setBookings(bookingsData);
          logDetails = {
            ...logDetails,
            services: servicesData.services.length,
            providers: providersData.length,
            bookings: bookingsData.length
          };
          break;
        }
      }
      setLastBookingUpdate(new Date());
      console.log('[Dashboard] ✅ تم تحميل البيانات بنجاح', {
        ...logDetails,
        time: new Date().toISOString(),
        durationMs: Date.now() - start
      });
    } catch (error: any) {
      console.error('[Dashboard] ❌ خطأ أثناء تحميل البيانات:', error, { time: new Date().toISOString() });
      setError(error.message || 'فشل في تحميل البيانات');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    try {
        switch(activeTab) {
            case 'services':
                const { services: newServices, lastVisible: newLastVisible } = await servicesApi.getAll(lastVisible, 10);
                setServices((prev: Service[]) => [...prev, ...newServices]);
                setLastVisible(newLastVisible);
                setHasMore(newLastVisible !== null);
                break;
            // Add cases for other tabs if they need "load more"
        }
    } catch (error) {
        console.error('Error loading more data:', error);
        toast.error('فشل في تحميل المزيد');
    } finally {
        setLoadingMore(false);
    }
  };

  // Real-time bookings polling
  const startRealTimeBookings = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const freshBookings = await fetchBookings();
        // ترتيب الحجوزات من الأحدث إلى الأقدم
        const sortedBookings = freshBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // الأحدث أولاً
        });
        
        setBookings(prevBookings => {
          const currentIds = new Set(prevBookings.map(booking => booking.id));
          const newBookings = sortedBookings.filter(booking => !lastBookingIdsRef.current.has(booking.id));
          
          if (newBookings.length > 0) {
            const increment = newBookings.length;
            setNewBookingsCount(prev => prev + increment);
            
            // Play notification sound for new bookings
            if (audioRef.current && newBookings.some(booking => !currentIds.has(booking.id))) {
              audioRef.current.play().catch(() => {
                // Ignore audio play errors
              });
            }
          }
          
          lastBookingIdsRef.current = new Set(sortedBookings.map(booking => booking.id));
          return sortedBookings;
        });
        
        setLastBookingUpdate(new Date());
      } catch (error) {
        console.error('Error fetching real-time bookings:', error);
      }
    }, 30000); // كل 30 ثانية
  };

  // Service handlers
  const handleServiceSave = async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingService) {
        await servicesApi.update(editingService.id, serviceData);
        toast.success('✅ تم تحديث الخدمة بنجاح');
      } else {
        await servicesApi.create(serviceData);
        toast.success('✅ تم إضافة الخدمة بنجاح');
      }
      
      setShowServiceModal(false);
      setEditingService(null);
      await loadData();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('❌ فشل في حفظ الخدمة');
    }
  };

  const handleServiceEdit = (service: Service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleServiceDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        await servicesApi.delete(id);
        toast.success('✅ تم حذف الخدمة بنجاح');
        await loadData();
      } catch (error) {
        console.error('Error deleting service:', error);
        toast.error('❌ فشل في حذف الخدمة');
      }
    }
  };

  // Category handlers
  const handleCategorySave = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryData);
        toast.success('✅ تم تحديث الفئة بنجاح');
      } else {
        await categoriesApi.create(categoryData);
        toast.success('✅ تم إضافة الفئة بنجاح');
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      await loadData();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('❌ فشل في حفظ الفئة');
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategoryDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      try {
        await categoriesApi.delete(id);
        toast.success('✅ تم حذف الفئة بنجاح');
        await loadData();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('❌ فشل في حذف الفئة');
      }
    }
  };

  // Booking handlers
  const handleBookingStatusUpdate = async (bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const success = await updateBooking(bookingId, status);
      if (success) {
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status, updatedAt: new Date().toISOString() }
              : booking
          )
        );
        
        toast.success(`تم ${status === 'confirmed' ? 'تأكيد' : status === 'completed' ? 'إكمال' : 'إلغاء'} الحجز بنجاح`);
      } else {
        toast.error('فشل في تحديث حالة الحجز');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الحجز');
    }
  };

  const handleTestCloudinary = async () => {
    try {
    setLoading(true);
      toast.info('🔍 جاري اختبار Cloudinary...');
      
      const isConnected = await testCloudinaryConnection();
      if (isConnected) {
        toast.success('✅ Cloudinary يعمل بشكل مثالي!');
      } else {
        toast.error('❌ مشكلة في Cloudinary');
      }
    } catch (error) {
      console.error('Error testing Cloudinary:', error);
      toast.error('❌ فشل في اختبار Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (dateInput: Date | string) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  /* =======================  بيانات المورّدين  ======================= */
  // يمكن لاحقاً جلبها من API، حالياً ثابتة لسهولة الاختبار
  // const providers: Provider[] = [
  //   { id: 'd1', name: 'سائق توصيل داخلي 1', phone: '966501111111', category: 'internal_delivery' },
  //   { id: 'd2', name: 'سائق توصيل داخلي 2', phone: '966502222222', category: 'internal_delivery' },
  //   { id: 'e1', name: 'سائق رحلات خارجية', phone: '966503333333', category: 'external_trips' },
  //   { id: 'm1', name: 'فني صيانة منزلية', phone: '966504444444', category: 'home_maintenance' },
  // ];

  /* =======================  حالة مودال اختيار المورّد  ======================= */
  const openProviderModal = (booking: any) => {
    setSelectedBookingForSend(booking);
    setShowProviderModal(true);
  };

  const closeProviderModal = () => {
    setShowProviderModal(false);
    setSelectedBookingForSend(null);
  };

  const buildWhatsAppMessage = (booking: any) => {
    let msg = `🔔 *حجز جديد لخدمة ${booking.serviceName}*\n\n`;
    msg += `👤 *العميل:* ${booking.customerName}\n`;
    msg += `📞 *الهاتف:* ${booking.customerPhone}\n`;
    msg += `🏠 *العنوان:* ${booking.address}\n`;
    msg += `🆔 *رقم الحجز:* ${booking.id}\n`;
    msg += `📅 *تاريخ الحجز:* ${new Date(booking.createdAt).toLocaleString('ar-SA')}\n\n`;
    
    if (booking.serviceDetails) {
      msg += `📝 *تفاصيل الخدمة:* ${booking.serviceDetails}\n\n`;
    }
    
    // إضافة الأسئلة المخصصة مع معلومات كاملة
    if (booking.customAnswersWithQuestions && Object.keys(booking.customAnswersWithQuestions).length > 0) {
      msg += `🔍 *أسئلة مخصصة:*\n`;
      Object.entries(booking.customAnswersWithQuestions).forEach(([key, data]: [string, any]) => {
        const answer = Array.isArray(data.answer) ? data.answer.join(', ') : String(data.answer);
        msg += `• *${data.question}:* ${answer}\n`;
      });
      msg += '\n';
    } else if (booking.customAnswers && Object.keys(booking.customAnswers).length > 0) {
      msg += `📋 *تفاصيل إضافية:*\n`;
      Object.entries(booking.customAnswers).forEach(([key, val]) => {
        const value = Array.isArray(val) ? val.join(', ') : String(val);
        msg += `• *${key}:* ${value}\n`;
      });
      msg += '\n';
    }
    
    // معلومات إضافية حسب نوع الخدمة
    if (booking.destination) {
      msg += `📍 *الوجهة:* ${booking.destination}\n`;
    }
    if (booking.startLocation) {
      msg += `🚩 *نقطة البداية:* ${booking.startLocation}\n`;
    }
    if (booking.preferredTime) {
      msg += `⏰ *الوقت المفضل:* ${booking.preferredTime}\n`;
    }
    if (booking.urgentDelivery) {
      msg += `🚨 *توصيل عاجل* ⚡\n`;
    }
    
    msg += '\n⚡ *يرجى التواصل مع العميل في أقرب وقت ممكن*\n';
    msg += '🙏 شكراً لتعاونكم';
    
    return encodeURIComponent(msg);
  };

  const handleSendToProvider = (provider: Provider) => {
    if (!selectedBookingForSend) return;
    const message = buildWhatsAppMessage(selectedBookingForSend);
    const waUrl = `https://wa.me/${provider.phone}?text=${message}`;
    window.open(waUrl, '_blank');
    toast.success(`📤 تم فتح واتساب لإرسال الحجز إلى ${provider.name}`);
    closeProviderModal();
  };

  // ----- Provider handlers -----
  const handleProviderSave = async (data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingProvider) {
        await providersApi.update(editingProvider.id, data);
        toast.success('✅ تم تحديث المورّد بنجاح');
      } else {
        await providersApi.create(data);
        toast.success('✅ تم إضافة المورّد بنجاح');
      }
      setShowProviderModalForm(false);
      setEditingProvider(null);
      await loadData();
    } catch (err) {
      toast.error('❌ فشل في حفظ المورّد');
    }
  };

  const handleProviderEdit = (p: Provider) => {
    setEditingProvider(p);
    setShowProviderModalForm(true);
  };

  const handleProviderDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المورّد؟')) {
      try {
        await providersApi.delete(id);
        toast.success('✅ تم حذف المورّد');
        await loadData();
      } catch (err) {
        toast.error('❌ فشل في حذف المورّد');
      }
    }
  };

  // إضافة modal جديد لتعديل الحجوزات
  const BookingEditModal = ({ booking, isOpen, onClose, onSave, onDelete }: {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<Booking>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  }) => {
    const [formData, setFormData] = useState({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      notes: '',
      status: 'pending' as Booking['status']
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
      if (booking) {
        setFormData({
          customerName: booking.customerName || '',
          customerPhone: booking.customerPhone || '',
          customerEmail: booking.customerEmail || '',
          notes: booking.notes || '',
          status: booking.status
        });
      }
    }, [booking]);

    const handleSave = async () => {
      if (!booking) return;
      setSaving(true);
      try {
        await onSave(booking.id, formData);
        onClose();
      } catch (error) {
        console.error('Error saving booking:', error);
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async () => {
      if (!booking) return;
      if (!window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;
      
      setDeleting(true);
      try {
        await onDelete(booking.id);
        onClose();
      } catch (error) {
        console.error('Error deleting booking:', error);
      } finally {
        setDeleting(false);
      }
    };

    if (!isOpen || !booking) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-500" />
            تعديل الحجز
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم العميل</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة الحجز</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Booking['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">معلق</option>
                <option value="confirmed">مؤكد</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  حفظ التغييرات
                </>
              )}
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  حذف
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // دوال جديدة لحفظ وحذف الحجوزات
  const handleBookingEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setShowBookingEditModal(true);
  };

  const handleBookingSave = async (bookingId: string, data: Partial<Booking>) => {
    try {
      await bookingsAPI.update(bookingId, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      toast.success('✅ تم تحديث الحجز بنجاح');
      setShowBookingEditModal(false);
      setEditingBooking(null);
      await loadData(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('❌ فشل في تحديث الحجز');
    }
  };

  const handleBookingDelete = async (bookingId: string) => {
    try {
      await bookingsAPI.delete(bookingId);
      toast.success('✅ تم حذف الحجز بنجاح');
      setShowBookingEditModal(false);
      setEditingBooking(null);
      await loadData(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('❌ فشل في حذف الحجز');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-white/20 rounded-full animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">جاري تحميل لوحة التحكم...</p>
          <p className="text-gray-500 text-sm mt-2">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto text-center border border-gray-700/50 shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">عذراً، حدث خطأ</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-100 transform transition-all duration-300 ease-in-out z-50 shadow-xl ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-105">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">لبيه</h1>
                  <p className="text-xs text-gray-500">لوحة التحكم الذكية</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
              { id: 'categories', label: 'إدارة الفئات', icon: Tag, color: 'from-purple-500 to-purple-600' },
              { id: 'services', label: 'إدارة الخدمات', icon: Package, color: 'from-green-500 to-green-600' },
              { id: 'providers', label: 'إدارة المورّدين', icon: Users, color: 'from-orange-500 to-orange-600' },
              { id: 'bookings', label: 'إدارة الحجوزات', icon: Calendar, color: 'from-red-500 to-red-600' }
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as any);
                  setIsSidebarOpen(false);
                  if (id === 'bookings') setNewBookingsCount(0);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden ${
                  activeTab === id
                    ? `bg-gradient-to-r ${color} text-white shadow-lg transform scale-105`
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Icon className={`w-5 h-5 transition-all duration-300 ${
                    activeTab === id ? 'animate-pulse' : 'group-hover:scale-110'
                  }`} />
                  <span>{label}</span>
                </div>
                {id === 'bookings' && newBookingsCount > 0 && (
                  <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
                    {newBookingsCount}
                  </div>
                )}
                {activeTab !== id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Enhanced Footer */}
          <div className="p-4 border-t border-gray-100 space-y-2 bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={handleTestCloudinary}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-all duration-300 group transform hover:scale-105"
            >
              <Zap className="w-5 h-5 group-hover:text-yellow-500 transition-colors group-hover:animate-pulse" />
              <span>اختبار Cloudinary</span>
            </button>
            <button
              onClick={() => loadData()}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-all duration-300 group transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5 group-hover:animate-spin transition-all" />
              <span>تحديث البيانات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="lg:mr-80">
        {/* Enhanced Top Bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md text-sm"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">الصفحة الرئيسية</span>
              </Link>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {activeTab === 'overview' && '📊 نظرة عامة'}
                  {activeTab === 'categories' && '🏷️ إدارة الفئات'}
                  {activeTab === 'services' && '📦 إدارة الخدمات'}
                  {activeTab === 'providers' && '👥 إدارة المورّدين'}
                  {activeTab === 'bookings' && '📅 إدارة الحجوزات'}
                </h2>
                {activeTab === 'bookings' && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="hidden sm:inline">مباشر</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-500 animate-fade-in hidden md:block">
                آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Overview Tab - Enhanced */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'الخدمات', count: services.length, icon: Package, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
                  { label: 'الفئات', count: categories.length, icon: Tag, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
                  { label: 'الحجوزات', count: bookings.length, icon: Calendar, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
                  { label: 'معلق', count: bookings.filter(b => b.status === 'pending').length, icon: Clock, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className={`${stat.bgColor} rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-slide-up`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                      </div>
                      <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg transform transition-all duration-300 hover:scale-110`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">آخر الحجوزات</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">معلق ({bookings.filter(b => b.status === 'pending').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">مؤكد ({bookings.filter(b => b.status === 'confirmed').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">مكتمل ({bookings.filter(b => b.status === 'completed').length})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد حجوزات حالياً</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {bookings.slice(0, 5).map((booking, index) => (
                      <div 
                        key={booking.id} 
                        className="p-6 hover:bg-gray-50 transition-all duration-300 animate-slide-up"
                        style={{animationDelay: `${0.5 + index * 0.1}s`}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <span className="font-semibold text-gray-900">{booking.customerName}</span>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {booking.status === 'pending' && 'معلق'}
                                {booking.status === 'confirmed' && 'مؤكد'}
                                {booking.status === 'completed' && 'مكتمل'}
                                {booking.status === 'cancelled' && 'ملغي'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  <span>{booking.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Package className="w-4 h-4" />
                                  <span className="font-medium">{booking.serviceName}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{booking.startLocation || booking.deliveryLocation || 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTimeAgo(booking.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Custom Answers - محسن */}
                            {(booking.customAnswersWithQuestions && Object.keys(booking.customAnswersWithQuestions).length > 0) ? (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  أسئلة مخصصة:
                                </h4>
                                <div className="space-y-2">
                                  {Object.entries(booking.customAnswersWithQuestions).map(([key, data]: [string, { question: string; answer: any; type: string }]) => (
                                    <div key={key} className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-0 flex-shrink-0">{data.question}:</span>
                                      <span className="text-gray-800 break-words">
                                        {Array.isArray(data.answer) ? data.answer.join(', ') : String(data.answer)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (booking.customAnswers && Object.keys(booking.customAnswers).length > 0) ? (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  تفاصيل إضافية:
                                </h4>
                                <div className="space-y-2">
                                  {Object.entries(booking.customAnswers).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-0 flex-shrink-0">{key}:</span>
                                      <span className="text-gray-800 break-words">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {/* Service Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                تفاصيل الخدمة:
                              </h4>
                              <div className="space-y-2 text-sm">
                                {booking.destination && (
                                  <div><span className="text-gray-600 font-medium">الوجهة:</span> <span className="text-gray-800">{booking.destination}</span></div>
                                )}
                                {booking.issueDescription && (
                                  <div><span className="text-gray-600 font-medium">وصف المشكلة:</span> <span className="text-gray-800">{booking.issueDescription}</span></div>
                                )}
                                {booking.preferredTime && (
                                  <div><span className="text-gray-600 font-medium">الوقت المفضل:</span> <span className="text-gray-800">{booking.preferredTime}</span></div>
                                )}
                                {booking.urgentDelivery && (
                                  <div className="text-red-600 font-medium">🚨 توصيل عاجل</div>
                                )}
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                                <h4 className="text-sm font-semibold text-yellow-700 mb-1">ملاحظات:</h4>
                                <p className="text-sm text-yellow-600">{booking.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {/* أزرار الإدارة الجديدة */}
                            <div className="flex flex-col gap-2 mb-2">
                              <button
                                onClick={() => openProviderModal(booking)}
                                className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
                                title="إرسال للمورد"
                              >
                                <Send className="w-3 h-3" />
                                إرسال للمورد
                              </button>
                              
                              <button
                                onClick={() => handleBookingEdit(booking)}
                                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
                                title="تعديل الحجز"
                              >
                                <Edit className="w-3 h-3" />
                                تعديل
                              </button>
                              
                              <button
                                onClick={() => handleBookingDelete(booking.id)}
                                className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
                                title="حذف الحجز"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف
                              </button>
                            </div>

                            {/* أزرار تغيير الحالة */}
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                                >
                                  تأكيد
                                </button>
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                                >
                                  إلغاء
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                              >
                                إكمال
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Categories Tab */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">الفئات</h3>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة فئة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <div 
                    key={category.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg animate-slide-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
                          {category.icon || '📦'}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{category.name}</h4>
                          <p className="text-gray-500 text-sm">
                            {services.filter(s => s.category === category.id).length} خدمة
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCategoryEdit(category)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleCategoryDelete(category.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Services Tab */}
          {activeTab === 'services' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">الخدمات</h3>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة خدمة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <div 
                    key={service.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg animate-slide-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg">{service.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleServiceEdit(service)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleServiceDelete(service.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.homeShortDescription}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        {service.categoryName}
                      </span>
                      {service.price && (
                        <span className="text-amber-600 font-bold">
                          {service.price}
                        </span>
                      )}
                    </div>
                    {service.mainImage && (
                      <img 
                        src={service.mainImage} 
                        alt={service.name}
                        className="w-full h-32 object-cover rounded-xl mt-3 border border-gray-100"
                      />
                    )}
                  </div>
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400"
                  >
                    {loadingMore ? 'جاري التحميل...' : 'تحميل المزيد'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Providers Tab */}
          {activeTab === 'providers' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">المورّدون</h3>
                <button
                  onClick={() => setShowProviderModalForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  إضافة مورّد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider, index) => (
                  <div 
                    key={provider.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg animate-slide-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{provider.name}</h4>
                        <p className="text-gray-500 text-sm">{provider.phone}</p>
                      </div>
                      <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                        {categories.find(c => c.id === provider.category)?.name || provider.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleProviderEdit(provider)} 
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      >
                        <Edit className="w-4 h-4"/>
                      </button>
                      <button 
                        onClick={() => handleProviderDelete(provider.id)} 
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-gray-900">الحجوزات</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm animate-pulse">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="hidden sm:inline">تحديث مباشر</span>
                  </div>
                </div>
                <button
                  onClick={() => loadData()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-700">إجمالي الحجوزات: <span className="text-gray-900 font-bold">{bookings.length}</span></p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">معلق ({bookings.filter(b => b.status === 'pending').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">مؤكد ({bookings.filter(b => b.status === 'confirmed').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">مكتمل ({bookings.filter(b => b.status === 'completed').length})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد حجوزات حالياً</p>
                    <p className="text-gray-400 text-sm mt-2">ستظهر الحجوزات الجديدة هنا تلقائياً</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {bookings.map((booking, index) => (
                      <div 
                        key={booking.id} 
                        className="p-6 hover:bg-gray-50 transition-all duration-300 animate-slide-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">{booking.serviceName}</h4>
                              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                {booking.status === 'pending' && 'معلق'}
                                {booking.status === 'confirmed' && 'مؤكد'}
                                {booking.status === 'completed' && 'مكتمل'}
                                {booking.status === 'cancelled' && 'ملغي'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">{booking.customerName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4 text-green-500" />
                                <span className="text-sm">{booking.customerPhone}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span className="text-sm">{booking.startLocation || booking.deliveryLocation || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-purple-500" />
                                <span className="text-sm">{formatTimeAgo(booking.createdAt)}</span>
                              </div>
                            </div>

                            {/* Custom Answers - محسن */}
                            {(booking.customAnswersWithQuestions && Object.keys(booking.customAnswersWithQuestions).length > 0) ? (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  أسئلة مخصصة:
                                </h4>
                                <div className="space-y-2">
                                  {Object.entries(booking.customAnswersWithQuestions).map(([key, data]: [string, { question: string; answer: any; type: string }]) => (
                                    <div key={key} className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-0 flex-shrink-0">{data.question}:</span>
                                      <span className="text-gray-800 break-words">
                                        {Array.isArray(data.answer) ? data.answer.join(', ') : String(data.answer)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (booking.customAnswers && Object.keys(booking.customAnswers).length > 0) ? (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  تفاصيل إضافية:
                                </h4>
                                <div className="space-y-2">
                                  {Object.entries(booking.customAnswers).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-2 text-sm">
                                      <span className="text-gray-600 font-medium min-w-0 flex-shrink-0">{key}:</span>
                                      <span className="text-gray-800 break-words">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {/* Service Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                تفاصيل الخدمة:
                              </h4>
                              <div className="space-y-2 text-sm">
                                {booking.destination && (
                                  <div><span className="text-gray-600 font-medium">الوجهة:</span> <span className="text-gray-800">{booking.destination}</span></div>
                                )}
                                {booking.issueDescription && (
                                  <div><span className="text-gray-600 font-medium">وصف المشكلة:</span> <span className="text-gray-800">{booking.issueDescription}</span></div>
                                )}
                                {booking.preferredTime && (
                                  <div><span className="text-gray-600 font-medium">الوقت المفضل:</span> <span className="text-gray-800">{booking.preferredTime}</span></div>
                                )}
                                {booking.urgentDelivery && (
                                  <div className="text-red-600 font-medium">🚨 توصيل عاجل</div>
                                )}
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                                <h4 className="text-sm font-semibold text-yellow-700 mb-1">ملاحظات:</h4>
                                <p className="text-sm text-yellow-600">{booking.notes}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {/* أزرار الإدارة الجديدة */}
                            <div className="flex flex-col gap-2 mb-2">
                              <button
                                onClick={() => openProviderModal(booking)}
                                className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
                                title="إرسال للمورد"
                              >
                                <Send className="w-3 h-3" />
                                إرسال للمورد
                              </button>
                              
                              <button
                                onClick={() => handleBookingEdit(booking)}
                                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
                                title="تعديل الحجز"
                              >
                                <Edit className="w-3 h-3" />
                                تعديل
                              </button>
                              
                              <button
                                onClick={() => handleBookingDelete(booking.id)}
                                className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-1"
                                title="حذف الحجز"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف
                              </button>
                            </div>

                            {/* أزرار تغيير الحالة */}
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                                >
                                  تأكيد
                                </button>
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'cancelled')}
                                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                                >
                                  إلغاء
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                              >
                                إكمال
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(null);
        }}
        onSave={handleServiceSave}
        editingService={editingService}
        categories={categories}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleCategorySave}
        editingCategory={editingCategory}
      />

      {/* Modal اختيار المورّد */}
      {showProviderModal && selectedBookingForSend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 relative">
            <button onClick={closeProviderModal} className="absolute top-3 left-3 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-400" />
              إرسال الحجز إلى المورد
            </h3>
            <p className="text-sm text-gray-400 mb-4">اختر المورد لإرسال تفاصيل الحجز عبر واتساب:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {providers.filter(p => p.category === selectedBookingForSend.serviceCategory).map(provider => (
                <div key={provider.id} className="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg border border-gray-600">
                  <div className="text-white text-sm">{provider.name}</div>
                  <button
                    onClick={() => handleSendToProvider(provider)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                  >
                    إرسال
                  </button>
                </div>
              ))}
              {providers.filter(p => p.category === selectedBookingForSend.serviceCategory).length === 0 && (
                <p className="text-center text-gray-500 text-sm">لا يوجد مورّدون مرتبطون بهذه الفئة.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Provider Modal */}
      <ProviderModal
        isOpen={showProviderModalForm}
        onClose={() => {
          setShowProviderModalForm(false);
          setEditingProvider(null);
        }}
        onSave={handleProviderSave}
        editingProvider={editingProvider}
        categories={categories}
      />

      {/* Booking Edit Modal - جديد */}
      <BookingEditModal
        booking={editingBooking}
        isOpen={showBookingEditModal}
        onClose={() => {
          setShowBookingEditModal(false);
          setEditingBooking(null);
        }}
        onSave={handleBookingSave}
        onDelete={handleBookingDelete}
      />

      {/* Enhanced Toast Container */}
      <ToastContainer
        position="top-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: 'rgba(31, 41, 55, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(75, 85, 99, 0.3)',
          borderRadius: '12px',
          color: 'white'
        }}
      />
    </div>
  );
}

export default Dashboard;