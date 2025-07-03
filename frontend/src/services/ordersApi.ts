import { db } from '../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8888/.netlify/functions';

export interface Order {
  id: string;
  providerId: string;
  providerName: string;
  orderCost: number;
  adminProfit: number; // 30% من التكلفة
  profitPercentage: number; // النسبة المئوية للربح (افتراضي 30)
  createdAt: string;
  updatedAt: string;
  notes?: string;
  orderDate: string; // التاريخ اللي المورد عمل فيه الأوردر (قد يختلف عن createdAt)
}

export interface DailyOrderStats {
  date: string;
  ordersCount: number;
  totalCost: number;
  totalProfit: number;
}

export interface MonthlyOrderStats {
  month: string;
  year: number;
  ordersCount: number;
  totalCost: number;
  totalProfit: number;
}

export interface ProviderOrderSummary {
  providerId: string;
  providerName: string;
  totalOrders: number;
  totalCost: number;
  totalProfit: number;
  dailyStats: DailyOrderStats[];
  monthlyStats: MonthlyOrderStats[];
  lastOrderDate?: string;
}

// Helper function for API calls
async function makeApiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Firebase operations for orders
async function getOrdersFromFirebase(): Promise<Order[]> {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
        );
        return querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as Order));
    } catch (error) {
        console.error('Firebase read failed for orders:', error);
        throw new Error('Failed to read orders from database');
    }
}

async function addOrderToFirebase(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'adminProfit'>): Promise<{ id: string }> {
    try {
        console.log('🔥 [ordersApi] إضافة أوردر جديد:', data);
        
        // حساب ربح الأدمن تلقائياً
        const adminProfit = (data.orderCost * data.profitPercentage) / 100;
        
        const finalData = {
            ...data,
            adminProfit,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('📦 [ordersApi] البيانات النهائية للحفظ:', finalData);
        
        const docRef = await addDoc(collection(db, 'orders'), finalData);
        
        console.log('✅ [ordersApi] تم الحفظ بنجاح - Document ID:', docRef.id);
        
        return { id: docRef.id };
    } catch (error) {
        console.error('❌ [ordersApi] فشل في الحفظ:', error);
        throw new Error('Failed to add order to database');
    }
}

async function updateOrderInFirebase(id: string, data: Partial<Order>): Promise<{ message: string }> {
    try {
        // إعادة حساب ربح الأدمن إذا تم تغيير التكلفة أو النسبة
        const updateData = { ...data };
        if (data.orderCost || data.profitPercentage) {
            const order = await getOrderById(id);
            if (order) {
                const cost = data.orderCost || order.orderCost;
                const percentage = data.profitPercentage || order.profitPercentage;
                updateData.adminProfit = (cost * percentage) / 100;
            }
        }
        
        await updateDoc(doc(db, 'orders', id), {
            ...updateData,
            updatedAt: new Date().toISOString()
        });
        return { message: 'Updated successfully' };
    } catch (error) {
        console.error('Firebase update failed for orders:', error);
        throw new Error('Failed to update order in database');
    }
}

async function deleteOrderFromFirebase(id: string): Promise<{ message: string }> {
    try {
        await deleteDoc(doc(db, 'orders', id));
        return { message: 'Deleted successfully' };
    } catch (error) {
        console.error('Firebase delete failed for orders:', error);
        throw new Error('Failed to delete order from database');
    }
}

// Main API functions
export const getOrders = async (): Promise<Order[]> => {
    try {
        return await makeApiCall<Order[]>('/orders');
    } catch (error) {
        console.log('🔄 Using Firebase for orders');
        return await getOrdersFromFirebase();
    }
};

export const getOrdersByProvider = async (providerId: string): Promise<Order[]> => {
    try {
        return await makeApiCall<Order[]>(`/orders?providerId=${providerId}`);
    } catch (error) {
        console.log('🔄 Using Firebase for provider orders');
        const allOrders = await getOrdersFromFirebase();
        return allOrders.filter(order => order.providerId === providerId);
    }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
    try {
        return await makeApiCall<Order>(`/orders/${id}`);
    } catch (error) {
        const allOrders = await getOrdersFromFirebase();
        return allOrders.find(order => order.id === id) || null;
    }
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'adminProfit'>): Promise<{ id: string }> => {
    try {
        return await makeApiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    } catch (error) {
        console.log('🔄 Using Firebase for order creation');
        return await addOrderToFirebase(orderData);
    }
};

export const updateOrder = async (id: string, orderData: Partial<Order>): Promise<{ message: string }> => {
    try {
        return await makeApiCall(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(orderData),
        });
    } catch (error) {
        console.log('🔄 Using Firebase for order update');
        return await updateOrderInFirebase(id, orderData);
    }
};

