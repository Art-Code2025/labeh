import { db } from '../firebase.config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  query,
  orderBy,
  startAfter,
  limit,
  DocumentSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

// Services API functions
export const API_BASE = '/.netlify/functions';

// Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select_single' | 'select_multiple' | 'date' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Service {
  id: string;
  name: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  homeShortDescription?: string;
  detailsShortDescription?: string;
  mainImage?: string;
  detailedImages?: string[];
  imageDetails?: string[];
  features?: string[];
  duration?: string;
  availability?: string;
  price?: string;
  pricing?: string;
  createdAt?: string;
  updatedAt?: string;
  customQuestions?: CustomQuestion[];
}

// Services API
export const servicesApi = {
  // Get all services with pagination
  async getAll(lastVisible?: DocumentSnapshot | null, count = 10): Promise<{ services: Service[], lastVisible: DocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, 'services'), 
        orderBy('createdAt', 'desc'), 
        limit(count)
      );

      if (lastVisible) {
        q = query(
          collection(db, 'services'), 
          orderBy('createdAt', 'desc'), 
          startAfter(lastVisible), 
          limit(count)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const services: Service[] = [];
      querySnapshot.forEach((doc: any) => {
        services.push({ id: doc.id, ...doc.data() } as Service);
      });

      const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      
      return { services, lastVisible: newLastVisible || null };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new Error('فشل في جلب الخدمات');
    }
  },

  // Get service by ID
  async getById(id: string): Promise<Service | null> {
    try {
      const docRef = doc(db, 'services', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Service;
      }
      return null;
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      throw new Error('فشل في جلب الخدمة');
    }
  },

  // Create new service
  async create(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'services'), {
        ...serviceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('فشل في إنشاء الخدمة');
    }
  },

  // Update service
  async update(id: string, serviceData: Partial<Service>): Promise<void> {
    try {
      await updateDoc(doc(db, 'services', id), {
        ...serviceData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('فشل في تحديث الخدمة');
    }
  },

  // Delete service
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('فشل في حذف الخدمة');
    }
  }
};

// Categories API
export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categories: Category[] = [];
      querySnapshot.forEach((doc: any) => {
        categories.push({ id: doc.id, ...doc.data() } as Category);
      });
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('فشل في جلب الفئات');
    }
  },

  // Create new category
  async create(categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        serviceCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('فشل في إنشاء الفئة');
    }
  },

  // Update category
  async update(id: string, categoryData: Partial<Category>): Promise<void> {
    try {
      await updateDoc(doc(db, 'categories', id), {
        ...categoryData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('فشل في تحديث الفئة');
    }
  },

  // Delete category
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('فشل في حذف الفئة');
    }
  }
}; 