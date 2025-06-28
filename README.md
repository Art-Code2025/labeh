# HO-CARE - Professional Home Services Platform

A modern, responsive web platform for home service bookings with a clean, professional design inspired by premium service websites.

## 🎨 Design System

### Color Palette
- **Primary**: Cyan/Turquoise (#06b6d4)
- **Secondary**: Light Blue (#f0f9ff)
- **Accent**: Sky Blue (#0ea5e9)
- **Text**: Slate colors (#334155, #64748b, #94a3b8)
- **Background**: Light Gray (#f8fafc)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Secondary Font**: Cairo (Arabic support)
- **Headings**: Bold, modern styling with gradient effects
- **Body Text**: Clean, readable with proper line height

### Components
- **Cards**: Clean white cards with subtle shadows and hover effects
- **Buttons**: Modern gradient buttons with hover animations
- **Forms**: Clean inputs with focus states and validation
- **Navigation**: Minimal, professional with dropdown menus

## 🚀 Features

### Frontend Features
- **Modern UI/UX**: Clean, professional design matching premium service websites
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: Fade-in effects and hover animations
- **Interactive Elements**: Floating elements and gradient backgrounds
- **Professional Typography**: Clean, readable fonts with proper hierarchy

### Backend Features
- **RESTful API**: Complete CRUD operations for services
- **File Upload**: Image handling for service photos
- **Booking System**: Complete booking management
- **CORS Support**: Cross-origin resource sharing enabled
- **Static File Serving**: Efficient image serving

### Pages
1. **Home**: Hero section with services overview and testimonials
2. **Services**: Grid/List view with search and filtering
3. **Service Detail**: Detailed service information with booking modal
4. **Book Service**: Multi-step booking form
5. **About**: Company information and team details
6. **Contact**: Contact form and information
7. **Dashboard**: Admin panel for service management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React Toastify** for notifications
- **Vite** for build tool

### Backend
- **Node.js** with Express
- **Multer** for file uploads
- **CORS** for cross-origin requests
- **JSON** file-based data storage

## 📁 Project Structure

```
mawasiem-main/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── ServiceDetail.tsx
│   │   │   ├── BookService.tsx
│   │   │   ├── About.tsx
│   │   │   └── Contact.tsx
│   │   ├── index.css (Design System)
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── server.js
│   ├── data/
│   │   └── services.json
│   └── uploads/
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mawasiem-main
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   node server.js
   ```
   Backend will run on `http://localhost:3001`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173` (or next available port)

### Building for Production

```bash
cd frontend
npm run build
```

## 🎯 Key Features Implemented

### 1. Modern Design System
- Clean, professional UI inspired by premium service websites
- Consistent color scheme and typography
- Smooth animations and hover effects
- Glass morphism effects and gradients

### 2. Responsive Navigation
- Clean header with logo and navigation
- Dropdown menus for sub-pages
- Mobile-responsive hamburger menu
- Professional footer with links and contact info

### 3. Enhanced Home Page
- Hero section with professional imagery
- Service cards with hover effects
- About section with company information
- Testimonials and customer reviews
- Call-to-action sections

### 4. Services Management
- Grid and list view options
- Search and filtering functionality
- Category-based organization
- Professional service cards with images

### 5. Booking System
- Multi-step booking form
- Form validation and error handling
- Service summary sidebar
- Success confirmation page

### 6. Professional Pages
- About page with team and company info
- Contact page with form and information
- Consistent design across all pages

## 🔧 API Endpoints

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings (admin)

### File Upload
- `POST /api/upload` - Upload service images

## 🎨 Design Principles

1. **Clean & Modern**: Minimal design with focus on content
2. **Professional**: Business-appropriate color scheme and typography
3. **User-Friendly**: Intuitive navigation and clear call-to-actions
4. **Responsive**: Works perfectly on all screen sizes
5. **Performance**: Optimized images and efficient code

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

### Backend Deployment
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS EC2

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: info@hocare.com
- Phone: +1 (234) 567-890

---

**HO-CARE** - Professional Home Services Platform
*Built with React, TypeScript, and Tailwind CSS* 