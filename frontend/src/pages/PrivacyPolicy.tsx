import React from 'react';
import { ArrowRight } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const policyText = `بموجب أنظمة المملكة العربية السعودية

مرحباً بكم في منصة "لبيه"، وهي علامة تجارية سعودية متخصصة في تقديم خدمات التوصيل وخدمة المشاوير داخل وخارج المدن في المملكة العربية السعودية. نحن نولي أهمية كبيرة لحماية خصوصية مستخدمينا وبياناتهم الشخصية، ونعمل على ضمان الشفافية والامتثال لأنظمة حماية البيانات المعمول بها في المملكة العربية السعودية، وعلى وجه الخصوص نظام حماية البيانات الشخصية الصادر عن الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA).

1. المعلومات التي نقوم بجمعها
نقوم بجمع واستخدام أنواع مختلفة من المعلومات، وذلك فقط لتحقيق غايات تشغيلية وخدمية ضرورية، وتشمل:

المعلومات الشخصية: مثل الاسم، رقم الجوال، موقع الطلب، المدينة، معلومات التعريف.

موقع الجهاز: يتم تتبعه أثناء تنفيذ الطلب، بعد موافقتك الصريحة عبر التطبيق.

بيانات الاستخدام: تشمل سجل الطلبات، التفضيلات، أوقات الاستخدام، ونوع الجهاز المستخدم.

2. كيفية استخدام البيانات
نستخدم بياناتك للأغراض التالية:

تنفيذ خدمات التوصيل أو المشاوير المطلوبة.

تحسين جودة الخدمة وتخصيص التجربة للمستخدمين.

التواصل مع المستخدم لتأكيد أو تعديل الطلبات.

3. حماية البيانات
نستخدم أنظمة حماية إلكترونية وتقنية حديثة لضمان سلامة بياناتك.

لا نشارك بياناتك مع أي طرف ثالث إلا عند الضرورة التشغيلية وبعد التأكد من التزامه بالأنظمة.

يتم الاحتفاظ بالبيانات فقط للمدة النظامية اللازمة، وفقاً للضوابط المعتمدة.

4. حقوق المستخدم
يحق لك طلب الوصول إلى بياناتك أو تعديلها أو حذفها في أي وقت.

يمكنك التواصل معنا مباشرة من خلال الرقم أو البريد الإلكتروني أدناه لممارسة هذه الحقوق.

5. التواصل معنا
إذا كانت لديك أي أسئلة أو استفسارات بخصوص سياسة الخصوصية أو حماية البيانات، يمكنك التواصل معنا عبر:

📞 رقم الجوال: +966 56 980 6839
📧 البريد الإلكتروني: elsadig6839@gmail.com`;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* Hero */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">سياسة الخصوصية</h1>
          <p className="text-blue-100">آخر تحديث: 1 يوليو 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <p className="whitespace-pre-line leading-loose text-right">
          {policyText}
        </p>
      </main>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50"
        aria-label="العودة للأعلى"
      >
        <ArrowRight className="w-5 h-5 transform rotate-90" />
      </button>
    </div>
  );
};

export default PrivacyPolicy; 