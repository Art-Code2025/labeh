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
  Building
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      title: 'Call Us',
      details: '+1 (234) 567-890',
      description: 'Mon-Fri from 8am to 5pm',
      action: 'tel:+1234567890'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: 'info@hocare.com',
      description: 'Online support',
      action: 'mailto:info@hocare.com'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Main Street',
      description: 'City, State 12345',
      action: '#'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: 'Mon - Fri: 8AM - 5PM',
      description: 'Weekend: 9AM - 3PM',
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

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-primary mb-6 animate-fade-in-up">
              Contact <span className="text-gradient">Us</span>
            </h1>
            <p className="text-body mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Get in touch with our team for any questions, support, or to schedule a service. 
              We're here to help you with all your home service needs.
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
                  <p className="text-slate-900 font-semibold mb-1">{info.details}</p>
                  <p className="text-slate-600 text-sm">{info.description}</p>
                  {info.action !== '#' && (
                    <a 
                      href={info.action}
                      className="inline-block mt-4 text-cyan-600 hover:text-cyan-700 font-semibold"
                    >
                      Contact Now
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-fade-in-left">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="+1 (234) 567-890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="service">Service Request</option>
                        <option value="support">Support</option>
                        <option value="quote">Request Quote</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="form-textarea"
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Map & Additional Info */}
            <div className="animate-fade-in-right">
              {/* Map Placeholder */}
              <div className="card p-8 mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Our Location</h3>
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive Map</p>
                    <p className="text-sm text-gray-400">123 Main Street, City, State 12345</p>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="card p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Emergency Service</p>
                      <a href="tel:+1234567890" className="text-cyan-600 hover:text-cyan-700">
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Live Chat</p>
                      <button className="text-cyan-600 hover:text-cyan-700">
                        Start a conversation
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Office Hours</p>
                      <p className="text-slate-600">Mon-Fri: 8AM-5PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="heading-secondary mb-4">Frequently Asked Questions</h2>
            <p className="text-body max-w-2xl mx-auto">
              Find answers to common questions about our services and processes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">How quickly can you respond to service calls?</h3>
                <p className="text-slate-600">We typically respond within 2-4 hours for standard requests and within 1 hour for emergency services.</p>
              </div>
              
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">Are your technicians licensed and insured?</h3>
                <p className="text-slate-600">Yes, all our technicians are fully licensed, bonded, and insured for your peace of mind.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">Do you offer warranties on your work?</h3>
                <p className="text-slate-600">We provide a comprehensive warranty on all our services, with specific terms varying by service type.</p>
              </div>
              
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-3">What payment methods do you accept?</h3>
                <p className="text-slate-600">We accept cash, checks, and all major credit cards for your convenience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cyan-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and let us help you with your home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+1234567890" className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </a>
            <a href="mailto:info@hocare.com" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Us
            </a>
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
