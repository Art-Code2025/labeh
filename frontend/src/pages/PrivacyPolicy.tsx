import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';

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
    <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-100 text-gray-800">
      <header className="relative bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-20 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
          <div className="mb-4 animate-fade-in">
            <Lock className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-lg">سياسة الخصوصية</h1>
          <p className="text-blue-100 text-lg">آخر تحديث: 1 يوليو 2025</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-2 animate-fade-in">
        <div className="w-full max-w-2xl bg-white/80 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-md border border-blue-100">
          <p className="whitespace-pre-line leading-loose text-right text-lg text-blue-900 font-medium">
            {policyText}
          </p>
        </div>
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white/80 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 backdrop-blur-md"
        aria-label="العودة للأعلى"
      >
        <ArrowRight className="w-6 h-6 transform rotate-90" />
      </button>
    </div>
  );
};

export default PrivacyPolicy; 