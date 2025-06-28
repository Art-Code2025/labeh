import { db } from '../firebase.config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8888/.netlify/functions';

export interface Provider {
    id: string;
    name: string;
    phone: string; // رقم واتساب بصيغة دولية بدون +
    category: string; // معرف الفئة المرتبط بها
    createdAt?: string;
    updatedAt?: string;
}

const COLLECTION = 'providers';

// Enhanced API call function
async function makeApiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        
        // Get response text first to check content
        const responseText = await response.text();
        
        // Check if response starts with HTML (common error indicator)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            throw new Error('Netlify Functions unavailable');
        }
        
        // Check if response is empty
        if (!responseText.trim()) {
            throw new Error('Empty response from server');
        }
        
        // Try to parse JSON
        let jsonData: T;
        try {
            jsonData = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error('Invalid JSON response');
        }
        
        // Check HTTP status after parsing
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return jsonData;
    } catch (error) {
        // Only log detailed errors in development
        if (process.env.NODE_ENV === 'development') {
            console.debug(`API fallback to Firebase for ${endpoint}`);
        }
        throw error;
    }
}

// Enhanced Firebase operations
async function getFromFirebase<T>(collectionName: string): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
        console.error(`Firebase read failed for ${collectionName}:`, error);
        throw new Error(`Failed to read ${collectionName} from database`);
    }
}

async function addToFirebase<T>(collectionName: string, data: any): Promise<{ id: string }> {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id };
    } catch (error) {
        console.error(`Firebase add failed for ${collectionName}:`, error);
        throw new Error(`Failed to add ${collectionName} to database`);
    }
}

async function updateInFirebase(collectionName: string, id: string, data: any): Promise<{ message: string }> {
    try {
        await updateDoc(doc(db, collectionName, id), {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { message: 'Updated successfully' };
    } catch (error) {
        console.error(`Firebase update failed for ${collectionName}:`, error);
        throw new Error(`Failed to update ${collectionName} in database`);
    }
}

async function deleteFromFirebase(collectionName: string, id: string): Promise<{ message: string }> {
    try {
        await deleteDoc(doc(db, collectionName, id));
        return { message: 'Deleted successfully' };
    } catch (error) {
        console.error(`Firebase delete failed for ${collectionName}:`, error);
        throw new Error(`Failed to delete ${collectionName} from database`);
    }
}

export const providersApi = {
    async getAll(): Promise<Provider[]> {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION));
            const providers: Provider[] = [];
            snapshot.forEach(docSnap => {
                providers.push({ id: docSnap.id, ...docSnap.data() } as Provider);
            });
            return providers;
        } catch (err) {
            console.error('Error fetching providers:', err);
            throw new Error('فشل في جلب المورّدين');
        }
    },

    async create(data: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, COLLECTION), {
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return docRef.id;
        } catch (err) {
            console.error('Error creating provider:', err);
            throw new Error('فشل في إنشاء المورّد');
        }
    },

    async update(id: string, data: Partial<Provider>) {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                ...data,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error updating provider:', err);
            throw new Error('فشل في تحديث المورّد');
        }
    },

    async delete(id: string) {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
        } catch (err) {
            console.error('Error deleting provider:', err);
            throw new Error('فشل في حذف المورّد');
        }
    }
}; 