export const deleteOrder = async (id: string): Promise<{ message: string }> => {
    try {
        return await makeApiCall(`/orders/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.log('🔄 Using Firebase for order deletion');
        return await deleteOrderFromFirebase(id);
    }
};

// Statistics functions
export const getProviderOrderSummary = async (providerId: string): Promise<ProviderOrderSummary> => {
    const orders = await getOrdersByProvider(providerId);
    
    if (orders.length === 0) {
        return {
            providerId,
            providerName: '',
            totalOrders: 0,
            totalCost: 0,
            totalProfit: 0,
            dailyStats: [],
            monthlyStats: []
        };
    }
    
    // حساب الإحصائيات الإجمالية
    const totalOrders = orders.length;
    const totalCost = orders.reduce((sum, order) => sum + order.orderCost, 0);
    const totalProfit = orders.reduce((sum, order) => sum + order.adminProfit, 0);
    const providerName = orders[0].providerName;
    const lastOrderDate = orders[0].orderDate; // أحدث أوردر (مرتب حسب التاريخ)
    
    // تجميع الإحصائيات اليومية
    const dailyMap = new Map<string, { count: number; cost: number; profit: number }>();
    orders.forEach(order => {
        const date = order.orderDate.split('T')[0]; // أخذ التاريخ بدون الوقت
        const existing = dailyMap.get(date) || { count: 0, cost: 0, profit: 0 };
        dailyMap.set(date, {
            count: existing.count + 1,
            cost: existing.cost + order.orderCost,
            profit: existing.profit + order.adminProfit
        });
    });
    
    const dailyStats: DailyOrderStats[] = Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
            date,
            ordersCount: stats.count,
            totalCost: stats.cost,
            totalProfit: stats.profit
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // تجميع الإحصائيات الشهرية
    const monthlyMap = new Map<string, { count: number; cost: number; profit: number; year: number }>();
    orders.forEach(order => {
        const date = new Date(order.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const existing = monthlyMap.get(monthKey) || { count: 0, cost: 0, profit: 0, year: date.getFullYear() };
        monthlyMap.set(monthKey, {
            count: existing.count + 1,
            cost: existing.cost + order.orderCost,
            profit: existing.profit + order.adminProfit,
            year: date.getFullYear()
        });
    });
    
    const monthlyStats: MonthlyOrderStats[] = Array.from(monthlyMap.entries())
        .map(([monthKey, stats]) => ({
            month: monthKey,
            year: stats.year,
            ordersCount: stats.count,
            totalCost: stats.cost,
            totalProfit: stats.profit
        }))
        .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
    
    return {
        providerId,
        providerName,
        totalOrders,
        totalCost,
        totalProfit,
        dailyStats,
        monthlyStats,
        lastOrderDate
    };
};

export const getAllProvidersOrderSummary = async (): Promise<ProviderOrderSummary[]> => {
    const allOrders = await getOrders();
    const providerIds = [...new Set(allOrders.map(order => order.providerId))];
    
    const summaries = await Promise.all(
        providerIds.map(providerId => getProviderOrderSummary(providerId))
    );
    
    return summaries.sort((a, b) => b.totalOrders - a.totalOrders);
};

// Orders API object
export const ordersAPI = {
    getAll: getOrders,
    getByProvider: getOrdersByProvider,
    getById: getOrderById,
    create: createOrder,
    update: updateOrder,
    delete: deleteOrder,
    getProviderSummary: getProviderOrderSummary,
    getAllProvidersSummary: getAllProvidersOrderSummary
}; 