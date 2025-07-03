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
  Home,
  Mail,
  DollarSign,
  TrendingUp,
  BarChart,
  PieChart,
  Activity
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { DocumentSnapshot } from 'firebase/firestore';

// Services
import { servicesApi, categoriesApi, Service, Category } from './services/servicesApi';
import { fetchBookings, Booking, updateBooking, bookingsAPI } from './services/bookingsApi';
import { testCloudinaryConnection } from './services/cloudinary';
import { providersApi, Provider } from './services/providersApi';
import { ordersAPI, Order, ProviderOrderSummary } from './services/ordersApi';

// Components
import ServiceModal from './components/ServiceModal';
import CategoryModal from './components/CategoryModal';
import ProviderModal from './components/ProviderModal';
import AddOrderModal from './components/AddOrderModal';

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

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.6s ease-out;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'categories' | 'providers' | 'bookings' | 'orders'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Real-time bookings
  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const [lastBookingUpdate, setLastBookingUpdate] = useState<Date>(new Date());
  const lastBookingIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<{ play: () => Promise<void> } | null>(null);

  // Provider modal states
  const [showProviderModalForm, setShowProviderModalForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  
  // Booking edit modal states - جديد
  const [showBookingEditModal, setShowBookingEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  // Provider selection states - محدث
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [selectedBookingForSend, setSelectedBookingForSend] = useState<any | null>(null);

  // Orders states - جديد
  const [orders, setOrders] = useState<Order[]>([]);
  const [providerOrderSummaries, setProviderOrderSummaries] = useState<ProviderOrderSummary[]>([]);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [selectedProviderForOrder, setSelectedProviderForOrder] = useState<Provider | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  // Initialize notification sound with better setup
  useEffect(() => {
    // تجربة أصوات مختلفة للإشعارات
    const initSound = async () => {
      try {
        // إنشاء صوت بسيط باستخدام Web Audio API كبديل
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
        audioRef.current = {
          play: async () => {
            try {
              // محاولة تشغيل ملف الصوت أولاً
              const audio = new Audio('/notification.mp3');
              audio.volume = 0.7;
              await audio.play();
            } catch (err) {
              // إذا فشل، استخدم صوت مولد
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
              oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.3);
            }
          }
        };
      } catch (error) {
        console.log('تعذر إعداد الصوت:', error);
        audioRef.current = { play: () => Promise.resolve() };
      }
    };
    
    initSound();
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Load data on mount and when activeTab changes
  useEffect(() => {
    loadData(true); // `true` to reset data
    if (activeTab === 'bookings' || activeTab === 'overview') {
      startRealTimeBookings();
    } else {
      // إيقاف real-time polling عند الخروج من الحجوزات أو نظرة عامة
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
        setOrders([]);
        setProviderOrderSummaries([]);
        setLastVisible(null);
        setHasMore(true); 
      }

      // تحميل الفئات والموردين والأوردرات دائماً لأنها مطلوبة في جميع الحالات
      const [categoriesData, providersData, ordersData] = await Promise.all([
        categoriesApi.getAll(),
        providersApi.getAll(),
        ordersAPI.getAll()
      ]);
      
      setCategories(categoriesData);
      setProviders(providersData);
      setOrders(ordersData);
      
      console.log('📂 [Dashboard] تم تحميل الفئات:', categoriesData.length);
      console.log('📂 [Dashboard] تفاصيل الفئات:', categoriesData.map(c => ({ id: c.id, name: c.name })));
      console.log('👥 [Dashboard] تم تحميل الموردين (عام):', providersData.length);
      console.log('👥 [Dashboard] تفاصيل الموردين (عام):', providersData.map(p => ({ id: p.id, name: p.name, category: p.category, phone: p.phone })));
      console.log('💰 [Dashboard] تم تحميل الأوردرات:', ordersData.length);

      let logDetails: any = { categories: categoriesData.length, providers: providersData.length, orders: ordersData.length };
      
      switch(activeTab) {
        case 'services': {
          const serviceResponse = await servicesApi.getAll(null, undefined); // جيب كل الخدمات
          console.log('🔍 [Dashboard] services tab - عدد الخدمات المسترد:', serviceResponse.services.length);
          console.log('🔍 [Dashboard] services tab - أول 3 خدمات:', serviceResponse.services.slice(0, 3).map(s => ({ id: s.id, name: s.name })));
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
          // الموردين تم تحميلهم فعلاً في الأعلى
          // تحميل ملخص الأوردرات للموردين
          const providerSummaries = await ordersAPI.getAllProvidersSummary();
          setProviderOrderSummaries(providerSummaries);
          console.log('📊 [Dashboard] تم تحميل ملخص أوردرات الموردين:', providerSummaries.length);
          break;
        }
        case 'orders': {
          // الأوردرات تم تحميلها فعلاً في الأعلى
          const providerSummaries = await ordersAPI.getAllProvidersSummary();
          setProviderOrderSummaries(providerSummaries);
          console.log('📊 [Dashboard] تم تحميل ملخص أوردرات الموردين للأوردرات:', providerSummaries.length);
          break;
        }
        case 'bookings': {
          const bookingsData = await fetchBookings();
          console.log('📅 [Dashboard] تم تحميل الحجوزات:', bookingsData.length);
          console.log('📅 [Dashboard] أول 3 حجوزات:', bookingsData.slice(0, 3).map(b => ({ 
            id: b.id, 
            serviceName: b.serviceName, 
            serviceCategory: b.serviceCategory,
            serviceId: b.serviceId,
            categoryName: b.categoryName
          })));
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
          const [servicesData, bookingsData] = await Promise.all([
            servicesApi.getAll(null, undefined), // جيب كل الخدمات مش 5 بس
            fetchBookings()
          ]);
          console.log('🔍 [Dashboard] عدد الخدمات المسترد:', servicesData.services.length);
          console.log('🔍 [Dashboard] أول 3 خدمات:', servicesData.services.slice(0, 3).map(s => ({ id: s.id, name: s.name })));
          console.log('📅 [Dashboard] تم تحميل الحجوزات في overview:', bookingsData.length);
          console.log('📅 [Dashboard] أول 3 حجوزات في overview:', bookingsData.slice(0, 3).map(b => ({ 
            id: b.id, 
            serviceName: b.serviceName, 
            serviceCategory: b.serviceCategory,
            serviceId: b.serviceId,
            categoryName: b.categoryName
          })));
          
          // تحميل ملخص الأوردرات للنظرة العامة أيضاً
          const providerSummaries = await ordersAPI.getAllProvidersSummary();
          setProviderOrderSummaries(providerSummaries);
          
          setServices(servicesData.services);
          // ترتيب الحجوزات من الأحدث إلى الأقدم
          const sortedBookings = bookingsData.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA; // الأحدث أولاً
          });
          setBookings(sortedBookings);
          logDetails = {
            ...logDetails,
            services: servicesData.services.length,
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
        const newBookings = await fetchBookings();
        console.log('📊 [Dashboard] تم جلب الحجوزات:', newBookings.length);
        
        // إضافة logging مفصل لكل حجز
        newBookings.forEach((booking, index) => {
          console.log(`📋 [Dashboard] الحجز ${index + 1}:`, {
            id: booking.id,
            serviceName: booking.serviceName,
            price: booking.price,
            selectedDestination: booking.selectedDestination,
            startLocation: booking.startLocation,
            endLocation: booking.endLocation,
            status: booking.status,
            fullData: booking
          });
        });
        
        const currentBookingIds = new Set(newBookings.map(b => b.id));
        const previousBookingIds = lastBookingIdsRef.current;
        
        // Check for new bookings
        const newBookingIds = [...currentBookingIds].filter(id => !previousBookingIds.has(id));
        
        if (newBookingIds.length > 0 && previousBookingIds.size > 0) {
          setNewBookingsCount(prev => prev + newBookingIds.length);
          setLastBookingUpdate(new Date());
          
          // Play notification sound
          if (audioRef.current) {
            try {
              await audioRef.current.play();
            } catch (err) {
              console.log('Could not play notification sound:', err);
            }
          }
          
          // Show toast notification
          toast.success(`🔔 حجز جديد! عدد الحجوزات الجديدة: ${newBookingIds.length}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
        
        lastBookingIdsRef.current = currentBookingIds;
        // ترتيب الحجوزات من الأحدث إلى الأقدم
        const sortedRealTimeBookings = newBookings.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // الأحدث أولاً
        });
        setBookings(sortedRealTimeBookings);
      } catch (error) {
        console.error('❌ [Dashboard] خطأ في جلب الحجوزات الجديدة:', error);
      }
    }, 3000); // Poll every 3 seconds
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
    console.log('🔍 [Dashboard] === فتح مودال المورد ===');
    console.log('📋 [Dashboard] تفاصيل الحجز الكاملة:', JSON.stringify(booking, null, 2));
    console.log('🏷️ [Dashboard] فئة الخدمة الحالية:', booking.serviceCategory);
    console.log('🔧 [Dashboard] معرف الخدمة:', booking.serviceId);
    console.log('🏪 [Dashboard] اسم الخدمة:', booking.serviceName);
    console.log('📂 [Dashboard] اسم الفئة:', booking.categoryName);
    console.log('👥 [Dashboard] عدد الموردين الإجمالي:', providers.length);
    console.log('📝 [Dashboard] قائمة جميع الموردين:', providers.map(p => ({ id: p.id, name: p.name, category: p.category, phone: p.phone })));
    console.log('🎯 [Dashboard] الموردين المتاحين للفئة الحالية:', providers.filter(p => p.category === booking.serviceCategory));
    
    // إضافة منطق للحصول على categoryId من الخدمة إذا لم يكن موجود
    let bookingWithCategory = { ...booking };
    if (!booking.serviceCategory) {
      console.log('⚠️ [Dashboard] لا توجد فئة خدمة في الحجز - سأبحث عنها');
      
      // محاولة الحصول على الفئة من serviceId
      if (booking.serviceId) {
        console.log('🔍 [Dashboard] البحث بـ serviceId:', booking.serviceId);
        const service = services.find(s => s.id === booking.serviceId);
        console.log('🎯 [Dashboard] الخدمة الموجودة:', service);
        if (service) {
          bookingWithCategory.serviceCategory = service.categoryId;
          console.log('✅ [Dashboard] تم العثور على الفئة من الخدمة:', service.categoryId);
        }
      }
      // محاولة الحصول على الفئة من اسم الفئة
      else if (booking.categoryName) {
        console.log('🔍 [Dashboard] البحث بـ categoryName:', booking.categoryName);
        const category = categories.find(c => c.name === booking.categoryName);
        console.log('🎯 [Dashboard] الفئة الموجودة:', category);
        if (category) {
          bookingWithCategory.serviceCategory = category.id;
          console.log('✅ [Dashboard] تم العثور على الفئة من اسم الفئة:', category.id);
        }
      }
      // محاولة الحصول على الفئة من اسم الخدمة
      else if (booking.serviceName) {
        console.log('🔍 [Dashboard] البحث بـ serviceName:', booking.serviceName);
        const service = services.find(s => s.name === booking.serviceName);
        console.log('🎯 [Dashboard] الخدمة الموجودة:', service);
        if (service) {
          bookingWithCategory.serviceCategory = service.categoryId;
          console.log('✅ [Dashboard] تم العثور على الفئة من اسم الخدمة:', service.categoryId);
        }
      }
    } else {
      console.log('✅ [Dashboard] فئة الخدمة موجودة مسبقاً:', booking.serviceCategory);
    }
    
    console.log('📦 [Dashboard] الحجز مع الفئة النهائية:', bookingWithCategory);
    console.log('🔍 [Dashboard] الفئة النهائية للبحث:', bookingWithCategory.serviceCategory);
    console.log('🎯 [Dashboard] الموردين المتاحين للفئة المحدثة:', providers.filter(p => p.category === bookingWithCategory.serviceCategory));
    console.log('📊 [Dashboard] تفاصيل المقارنة:');
    providers.forEach(provider => {
      console.log(`   - ${provider.name}: ${provider.category} === ${bookingWithCategory.serviceCategory} ? ${provider.category === bookingWithCategory.serviceCategory}`);
    });
    
    setSelectedBookingForSend(bookingWithCategory);
    setShowProviderModal(true);
  };

  const closeProviderModal = () => {
    setShowProviderModal(false);
    setSelectedBookingForSend(null);
  };

  // دالة لتنظيف رقم الهاتف وتحويله للشكل المناسب لواتساب
  const formatPhoneForWhatsApp = (phone: string): string => {
    console.log('📞 [Dashboard] === تنسيق رقم الهاتف ===');
    console.log('📞 [Dashboard] الرقم الأصلي:', phone);
    console.log('📞 [Dashboard] نوع البيانات:', typeof phone);
    console.log('📞 [Dashboard] القيمة الخام:', JSON.stringify(phone));
    
    if (!phone || phone === null || phone === undefined) {
      console.log('⚠️ [Dashboard] رقم الهاتف فارغ أو null');
      return '';
    }
    
    // تحويل إلى string إذا لم يكن كذلك
    const phoneStr = String(phone).trim();
    console.log('📱 [Dashboard] بعد التحويل لـ string وإزالة المسافات:', phoneStr);
    
    if (phoneStr.length === 0) {
      console.log('⚠️ [Dashboard] رقم الهاتف فارغ بعد trim');
      return '';
    }
    
    // إزالة جميع الرموز غير الرقمية
    let cleanPhone = phoneStr.replace(/[^\d]/g, '');
    console.log('🧹 [Dashboard] بعد إزالة الرموز غير الرقمية:', cleanPhone);
    
    if (cleanPhone.length === 0) {
      console.log('⚠️ [Dashboard] لا توجد أرقام في النص');
      return '';
    }
    
    // إزالة الصفر الأول إذا كان موجود
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
      console.log('🔢 [Dashboard] بعد إزالة الصفر الأول:', cleanPhone);
    }
    
    // إزالة كود البلد إذا كان موجود مسبقاً وإعادة إضافته
    if (cleanPhone.startsWith('966')) {
      cleanPhone = cleanPhone.substring(3);
      console.log('🇸🇦 [Dashboard] بعد إزالة كود البلد الموجود:', cleanPhone);
    }
    
    // التحقق من صحة الرقم (الأرقام السعودية تبدأ بـ 5 عادة وطولها 9 أرقام)
    if (cleanPhone.length < 8 || cleanPhone.length > 10) {
      console.warn('⚠️ [Dashboard] طول الرقم غير صحيح:', cleanPhone.length);
    }
    
    // إضافة كود السعودية
    const finalPhone = '966' + cleanPhone;
    console.log('✅ [Dashboard] الرقم النهائي:', finalPhone);
    
    // التحقق النهائي
    if (finalPhone.length < 12 || finalPhone.length > 15) {
      console.warn('⚠️ [Dashboard] طول الرقم النهائي غير طبيعي:', finalPhone.length);
    }
    
    return finalPhone;
  };

  const buildWhatsAppMessage = (booking: any) => {
    // بناء الرسالة بدون encoding مبكر
    let msg = `🔔 حجز جديد لخدمة ${booking.serviceName}\n\n`;
    
    // معلومات العميل الأساسية
    msg += `👤 العميل: ${booking.fullName || booking.customerName || 'غير محدد'}\n`;
    msg += `📞 الهاتف: ${booking.phoneNumber || booking.customerPhone || 'غير محدد'}\n`;
    
    // العنوان الأساسي
    if (booking.address) {
      msg += `🏠 العنوان: ${booking.address}\n`;
    }
    
    // تفاصيل الرحلة والمواقع
    if (booking.startLocation) {
      msg += `🚩 نقطة البداية: ${booking.startLocation}\n`;
    }
    if (booking.endLocation) {
      msg += `🏁 نقطة النهاية: ${booking.endLocation}\n`;
    }
    if (booking.selectedDestination || booking.destination) {
      msg += `📍 الوجهة: ${booking.selectedDestination || booking.destination}\n`;
    }
    if (booking.deliveryLocation && booking.deliveryLocation !== booking.address) {
      msg += `📦 موقع التوصيل: ${booking.deliveryLocation}\n`;
    }
    
    // معلومات الحجز
    msg += `🆔 رقم الحجز: ${booking.id}\n`;
    msg += `📅 تاريخ الحجز: ${new Date(booking.createdAt).toLocaleString('ar-SA')}\n`;
    
    // السعر إذا كان موجود
    if (booking.price) {
      msg += `💰 السعر: ${booking.price}\n`;
    }
    
    msg += '\n';
    
    // تفاصيل الخدمة والملاحظات
    if (booking.serviceDetails) {
      msg += `📝 تفاصيل الخدمة: ${booking.serviceDetails}\n\n`;
    }
    
    if (booking.notes) {
      msg += `📋 ملاحظات: ${booking.notes}\n\n`;
    }
    
    if (booking.issueDescription) {
      msg += `🔧 وصف المشكلة: ${booking.issueDescription}\n\n`;
    }
    
    // الأسئلة المخصصة مع الأسئلة الكاملة
    if (booking.customAnswersWithQuestions && Object.keys(booking.customAnswersWithQuestions).length > 0) {
      msg += `❓ أسئلة مخصصة:\n`;
      Object.entries(booking.customAnswersWithQuestions).forEach(([key, data]: [string, any]) => {
        const answer = Array.isArray(data.answer) ? data.answer.join(', ') : String(data.answer);
        msg += `• ${data.question}: ${answer}\n`;
      });
      msg += '\n';
    } 
    // الإجابات المخصصة العادية إذا لم توجد الأسئلة المفصلة
    else if (booking.customAnswers && Object.keys(booking.customAnswers).length > 0) {
      msg += `📋 تفاصيل إضافية:\n`;
      Object.entries(booking.customAnswers).forEach(([key, val]) => {
        const value = Array.isArray(val) ? val.join(', ') : String(val);
        msg += `• ${key}: ${value}\n`;
      });
      msg += '\n';
    }
    
    // معلومات التوقيت والأولوية
    if (booking.preferredTime) {
      msg += `⏰ الوقت المفضل: ${booking.preferredTime}\n`;
    }
    
    if (booking.urgentDelivery) {
      msg += `🚨 توصيل عاجل - أولوية عالية!\n`;
    }
    
    // معلومات إضافية متنوعة
    if (booking.urgencyLevel) {
      const urgencyText = {
        low: 'منخفضة',
        medium: 'متوسطة', 
        high: 'عالية'
      };
      msg += `⚡ مستوى الأولوية: ${urgencyText[booking.urgencyLevel as keyof typeof urgencyText] || booking.urgencyLevel}\n`;
    }
    
    if (booking.appointmentTime) {
      msg += `📅 موعد الخدمة: ${booking.appointmentTime}\n`;
    }
    
    if (booking.passengers) {
      msg += `👥 عدد الركاب: ${booking.passengers}\n`;
    }
    
    // رسالة الختام
    msg += '\n⚡ يرجى التواصل مع العميل في أقرب وقت ممكن';
    msg += '\n🙏 شكراً لتعاونكم';
    
    console.log('💬 [Dashboard] الرسالة النهائية قبل encoding:', msg);
    
    // استخدام encodeURIComponent هنا فقط
    const encodedMsg = encodeURIComponent(msg);
    console.log('🔐 [Dashboard] الرسالة بعد encoding:', encodedMsg);
    
    return encodedMsg;
  };

  const handleSendToProvider = (provider: Provider) => {
    console.log('📤 [Dashboard] === إرسال للمورد ===');
    console.log('👤 [Dashboard] تفاصيل المورد الكاملة:', JSON.stringify(provider, null, 2));
    console.log('📞 [Dashboard] رقم المورد الأصلي من الكائن:', provider.phone);
    console.log('🔍 [Dashboard] نوع البيانات لرقم الهاتف:', typeof provider.phone);
    console.log('📱 [Dashboard] طول الرقم:', provider.phone?.length);
    
    if (!selectedBookingForSend) {
      console.log('⚠️ [Dashboard] لا يوجد حجز محدد للإرسال');
      return;
    }
    
    if (!provider.phone) {
      console.error('❌ [Dashboard] رقم الهاتف فارغ للمورد:', provider.name);
      toast.error('رقم هاتف المورد غير متوفر');
      return;
    }
    
    console.log('📝 [Dashboard] بناء الرسالة...');
    const message = buildWhatsAppMessage(selectedBookingForSend);
    
    console.log('📞 [Dashboard] تنسيق رقم الهاتف...');
    const formattedPhone = formatPhoneForWhatsApp(provider.phone);
    
    console.log('🔗 [Dashboard] بناء رابط واتساب...');
    const waUrl = `https://wa.me/${formattedPhone}?text=${message}`;
    
    console.log('🔗 [Dashboard] رابط واتساب النهائي:', waUrl);
    console.log('📞 [Dashboard] الرقم المستخدم في الرابط:', formattedPhone);
    console.log('🌐 [Dashboard] فتح النافذة...');
    
    // إضافة محاولة فتح النافذة مع error handling
    try {
      const newWindow = window.open(waUrl, '_blank');
      if (!newWindow) {
        console.error('❌ [Dashboard] فشل في فتح النافذة - ربما محجوبة بواسطة popup blocker');
        toast.error('فشل في فتح واتساب - تأكد من السماح للنوافذ المنبثقة');
      } else {
        console.log('✅ [Dashboard] تم فتح النافذة بنجاح');
        toast.success(`📤 تم فتح واتساب لإرسال الحجز إلى ${provider.name}`);
      }
    } catch (error) {
      console.error('❌ [Dashboard] خطأ في فتح النافذة:', error);
      toast.error('حدث خطأ في فتح واتساب');
    }
    
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

  // ----- Orders handlers -----
  const handleAddOrderClick = (provider: Provider) => {
    setSelectedProviderForOrder(provider);
    setShowAddOrderModal(true);
  };

  const handleOrderSave = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'adminProfit'>) => {
    try {
      setLoadingOrders(true);
      console.log('💰 [Dashboard] إضافة أوردر جديد:', orderData);
      
      await ordersAPI.create(orderData);
      toast.success('✅ تم إضافة الأوردر بنجاح');
      
      // إعادة تحميل البيانات لإظهار الأوردر الجديد
      await loadData();
      
      setShowAddOrderModal(false);
      setSelectedProviderForOrder(null);
    } catch (error) {
      console.error('❌ [Dashboard] فشل في إضافة الأوردر:', error);
      toast.error('❌ فشل في إضافة الأوردر');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderDelete = async (orderId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الأوردر؟')) {
      try {
        setLoadingOrders(true);
        await ordersAPI.delete(orderId);
        toast.success('✅ تم حذف الأوردر بنجاح');
        
        // إعادة تحميل البيانات
        await loadData();
      } catch (error) {
        console.error('❌ [Dashboard] فشل في حذف الأوردر:', error);
        toast.error('❌ فشل في حذف الأوردر');
      } finally {
        setLoadingOrders(false);
      }
    }
  };

  // Helper functions for formatting
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2) + ' ريال';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthName = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long'
    });
  };

  // إضافة modal جديد لتعديل الحجوزات - ديناميكي
  const BookingEditModal = ({ booking, isOpen, onClose, onSave, onDelete }: {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<Booking>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
  }) => {
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
      if (booking) {
        // إنشاء form data ديناميكي من بيانات الحجز
        const dynamicFormData: any = {};
        
        // الحقول الأساسية
        const basicFields = [
          'customerName', 'customerPhone', 'customerEmail', 'fullName', 'phoneNumber', 'email',
          'address', 'status', 'notes', 'serviceDetails', 'startLocation', 'endLocation',
          'destination', 'selectedDestination', 'issueDescription', 'preferredTime',
          'deliveryLocation', 'urgentDelivery', 'bookingDate'
        ];
        
        basicFields.forEach(field => {
          if (booking[field as keyof Booking] !== undefined && booking[field as keyof Booking] !== null) {
            dynamicFormData[field] = booking[field as keyof Booking];
          }
        });
        
        // التعامل مع الحقول الخاصة
        if (booking.customAnswers) {
          Object.keys(booking.customAnswers).forEach(key => {
            dynamicFormData[`customAnswers_${key}`] = booking.customAnswers![key];
          });
        }
        
        if (booking.customAnswersWithQuestions) {
          Object.keys(booking.customAnswersWithQuestions).forEach(key => {
            dynamicFormData[`customAnswersWithQuestions_${key}`] = booking.customAnswersWithQuestions![key].answer;
          });
        }
        
        setFormData(dynamicFormData);
      }
    }, [booking]);

    const handleSave = async () => {
      if (!booking) return;
      setSaving(true);
      try {
        // تحضير البيانات للحفظ
        const updateData: any = {};
        
        // الحقول الأساسية
        const basicFields = [
          'customerName', 'customerPhone', 'customerEmail', 'fullName', 'phoneNumber', 'email',
          'address', 'status', 'notes', 'serviceDetails', 'startLocation', 'endLocation',
          'destination', 'selectedDestination', 'issueDescription', 'preferredTime',
          'deliveryLocation', 'urgentDelivery', 'bookingDate'
        ];
        
        basicFields.forEach(field => {
          if (formData[field] !== undefined) {
            updateData[field] = formData[field];
          }
        });
        
        // التعامل مع customAnswers
        const customAnswers: any = {};
        const customAnswersWithQuestions: any = {};
        
        Object.keys(formData).forEach(key => {
          if (key.startsWith('customAnswers_')) {
            const originalKey = key.replace('customAnswers_', '');
            customAnswers[originalKey] = formData[key];
          } else if (key.startsWith('customAnswersWithQuestions_')) {
            const originalKey = key.replace('customAnswersWithQuestions_', ''); 
            if (booking.customAnswersWithQuestions && booking.customAnswersWithQuestions[originalKey]) {
              customAnswersWithQuestions[originalKey] = {
                ...booking.customAnswersWithQuestions[originalKey],
                answer: formData[key]
              };
            }
          }
        });
        
        if (Object.keys(customAnswers).length > 0) {
          updateData.customAnswers = customAnswers;
        }
        
        if (Object.keys(customAnswersWithQuestions).length > 0) {
          updateData.customAnswersWithQuestions = customAnswersWithQuestions;
        }
        
        await onSave(booking.id, updateData);
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

    const renderField = (key: string, value: any) => {
      const label = getFieldLabel(key);
      
      if (key === 'status') {
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <select
              value={formData[key] || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">معلق</option>
              <option value="confirmed">مؤكد</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        );
      }
      
      if (key === 'urgentDelivery') {
        return (
          <div key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={key}
              checked={!!formData[key]}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, [key]: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={key} className="text-sm font-medium text-gray-700">{label}</label>
          </div>
        );
      }
      
      if (key === 'notes' || key === 'serviceDetails' || key === 'issueDescription') {
        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <textarea
              value={formData[key] || ''}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      }
      
      return (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <input
            type={key.includes('email') ? 'email' : key.includes('phone') || key.includes('Phone') ? 'tel' : 'text'}
            value={formData[key] || ''}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, [key]: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      );
    };
    
    const getFieldLabel = (key: string): string => {
      const labels: Record<string, string> = {
        customerName: 'اسم العميل',
        fullName: 'الاسم الكامل',
        customerPhone: 'رقم هاتف العميل',
        phoneNumber: 'رقم الهاتف',
        customerEmail: 'بريد العميل',
        email: 'البريد الإلكتروني',
        address: 'العنوان',
        status: 'حالة الحجز',
        notes: 'ملاحظات',
        serviceDetails: 'تفاصيل الخدمة',
        startLocation: 'نقطة البداية',
        endLocation: 'نقطة النهاية',
        destination: 'الوجهة',
        selectedDestination: 'الوجهة المختارة',
        issueDescription: 'وصف المشكلة',
        preferredTime: 'الوقت المفضل',
        deliveryLocation: 'موقع التوصيل',
        urgentDelivery: 'توصيل عاجل',
        bookingDate: 'تاريخ الحجز'
      };
      
      if (key.startsWith('customAnswers_')) {
        return key.replace('customAnswers_', 'سؤال مخصص: ');
      }
      
      if (key.startsWith('customAnswersWithQuestions_')) {
        const originalKey = key.replace('customAnswersWithQuestions_', '');
        if (booking?.customAnswersWithQuestions?.[originalKey]) {
          return booking.customAnswersWithQuestions[originalKey].question;
        }
        return originalKey;
      }
      
      return labels[key] || key;
    };

    if (!isOpen || !booking) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full border border-gray-200 relative max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-500" />
            تعديل الحجز - {booking.serviceName}
          </h3>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.keys(formData).map(key => renderField(key, formData[key]))}
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
              { id: 'overview', label: 'الصفحة الرئيسية', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
              { id: 'categories', label: 'إدارة الفئات', icon: Tag, color: 'from-purple-500 to-purple-600' },
              { id: 'services', label: 'إدارة الخدمات', icon: Package, color: 'from-green-500 to-green-600' },
              { id: 'providers', label: 'إدارة المورّدين', icon: Users, color: 'from-orange-500 to-orange-600' },
              { id: 'bookings', label: 'إدارة الحجوزات', icon: Calendar, color: 'from-red-500 to-red-600' },
              { id: 'orders', label: 'إدارة الأوردرات', icon: DollarSign, color: 'from-green-600 to-green-700' }
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
            <div className="text-center text-xs text-gray-500">
              © 2024 لبيه - جميع الحقوق محفوظة
            </div>
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
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md text-sm"
                title="تحديث الصفحة"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">الرئيسية</span>
              </button>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {activeTab === 'overview' && '📊 الصفحة الرئيسية'}
                  {activeTab === 'categories' && '🏷️ إدارة الفئات'}
                  {activeTab === 'services' && '📦 إدارة الخدمات'}
                  {activeTab === 'providers' && '👥 إدارة المورّدين'}
                  {activeTab === 'bookings' && '📅 إدارة الحجوزات'}
                  {activeTab === 'orders' && '💰 إدارة الأوردرات'}
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

              {/* إحصائيات الأوردرات والأرباح - جديد */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(() => {
                  const totalOrders = orders.length;
                  const totalCost = orders.reduce((sum, order) => sum + order.orderCost, 0);
                  const totalProfit = orders.reduce((sum, order) => sum + order.adminProfit, 0);
                  
                  return [
                    { 
                      label: 'إجمالي الأوردرات', 
                      value: totalOrders.toString(), 
                      icon: DollarSign, 
                      color: 'from-green-500 to-green-600', 
                      bg: 'bg-green-50',
                      suffix: 'أوردر'
                    },
                    { 
                      label: 'إجمالي التكلفة', 
                      value: formatCurrency(totalCost), 
                      icon: TrendingUp, 
                      color: 'from-blue-500 to-blue-600', 
                      bg: 'bg-blue-50',
                      suffix: ''
                    },
                    { 
                      label: 'إجمالي الأرباح (30%)', 
                      value: formatCurrency(totalProfit), 
                      icon: PieChart, 
                      color: 'from-emerald-500 to-emerald-600', 
                      bg: 'bg-emerald-50',
                      suffix: ''
                    }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className={`${stat.bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-slide-up`}
                      style={{animationDelay: `${(index + 4) * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          {stat.suffix && <p className="text-gray-500 text-xs mt-1">{stat.suffix}</p>}
                        </div>
                        <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg transform transition-all duration-300 hover:scale-110`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Enhanced Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: '0.4s'}}>
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">آخر الحجوزات</h3>
                      <div className="flex items-center gap-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs animate-pulse">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span>مباشر</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>معلق ({bookings.filter(b => b.status === 'pending').length})</span>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>مؤكد ({bookings.filter(b => b.status === 'confirmed').length})</span>
                      </div>
                      <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-1 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>مكتمل ({bookings.filter(b => b.status === 'completed').length})</span>
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
                        className="p-4 hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-sm flex flex-wrap items-center gap-2">
                              <span className="min-w-0 truncate">{booking.serviceName || 'خدمة غير محددة'}</span>
                              {booking.categoryName && (
                                <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs whitespace-nowrap">{booking.categoryName}</span>
                              )}
                              {booking.price && (
                                <span className="text-amber-600 font-bold text-xs whitespace-nowrap">{booking.price}</span>
                              )}
                            </h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border whitespace-nowrap ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status === 'pending' && 'معلق'}
                              {booking.status === 'confirmed' && 'مؤكد'}
                              {booking.status === 'completed' && 'مكتمل'}
                              {booking.status === 'cancelled' && 'ملغي'}
                              {booking.status === 'in_progress' && 'قيد التنفيذ'}
                            </span>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{booking.fullName || booking.customerName || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{booking.phoneNumber || booking.customerPhone || 'غير محدد'}</span>
                              </div>
                              <div className="col-span-1 sm:col-span-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="break-words line-clamp-2">{booking.address || booking.startLocation || booking.deliveryLocation || booking.destination || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{formatTimeAgo(booking.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* تفاصيل مبسطة */}
                          {(booking.destination || booking.selectedDestination || booking.issueDescription) && (
                            <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                              {(booking.selectedDestination || booking.destination) && (
                                <div className="text-xs">
                                  <span className="font-medium text-green-700">🗺️ الوجهة: </span>
                                  <span className="text-green-800">{booking.selectedDestination || booking.destination}</span>
                                </div>
                              )}
                              {booking.issueDescription && (
                                <div className="text-xs mt-1">
                                  <span className="font-medium text-green-700">🔧 المشكلة: </span>
                                  <span className="text-green-800">{booking.issueDescription}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* تفاصيل إضافية مفصلة */}
                          <div className="space-y-2">
                            {/* معلومات الرحلة والمواقع */}
                            {(booking.startLocation || booking.endLocation) && (
                              <div className="bg-cyan-50 rounded-lg p-2 border border-cyan-100">
                                <div className="text-xs space-y-1">
                                  {booking.startLocation && (
                                    <div>
                                      <span className="font-medium text-cyan-700">🚩 نقطة البداية: </span>
                                      <span className="text-cyan-800">{booking.startLocation}</span>
                                    </div>
                                  )}
                                  {booking.endLocation && (
                                    <div>
                                      <span className="font-medium text-cyan-700">🏁 نقطة النهاية: </span>
                                      <span className="text-cyan-800">{booking.endLocation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* الملاحظات وتفاصيل الخدمة */}
                            {(booking.notes || booking.serviceDetails) && (
                              <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                                <div className="text-xs space-y-1">
                                  {booking.notes && (
                                    <div>
                                      <span className="font-medium text-yellow-700">📝 ملاحظات: </span>
                                      <span className="text-yellow-800">{booking.notes}</span>
                                    </div>
                                  )}
                                  {booking.serviceDetails && (
                                    <div>
                                      <span className="font-medium text-yellow-700">🔧 تفاصيل الخدمة: </span>
                                      <span className="text-yellow-800">{booking.serviceDetails}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* الأسئلة المخصصة */}
                            {booking.customAnswersWithQuestions && Object.keys(booking.customAnswersWithQuestions).length > 0 && (
                              <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                                <div className="text-xs">
                                  <div className="font-medium text-purple-700 mb-1">❓ أسئلة مخصصة:</div>
                                  {Object.entries(booking.customAnswersWithQuestions).map(([key, data]: [string, any]) => (
                                    <div key={key} className="mb-1">
                                      <span className="font-medium text-purple-600">• {data.question}: </span>
                                      <span className="text-purple-800">
                                        {Array.isArray(data.answer) ? data.answer.join(', ') : String(data.answer)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* إجابات مخصصة إضافية */}
                            {booking.customAnswers && Object.keys(booking.customAnswers).length > 0 && !booking.customAnswersWithQuestions && (
                              <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                                <div className="text-xs">
                                  <div className="font-medium text-indigo-700 mb-1">📋 تفاصيل إضافية:</div>
                                  {Object.entries(booking.customAnswers).map(([key, value]) => (
                                    <div key={key} className="mb-1">
                                      <span className="font-medium text-indigo-600">• {key}: </span>
                                      <span className="text-indigo-800">
                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* معلومات إضافية */}
                            {(booking.preferredTime || booking.urgentDelivery || booking.deliveryLocation) && (
                              <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-xs space-y-1">
                                  {booking.preferredTime && (
                                    <div>
                                      <span className="font-medium text-gray-700">⏰ الوقت المفضل: </span>
                                      <span className="text-gray-800">{booking.preferredTime}</span>
                                    </div>
                                  )}
                                  {booking.urgentDelivery && (
                                    <div>
                                      <span className="font-medium text-red-700">🚨 توصيل عاجل</span>
                                    </div>
                                  )}
                                  {booking.deliveryLocation && booking.deliveryLocation !== booking.address && (
                                    <div>
                                      <span className="font-medium text-gray-700">📦 موقع التوصيل: </span>
                                      <span className="text-gray-800">{booking.deliveryLocation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* أزرار مبسطة */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => openProviderModal(booking)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1 flex-1"
                            >
                              <Send className="w-3 h-3" />
                              إرسال للمورد
                            </button>
                            
                            <div className="flex gap-2 flex-1">
                              <button
                                onClick={() => handleBookingEdit(booking)}
                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                تعديل
                              </button>
                              
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                  className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap"
                                >
                                  تأكيد
                                </button>
                              )}
                              
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors whitespace-nowrap"
                                >
                                  إكمال
                                </button>
                              )}
                            </div>
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
                {providers.map((provider, index) => {
                  // البحث عن إحصائيات المورد
                  const providerSummary = providerOrderSummaries.find(s => s.providerId === provider.id);
                  
                  return (
                    <div 
                      key={provider.id} 
                      className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg animate-slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{provider.name}</h4>
                          <p className="text-gray-500 text-sm">{provider.phone}</p>
                          <span className="text-sm px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 mt-2 inline-block">
                            {categories.find(c => c.id === provider.category)?.name || provider.category}
                          </span>
                        </div>
                      </div>

                      {/* إحصائيات المورد */}
                      {providerSummary ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-100">
                          <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            إحصائيات الأوردرات
                          </h5>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white/50 rounded-lg p-2">
                              <p className="text-green-600 font-medium">إجمالي الأوردرات</p>
                              <p className="text-green-900 font-bold text-lg">{providerSummary.totalOrders}</p>
                            </div>
                            <div className="bg-white/50 rounded-lg p-2">
                              <p className="text-green-600 font-medium">إجمالي التكلفة</p>
                              <p className="text-green-900 font-bold text-lg">{formatCurrency(providerSummary.totalCost)}</p>
                            </div>
                            <div className="col-span-2 bg-white/50 rounded-lg p-2">
                              <p className="text-emerald-600 font-medium">ربح الأدمن</p>
                              <p className="text-emerald-900 font-bold text-xl">{formatCurrency(providerSummary.totalProfit)}</p>
                            </div>
                          </div>
                          
                          {providerSummary.lastOrderDate && (
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-green-600 text-xs">
                                آخر أوردر: {formatDate(providerSummary.lastOrderDate)}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100 text-center">
                          <p className="text-gray-500 text-sm">لا توجد أوردرات حتى الآن</p>
                        </div>
                      )}

                      {/* أزرار العمليات */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleAddOrderClick(provider)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          إضافة أوردر
                        </button>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleProviderEdit(provider)} 
                            className="flex-1 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center gap-1"
                          >
                            <Edit className="w-4 h-4"/>
                            <span className="text-sm">تعديل</span>
                          </button>
                          <button 
                            onClick={() => handleProviderDelete(provider.id)} 
                            className="flex-1 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110 flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4"/>
                            <span className="text-sm">حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                        className="p-3 hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                              {booking.serviceName || 'خدمة غير محددة'}
                              {booking.categoryName && (
                                <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">{booking.categoryName}</span>
                              )}
                              {booking.price && (
                                <span className="text-amber-600 font-bold text-xs">{booking.price}</span>
                              )}
                            </h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status === 'pending' && 'معلق'}
                              {booking.status === 'confirmed' && 'مؤكد'}
                              {booking.status === 'completed' && 'مكتمل'}
                              {booking.status === 'cancelled' && 'ملغي'}
                              {booking.status === 'in_progress' && 'قيد التنفيذ'}
                            </span>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{booking.fullName || booking.customerName || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{booking.phoneNumber || booking.customerPhone || 'غير محدد'}</span>
                              </div>
                              <div className="col-span-1 sm:col-span-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="break-words line-clamp-2">{booking.address || booking.startLocation || booking.deliveryLocation || booking.destination || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0" />
                                <span>{formatTimeAgo(booking.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* تفاصيل مبسطة */}
                          {(booking.destination || booking.selectedDestination || booking.issueDescription) && (
                            <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                              {(booking.selectedDestination || booking.destination) && (
                                <div className="text-xs">
                                  <span className="font-medium text-green-700">🗺️ الوجهة: </span>
                                  <span className="text-green-800">{booking.selectedDestination || booking.destination}</span>
                                </div>
                              )}
                              {booking.issueDescription && (
                                <div className="text-xs mt-1">
                                  <span className="font-medium text-green-700">🔧 المشكلة: </span>
                                  <span className="text-green-800">{booking.issueDescription}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* تفاصيل إضافية مفصلة */}
                          <div className="space-y-2">
                            {/* معلومات الرحلة والمواقع */}
                            {(booking.startLocation || booking.endLocation) && (
                              <div className="bg-cyan-50 rounded-lg p-2 border border-cyan-100">
                                <div className="text-xs space-y-1">
                                  {booking.startLocation && (
                                    <div>
                                      <span className="font-medium text-cyan-700">🚩 نقطة البداية: </span>
                                      <span className="text-cyan-800">{booking.startLocation}</span>
                                    </div>
                                  )}
                                  {booking.endLocation && (
                                    <div>
                                      <span className="font-medium text-cyan-700">🏁 نقطة النهاية: </span>
                                      <span className="text-cyan-800">{booking.endLocation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* الملاحظات وتفاصيل الخدمة */}
                            {(booking.notes || booking.serviceDetails) && (
                              <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                                <div className="text-xs space-y-1">
                                  {booking.notes && (
                                    <div>
                                      <span className="font-medium text-yellow-700">📝 ملاحظات: </span>
                                      <span className="text-yellow-800">{booking.notes}</span>
                                    </div>
                                  )}
                                  {booking.serviceDetails && (
                                    <div>
                                      <span className="font-medium text-yellow-700">🔧 تفاصيل الخدمة: </span>
                                      <span className="text-yellow-800">{booking.serviceDetails}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* الأسئلة المخصصة */}
                            {booking.customAnswersWithQuestions && Object.keys(booking.customAnswersWithQuestions).length > 0 && (
                              <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                                <div className="text-xs">
                                  <div className="font-medium text-purple-700 mb-1">❓ أسئلة مخصصة:</div>
                                  {Object.entries(booking.customAnswersWithQuestions).map(([key, data]: [string, any]) => (
                                    <div key={key} className="mb-1">
                                      <span className="font-medium text-purple-600">• {data.question}: </span>
                                      <span className="text-purple-800">
                                        {Array.isArray(data.answer) ? data.answer.join(', ') : String(data.answer)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* إجابات مخصصة إضافية */}
                            {booking.customAnswers && Object.keys(booking.customAnswers).length > 0 && !booking.customAnswersWithQuestions && (
                              <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                                <div className="text-xs">
                                  <div className="font-medium text-indigo-700 mb-1">📋 تفاصيل إضافية:</div>
                                  {Object.entries(booking.customAnswers).map(([key, value]) => (
                                    <div key={key} className="mb-1">
                                      <span className="font-medium text-indigo-600">• {key}: </span>
                                      <span className="text-indigo-800">
                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* معلومات إضافية */}
                            {(booking.preferredTime || booking.urgentDelivery || booking.deliveryLocation) && (
                              <div className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                                <div className="text-xs space-y-1">
                                  {booking.preferredTime && (
                                    <div>
                                      <span className="font-medium text-gray-700">⏰ الوقت المفضل: </span>
                                      <span className="text-gray-800">{booking.preferredTime}</span>
                                    </div>
                                  )}
                                  {booking.urgentDelivery && (
                                    <div>
                                      <span className="font-medium text-red-700">🚨 توصيل عاجل</span>
                                    </div>
                                  )}
                                  {booking.deliveryLocation && booking.deliveryLocation !== booking.address && (
                                    <div>
                                      <span className="font-medium text-gray-700">📦 موقع التوصيل: </span>
                                      <span className="text-gray-800">{booking.deliveryLocation}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* أزرار مبسطة */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => openProviderModal(booking)}
                              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              إرسال للمورد
                            </button>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleBookingEdit(booking)}
                                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                <span className="hidden sm:inline">تعديل</span>
                              </button>
                              
                              {booking.status === 'pending' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'confirmed')}
                                  className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg transition-colors"
                                >
                                  تأكيد
                                </button>
                              )}
                              
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => handleBookingStatusUpdate(booking.id, 'completed')}
                                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors"
                                >
                                  إكمال
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Orders Tab - جديد */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-900">إدارة الأوردرات والأرباح</h3>
                <button
                  onClick={() => loadData()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث
                </button>
              </div>

              {/* إحصائيات عامة */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                {(() => {
                  const totalOrders = orders.length;
                  const totalCost = orders.reduce((sum, order) => sum + order.orderCost, 0);
                  const totalProfit = orders.reduce((sum, order) => sum + order.adminProfit, 0);
                  const activeProviders = providerOrderSummaries.filter(p => p.totalOrders > 0).length;
                  
                  return [
                    { 
                      label: 'إجمالي الأوردرات', 
                      value: totalOrders.toString(), 
                      icon: DollarSign, 
                      color: 'from-blue-500 to-blue-600', 
                      bg: 'bg-blue-50',
                      suffix: 'أوردر'
                    },
                    { 
                      label: 'إجمالي التكلفة', 
                      value: totalCost.toLocaleString('ar-SA', { 
                        style: 'currency', 
                        currency: 'SAR', 
                        minimumFractionDigits: 0 
                      }), 
                      icon: TrendingUp, 
                      color: 'from-green-500 to-green-600', 
                      bg: 'bg-green-50',
                      suffix: ''
                    },
                    { 
                      label: 'إجمالي الأرباح', 
                      value: totalProfit.toLocaleString('ar-SA', { 
                        style: 'currency', 
                        currency: 'SAR', 
                        minimumFractionDigits: 0 
                      }), 
                      icon: PieChart, 
                      color: 'from-emerald-500 to-emerald-600', 
                      bg: 'bg-emerald-50',
                      suffix: ''
                    },
                    { 
                      label: 'موردين نشطين', 
                      value: activeProviders.toString(), 
                      icon: Users, 
                      color: 'from-orange-500 to-orange-600', 
                      bg: 'bg-orange-50',
                      suffix: 'مورد'
                    }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className={`${stat.bg} rounded-2xl p-4 lg:p-6 border border-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-slide-up`}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 truncate">{stat.label}</p>
                          <p className="text-lg lg:text-2xl font-bold text-gray-900 leading-tight">{stat.value}</p>
                          {stat.suffix && <p className="text-gray-500 text-xs mt-1">{stat.suffix}</p>}
                        </div>
                        <div className={`p-2 lg:p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg flex-shrink-0`}>
                          <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* تفاصيل الموردين مع إحصائياتهم - Accordion Style */}
              <div className="space-y-4">
                {providerOrderSummaries
                  .filter(summary => providers.find(p => p.id === summary.providerId))
                  .map((summary, providerIndex) => {
                    const provider = providers.find(p => p.id === summary.providerId)!;
                    const isExpanded = expandedProvider === summary.providerId;

                    return (
                      <div key={summary.providerId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{animationDelay: `${(providerIndex + 4) * 0.1}s`}}>
                        {/* Provider Header - Always Visible */}
                        <div 
                          className="p-4 lg:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white cursor-pointer hover:bg-gray-100 transition-all duration-200"
                          onClick={() => setExpandedProvider(isExpanded ? null : summary.providerId)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg lg:text-xl font-bold text-gray-900 truncate">{summary.providerName}</h4>
                                <p className="text-gray-600 text-xs lg:text-sm truncate">{provider.phone}</p>
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 mt-1 inline-block">
                                  {categories.find(c => c.id === provider.category)?.name || provider.category}
                                </span>
                              </div>
                            </div>
                            
                            {/* Quick Stats - Desktop */}
                            <div className="hidden lg:flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-xl lg:text-2xl font-bold text-green-600">{summary.totalOrders}</p>
                                <p className="text-xs text-gray-500">أوردر</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl lg:text-2xl font-bold text-blue-600">{formatCurrency(summary.totalCost)}</p>
                                <p className="text-xs text-gray-500">إجمالي التكلفة</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xl lg:text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalProfit)}</p>
                                <p className="text-xs text-gray-500">ربح الأدمن</p>
                              </div>
                            </div>
                            
                            {/* Quick Stats - Mobile */}
                            <div className="flex lg:hidden items-center gap-2">
                              <div className="text-center">
                                <p className="text-sm font-bold text-green-600">{summary.totalOrders}</p>
                                <p className="text-xs text-gray-500">أوردر</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-bold text-emerald-600">{formatCurrency(summary.totalProfit)}</p>
                                <p className="text-xs text-gray-500">ربح</p>
                              </div>
                            </div>
                            
                            {/* Expand/Collapse Arrow */}
                            <div className="flex items-center gap-2 lg:gap-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddOrderClick(provider);
                                }}
                                className="px-3 py-1 lg:px-4 lg:py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center gap-1 lg:gap-2 text-xs lg:text-sm"
                              >
                                <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                                <span className="hidden sm:inline">إضافة أوردر</span>
                                <span className="sm:hidden">إضافة</span>
                              </button>
                              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && summary.totalOrders > 0 && (
                          <div className="p-4 lg:p-6 animate-fade-in">
                            {/* Mobile Stats Summary */}
                            <div className="lg:hidden mb-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                  <p className="text-sm font-medium text-blue-600">إجمالي التكلفة</p>
                                  <p className="text-lg font-bold text-blue-900">{formatCurrency(summary.totalCost)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                                  <p className="text-sm font-medium text-emerald-600">ربح الأدمن</p>
                                  <p className="text-lg font-bold text-emerald-900">{formatCurrency(summary.totalProfit)}</p>
                                </div>
                              </div>
                            </div>

                            {/* الإحصائيات اليومية */}
                            {summary.dailyStats.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <BarChart className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500" />
                                  الإحصائيات اليومية
                                </h5>
                                
                                {/* Desktop Table */}
                                <div className="hidden lg:block overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">التاريخ</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">عدد الأوردرات</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">إجمالي التكلفة</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">ربح الأدمن</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {summary.dailyStats.slice(0, 7).map((daily, index) => (
                                        <tr key={daily.date} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                          <td className="py-3 px-4 font-medium text-gray-900">{formatDate(daily.date)}</td>
                                          <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                              {daily.ordersCount}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-center font-semibold text-gray-900">{formatCurrency(daily.totalCost)}</td>
                                          <td className="py-3 px-4 text-center font-bold text-emerald-600">{formatCurrency(daily.totalProfit)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                
                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-3">
                                  {summary.dailyStats.slice(0, 5).map((daily, index) => (
                                    <div key={daily.date} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="font-medium text-gray-900 text-sm">{formatDate(daily.date)}</h6>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {daily.ordersCount} أوردر
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <p className="text-gray-600 font-medium">إجمالي التكلفة</p>
                                          <p className="text-gray-900 font-bold">{formatCurrency(daily.totalCost)}</p>
                                        </div>
                                        <div>
                                          <p className="text-emerald-600 font-medium">ربح الأدمن</p>
                                          <p className="text-emerald-900 font-bold">{formatCurrency(daily.totalProfit)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* الإحصائيات الشهرية */}
                            {summary.monthlyStats.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <PieChart className="w-4 h-4 lg:w-5 lg:h-5 text-purple-500" />
                                  الإحصائيات الشهرية
                                </h5>
                                
                                {/* Desktop Table */}
                                <div className="hidden lg:block overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">الشهر</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">عدد الأوردرات</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">إجمالي التكلفة</th>
                                        <th className="text-center py-3 px-4 font-semibold text-gray-700">ربح الأدمن</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {summary.monthlyStats.map((monthly, index) => (
                                        <tr key={monthly.month} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition-colors`}>
                                          <td className="py-3 px-4 font-medium text-gray-900">{getMonthName(monthly.month)}</td>
                                          <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                              {monthly.ordersCount}
                                            </span>
                                          </td>
                                          <td className="py-3 px-4 text-center font-semibold text-gray-900">{formatCurrency(monthly.totalCost)}</td>
                                          <td className="py-3 px-4 text-center font-bold text-emerald-600">{formatCurrency(monthly.totalProfit)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                
                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-3">
                                  {summary.monthlyStats.map((monthly, index) => (
                                    <div key={monthly.month} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="font-medium text-gray-900 text-sm">{getMonthName(monthly.month)}</h6>
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                          {monthly.ordersCount} أوردر
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <p className="text-gray-600 font-medium">إجمالي التكلفة</p>
                                          <p className="text-gray-900 font-bold">{formatCurrency(monthly.totalCost)}</p>
                                        </div>
                                        <div>
                                          <p className="text-emerald-600 font-medium">ربح الأدمن</p>
                                          <p className="text-emerald-900 font-bold">{formatCurrency(monthly.totalProfit)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* تفاصيل الأوردرات الأخيرة */}
                            <div>
                              <h5 className="text-base lg:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
                                آخر الأوردرات
                              </h5>
                              <div className="space-y-2 lg:space-y-3">
                                {orders
                                  .filter(order => order.providerId === summary.providerId)
                                  .slice(0, 5)
                                  .map((order, index) => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                          <DollarSign className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                                            <div>
                                              <p className="font-medium text-gray-900 text-sm lg:text-base">{formatCurrency(order.orderCost)}</p>
                                              <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                                            </div>
                                            <div className="lg:text-left">
                                              <p className="font-bold text-emerald-600 text-sm lg:text-base">{formatCurrency(order.adminProfit)}</p>
                                              <p className="text-xs text-gray-500">ربح ({order.profitPercentage}%)</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleOrderDelete(order.id)}
                                        className="p-1 lg:p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                        title="حذف الأوردر"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Empty State for Provider */}
                        {isExpanded && summary.totalOrders === 0 && (
                          <div className="p-4 lg:p-6 text-center animate-fade-in">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-base lg:text-lg font-medium">لا توجد أوردرات لهذا المورد</p>
                            <p className="text-gray-400 text-sm mt-1">اضغط على "إضافة أوردر" لبدء تسجيل الأوردرات</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Empty State for All Providers */}
              {providerOrderSummaries.length === 0 && (
                <div className="text-center py-8 lg:py-12">
                  <DollarSign className="w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base lg:text-lg">لا توجد أوردرات حالياً</p>
                  <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة أوردرات للموردين من صفحة المورّدين</p>
                </div>
              )}
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
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeProviderModal} className="absolute top-3 left-3 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-green-400" />
              إرسال الحجز إلى المورد
            </h3>
            <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-300 mb-2">تفاصيل الحجز:</p>
              <p className="text-white font-semibold">{selectedBookingForSend.serviceName}</p>
              <p className="text-gray-400 text-xs">العميل: {selectedBookingForSend.fullName || selectedBookingForSend.customerName}</p>
              <p className="text-gray-400 text-xs">الفئة: {selectedBookingForSend.serviceCategory}</p>
              <p className="text-gray-400 text-xs">الموردين المتاحين للفئة: {providers.filter(p => {
                console.log(`🔍 [Modal] فحص المورد ${p.name}: ${p.category} === ${selectedBookingForSend.serviceCategory} = ${p.category === selectedBookingForSend.serviceCategory}`);
                return p.category === selectedBookingForSend.serviceCategory;
              }).length}</p>
            </div>
            <p className="text-sm text-gray-400 mb-4">اختر المورد لإرسال تفاصيل الحجز عبر واتساب:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(() => {
                const filteredProviders = providers.filter(p => {
                  const matches = p.category === selectedBookingForSend.serviceCategory;
                  console.log(`🎯 [Modal] فلترة المورد ${p.name} (${p.category}): ${matches}`);
                  return matches;
                });
                
                console.log('📋 [Modal] النتيجة النهائية للفلترة:', filteredProviders.length, 'موردين');
                console.log('📋 [Modal] تفاصيل الموردين المفلترين:', filteredProviders.map(p => ({ name: p.name, category: p.category, phone: p.phone })));
                
                return filteredProviders.map(provider => (
                  <div key={provider.id} className="flex items-center justify-between bg-gray-700/40 p-3 rounded-lg border border-gray-600">
                    <div>
                      <div className="text-white text-sm font-medium">{provider.name}</div>
                      <div className="text-gray-400 text-xs">{provider.phone}</div>
                    </div>
                    <button
                      onClick={() => handleSendToProvider(provider)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                    >
                      إرسال
                    </button>
                  </div>
                ));
              })()}
              {providers.filter(p => p.category === selectedBookingForSend.serviceCategory).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-2">لا يوجد مورّدون مرتبطون بهذه الفئة.</p>
                  <p className="text-gray-400 text-xs">الفئة المطلوبة: {selectedBookingForSend.serviceCategory}</p>
                  <p className="text-gray-400 text-xs">الموردين المتاحين: {providers.length}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>جميع الموردين والفئات:</p>
                    {providers.map(p => (
                      <p key={p.id} className="text-xs">• {p.name}: {p.category}</p>
                    ))}
                  </div>
                </div>
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

      {/* Add Order Modal - جديد */}
      {selectedProviderForOrder && (
        <AddOrderModal
          isOpen={showAddOrderModal}
          onClose={() => {
            setShowAddOrderModal(false);
            setSelectedProviderForOrder(null);
          }}
          onSave={handleOrderSave}
          provider={selectedProviderForOrder}
        />
      )}

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