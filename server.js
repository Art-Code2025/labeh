import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// محاكاة __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// إعدادات Multer لرفع الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/images/');
    fs.mkdir(dir, { recursive: true })
      .then(() => cb(null, dir))
      .catch(err => cb(err, dir));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
 
// تعريف Multer مع الحقول المتوقعة وحدود الحجم 
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 16
  }
}).fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'detailedImages', maxCount: 15 },
]);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Data file paths
const SERVICES_FILE = path.join(__dirname, 'data', 'services.json');
const CATEGORIES_FILE = path.join(__dirname, 'data', 'categories.json');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');

// Ensure data directory exists
await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });

// Initialize data files if they don't exist
const initializeDataFile = async (filePath, initialData = []) => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
  }
};

await initializeDataFile(SERVICES_FILE);
await initializeDataFile(CATEGORIES_FILE);
await initializeDataFile(BOOKINGS_FILE);

// Helper functions
const readJsonFile = async (filePath) => {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
};

const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// === مسارات الخدمات ===

// جلب كل الخدمات
app.get('/api/services', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// جلب الخدمات حسب الفئة
app.get('/api/services/category/:category', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    const category = req.params.category;
    const filteredServices = services.filter(service => service.category === category);
    res.json(filteredServices);
  } catch (error) {
    console.error('Error in GET /api/services/category:', error);
    res.status(500).json({ message: 'Failed to fetch services by category' });
  }
});

// جلب خدمة محددة بناءً على الـ ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    const service = services.find(s => s.id === parseInt(req.params.id));
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    console.error('Error in GET /api/services/:id:', error);
    res.status(500).json({ message: 'Failed to fetch service' });
  }
});

// إحصائيات الصور لخدمة معينة
app.get('/api/services/:id/images-stats', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    const serviceId = parseInt(req.params.id);
    const service = services.find(s => s.id === serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    let totalSize = 0;
    const imagePaths = [];

    // حجم الصورة الرئيسية
    if (service.mainImage) {
      const mainImagePath = path.join(__dirname, 'public', service.mainImage);
      imagePaths.push(mainImagePath);
    }

    // حجم الصور التفصيلية
    if (service.detailedImages && service.detailedImages.length > 0) {
      service.detailedImages.forEach(image => {
        const imagePath = path.join(__dirname, 'public', image);
        imagePaths.push(imagePath);
      });
    }

    // جمع أحجام الصور
    for (const imagePath of imagePaths) {
      try {
        const stats = await fs.stat(imagePath);
        totalSize += stats.size;
      } catch (error) {
        console.error(`Error getting size for ${imagePath}:`, error);
      }
    }

    // تحويل الحجم إلى MB
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

    res.json({
      imageCount: (service.mainImage ? 1 : 0) + (service.detailedImages ? service.detailedImages.length : 0),
      totalSizeMB: parseFloat(totalSizeMB),
      warning: totalSizeMB > 2 ? 'تحذير: الحجم الكلي للصور كبير جدًا (أكثر من 2 MB)' : null
    });
  } catch (error) {
    console.error('Error in GET /api/services/:id/images-stats:', error);
    res.status(500).json({ message: 'Failed to fetch image stats', error: error.message });
  }
});

