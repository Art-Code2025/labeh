import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  User,
  Building,
  Facebook,
  Video
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFacebook, FaTiktok, FaSnapchat } from 'react-icons/fa';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: Phone,
      title: 'اتصل بنا',
      details: '+966 56 980 6839',
      description: 'متاح 24/7',
      action: 'tel:+966 56 980 6839'
    },
    {
      icon: Mail,
      title: 'راسلنا',
      details: 'elsadig6839@gmail.com',
      description: 'الدعم الفني',
      action: 'mailto:elsadig6839@gmail.com'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: '24 ساعة',
      description: 'طوال أيام الأسبوع',
      action: '#'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir="rtl">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-primary mb-6 animate-fade-in-up">
              تواصل <span className="text-gradient">معنا</span>
            </h1>
            <p className="text-body mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              تواصل مع فريقنا لأي استفسارات أو دعم أو لجدولة خدمة.
              نحن هنا لمساعدتك في جميع احتياجات خدماتك المنزلية.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div 
                  key={index} 
                  className="card p-6 text-center hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="feature-icon mx-auto">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{info.title}</h3>
                  <p className="text-slate-900 font-semibold mb-1" dir="ltr">{info.details}</p>
                  <p className="text-slate-600 text-sm">{info.description}</p>
                  {info.action !== '#' && (
                    <a 
                      href={info.action}
                      className="inline-block mt-4 text-cyan-600 hover:text-cyan-700 font-semibold"
                    >
                      تواصل الآن
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-secondary mb-4">الأسئلة الشائعة</h2>
            <p className="text-body max-w-2xl mx-auto">
              اعثر على إجابات للأسئلة الشائعة حول خدماتنا وعملياتنا
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">ما هي خدماتكم الأساسية؟</h3>
                <p className="text-slate-600">نقدم خدمات متنوعة تشمل المشاوير الداخلية، المشاوير الخارجية، وخدمات الصيانة المنزلية الشاملة. نعمل على مدار الساعة لتلبية احتياجاتكم.</p>
              </div>
              
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">ما هي قيم الشركة الأساسية؟</h3>
                <p className="text-slate-600">نعمل وفق قيم أساسية تشمل الأمانة، الاحترافية، الابتكار، وخدمة العميل المتميزة. نسعى دائماً لتقديم أفضل تجربة من خلال منصاتنا الإلكترونية.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">كيف يمكنني طلب خدمة؟</h3>
                <p className="text-slate-600">يمكنك طلب الخدمة من خلال موقعنا الإلكتروني أو الاتصال بنا مباشرة. نحن متاحون 24/7 لتلبية طلباتكم وتقديم الدعم اللازم.</p>
              </div>
              
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">هل تقدمون ضمانات على خدماتكم؟</h3>
                <p className="text-slate-600">نعم، نقدم ضمانات شاملة على جميع خدماتنا، مع شروط محددة تختلف حسب نوع الخدمة. هدفنا هو ضمان رضاكم التام عن خدماتنا.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cyan-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            تواصل معنا اليوم للحصول على استشارة مجانية ودعنا نساعدك في تلبية احتياجاتك.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+966569806839" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">
              <Phone className="w-5 h-5 ml-2" />
              اتصل الآن
            </a>
            <a href="mailto:elsadig6839@gmail.com" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">
              <Mail className="w-5 h-5 ml-2" />
              راسلنا
            </a>
          </div>
          
          {/* Social Media Links */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-6">تابعنا على وسائل التواصل</h3>
            <div className="flex items-center justify-center gap-4">
              <a 
                href="https://www.facebook.com/share/r/173WAK1VMD/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-[#1877F2] rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg text-white" 
                title="فيسبوك"
              >
                <div className="w-7 h-7">
                  <FaFacebook size="100%" />
                </div>
              </a>
              <a 
                href="https://www.tiktok.com/@elsadigabualeen2019?_t=ZS-8xdjQmw2TX5&_r=1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-black rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg text-white" 
                title="تيك توك"
              >
                <div className="w-7 h-7">
                  <FaTiktok size="100%" />
                </div>
              </a>
              <a 
                href="https://snapchat.com/t/GOre0s0V" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-[#FFFC00] rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg text-black" 
                title="سناب شات"
              >
                <div className="w-7 h-7">
                  <FaSnapchat size="100%" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Contact;
