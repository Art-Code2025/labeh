import React, { useState } from 'react';
import { Activity, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase.config';
import { collection, getDocs } from 'firebase/firestore';

const FirebaseDebugPanel: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testFirebaseConnection = async () => {
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      return { success: true, message: 'Firebase connection successful' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setResults(null);
    
    try {
      const firebaseTest = await testFirebaseConnection();
      
      setResults({
        firebase: firebaseTest,
        timestamp: new Date().toLocaleString()
      });
      
      if (firebaseTest.success) {
        toast.success('✅ Firebase متصل بنجاح!');
      } else {
        toast.error('❌ فشل الاتصال بـ Firebase');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('❌ فشل في تشغيل الاختبارات');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">اختبار Firebase</h3>
      </div>

      <button
        onClick={runTests}
        disabled={testing}
        className="w-full mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Activity className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
        {testing ? 'جاري الاختبار...' : 'تشغيل اختبار Firebase'}
      </button>

      {results && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg">
            {results.firebase.success ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Firebase</div>
              <div className={`text-xs ${results.firebase.success ? 'text-green-400' : 'text-red-400'}`}>
                {results.firebase.message}
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            آخر اختبار: {results.timestamp}
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseDebugPanel; 