// إضافة خدمة جديدة
app.post('/api/services', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    const newService = {
      id: services.length + 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    services.push(newService);
    await writeJsonFile(SERVICES_FILE, services);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// تعديل خدمة موجودة
app.put('/api/services/:id', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    const index = services.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Service not found' });
    }
    services[index] = { ...services[index], ...req.body };
    await writeJsonFile(SERVICES_FILE, services);
    res.json(services[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// تحديث ترتيب الخدمات
app.put('/api/services/reorder', async (req, res) => {
  try {
    const { reorderedServices } = req.body;
    await writeJsonFile(SERVICES_FILE, reorderedServices);
    res.json({ message: 'Services reordered successfully' });
  } catch (error) {
    console.error('Error in PUT /api/services/reorder:', error);
    res.status(500).json({ message: 'Failed to reorder services', error: error.message });
  }
});

// حذف خدمة
app.delete('/api/services/:id', async (req, res) => {
  try {
    const services = await readJsonFile(SERVICES_FILE);
    const filteredServices = services.filter(s => s.id !== parseInt(req.params.id));
    await writeJsonFile(SERVICES_FILE, filteredServices);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// === مسارات الفئات ===

// جلب كل الفئات
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// إضافة خدمة جديدة
app.post('/api/categories', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    const newCategory = {
      id: categories.length + 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    await writeJsonFile(CATEGORIES_FILE, categories);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// تعديل خدمة
app.put('/api/categories/:id', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    const index = categories.findIndex(c => c.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories[index] = { ...categories[index], ...req.body };
    await writeJsonFile(CATEGORIES_FILE, categories);
    res.json(categories[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// حذف خدمة
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const categories = await readJsonFile(CATEGORIES_FILE);
    const filteredCategories = categories.filter(c => c.id !== parseInt(req.params.id));
    await writeJsonFile(CATEGORIES_FILE, filteredCategories);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// === مسارات الحجوزات ===

// جلب كل الحجوزات
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    res.json(bookings);
  } catch (error) {
    console.error('Error in GET /api/bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// إحصائيات الحجوزات - يجب أن يكون قبل /api/bookings/:id
app.get('/api/bookings/stats', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    const services = await readJsonFile(SERVICES_FILE);
    
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      inProgress: bookings.filter(b => b.status === 'in_progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      byCategory: {},
      byService: {}
    };

    // إحصائيات حسب الفئة
    services.forEach(service => {
      const categoryBookings = bookings.filter(b => b.serviceCategory === service.category);
      if (categoryBookings.length > 0) {
        stats.byCategory[service.categoryName] = categoryBookings.length;
      }
    });

    // إحصائيات حسب الخدمة
    services.forEach(service => {
      const serviceBookings = bookings.filter(b => b.serviceId === service.id);
      if (serviceBookings.length > 0) {
        stats.byService[service.name] = serviceBookings.length;
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error in GET /api/bookings/stats:', error);
    res.status(500).json({ message: 'Failed to fetch booking stats', error: error.message });
  }
});

// جلب حجز محدد
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error('Error in GET /api/bookings/:id:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// إنشاء حجز جديد
app.post('/api/bookings', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    const { serviceId, serviceName, fullName, phoneNumber, address, serviceDetails, customAnswers } = req.body;

    // التحقق من وجود الخدمة
    const services = await readJsonFile(SERVICES_FILE);
    const service = services.find(s => s.id === parseInt(serviceId));
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const newBooking = {
      id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
      serviceId: parseInt(serviceId),
      serviceName: serviceName || service.name,
      serviceCategory: service.category,
      fullName,
      phoneNumber,
      address,
      serviceDetails,
      customAnswers: customAnswers || {}, // إجابات الأسئلة المخصصة
      status: 'pending', // pending, confirmed, in_progress, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    await writeJsonFile(BOOKINGS_FILE, bookings);
    
    res.status(201).json({
      message: 'تم إنشاء الحجز بنجاح! سيتم التواصل معك قريباً',
      booking: newBooking
    });
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

// تحديث حالة الحجز
app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    bookings[bookingIndex].status = status;
    bookings[bookingIndex].updatedAt = new Date().toISOString();

    await writeJsonFile(BOOKINGS_FILE, bookings);
    res.json({ message: 'Booking status updated successfully', booking: bookings[bookingIndex] });
  } catch (error) {
    console.error('Error in PUT /api/bookings/:id/status:', error);
    res.status(500).json({ message: 'Failed to update booking status', error: error.message });
  }
});

// حذف حجز
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    const bookingId = parseInt(req.params.id);
    const updatedBookings = bookings.filter(b => b.id !== bookingId);

    if (bookings.length === updatedBookings.length) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await writeJsonFile(BOOKINGS_FILE, updatedBookings);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/bookings/:id:', error);
    res.status(500).json({ message: 'Failed to delete booking', error: error.message });
  }
});

// التأكد من وجود الملفات عند بدء تشغيل السيرفر
initializeDataFile(SERVICES_FILE).then(() => {
  initializeDataFile(CATEGORIES_FILE);
  initializeDataFile(BOOKINGS_FILE);
  app.listen(port, () => {
    console.log(`Labeeh Services Server running on http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize data files:', error);
  process.exit(1);
});