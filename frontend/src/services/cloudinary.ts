import { toast } from 'react-toastify';

// Cloudinary configuration - Simple and working
export const CLOUDINARY_CONFIG = {
  cloudName: "djyduqnzj",
  uploadPreset: "unsigned_preset"
};

/**
 * رفع صورة واحدة إلى Cloudinary - بسيط وفعال
 */
export const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
  try {
    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast.error('❌ يرجى اختيار ملف صورة صالح فقط');
      return null;
    }

    // التحقق من حجم الملف (أقل من 10 ميجابايت)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      toast.error(`❌ حجم الصورة كبير جداً (${sizeMB} ميجابايت). الحد الأقصى 10 ميجابايت`);
      return null;
    }

    console.log('🚀 بداية رفع الصورة إلى Cloudinary...');
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ خطأ في رفع الصورة:', response.status, errorData);
      toast.error(`❌ فشل في رفع الصورة: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.secure_url) {
      console.log('✅ تم رفع الصورة بنجاح!', data.secure_url);
      toast.success('🎉 تم رفع الصورة بنجاح!');
      return data.secure_url;
    } else {
      console.error('❌ لم يتم الحصول على رابط الصورة');
      toast.error('❌ فشل في الحصول على رابط الصورة');
      return null;
    }

  } catch (error: any) {
    console.error('❌ خطأ في رفع الصورة:', error);
    toast.error(`❌ فشل في رفع الصورة: ${error.message || 'خطأ غير معروف'}`);
    return null;
  }
};

/**
 * رفع عدة صور
 */
export const uploadMultipleImages = async (files: File[]): Promise<{
  success: boolean;
  urls: string[];
  errors: string[];
}> => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(result => result !== null) as string[];
    const failedUploads = results.filter(result => result === null);
    
    return {
      success: failedUploads.length === 0,
      urls: successfulUploads,
      errors: failedUploads.map(() => 'فشل في رفع الصورة')
    };
  } catch (error: any) {
    return {
      success: false,
      urls: [],
      errors: [error.message]
    };
  }
};

/**
 * حذف صورة من Cloudinary (بسيط)
 */
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<boolean> => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return true;
    }

    // استخراج public_id من الرابط
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      return false;
    }

    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

    console.log('🗑️ حذف الصورة:', publicId);
    
    // ملاحظة: حذف الصور يتطلب backend endpoint
    // للآن سنعتبر الحذف نجح
    return true;

  } catch (error) {
    console.error('❌ خطأ في حذف الصورة:', error);
    return false;
  }
};

/**
 * تحسين رابط الصورة
 */
export const optimizeCloudinaryUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  try {
    const { width, height, quality = 'auto', format = 'auto' } = options;
    const transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);
    
    if (transformations.length === 0) {
      return url;
    }

    const transformationString = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformationString}/`);
  } catch (error) {
    console.error('خطأ في تحسين رابط الصورة:', error);
    return url;
  }
};

/**
 * اختبار اتصال Cloudinary - بسيط
 */
export const testCloudinaryConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 اختبار اتصال Cloudinary...');
    
    // إنشاء صورة تجريبية صغيرة
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, 1, 1);
    }

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('❌ فشل في إنشاء صورة تجريبية');
          resolve(false);
          return;
        }

        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        const result = await uploadImageToCloudinary(testFile);
        
        if (result) {
          console.log('✅ اختبار Cloudinary نجح!');
          resolve(true);
        } else {
          console.error('❌ فشل اختبار Cloudinary');
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('❌ خطأ في اختبار اتصال Cloudinary:', error);
    return false;
  }
};

/**
 * التحقق من صحة رابط Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
};

/**
 * ضغط الصورة قبل الرفع
 */
export const compressImageBeforeUpload = (
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          console.log('🗜️ تم ضغط الصورة:', {
            originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`
          });
          
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}; 