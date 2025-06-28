import { Routes, Route } from 'react-router-dom';
import Layout, { ProtectedRoute } from './components/Layout';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import BookService from './pages/BookService';
import Login from './Login';
import Dashboard from './Dashboard';
import ServiceForm from './ServiceForm';
import About from './pages/About';
import Contact from './pages/Contact';
import Media from './pages/Media';
import Partners from './pages/Partners';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/book/:id" element={<BookService />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/:id" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
        <Route path="/dashboard/add" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
        <Route path="/dashboard/edit/:id" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/media" element={<Media />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;