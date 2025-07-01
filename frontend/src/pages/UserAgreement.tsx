import React from 'react';
import { ArrowRight } from 'lucide-react';

const UserAgreement: React.FC = () => {
  const agreementText = `صادرة بموجب الأنظمة القضائية والتنظيمية في المملكة العربية السعودية

تُعد هذه الاتفاقية عقدًا ملزمًا بين المستخدم ومنصة "لبيه"، وتوضح حقوق والتزامات كل طرف.

1. التسجيل واستخدام المنصة
عند التسجيل في المنصة، فإنك تقر بأن جميع المعلومات المقدمة صحيحة وتتحمل المسؤولية الكاملة عنها.

يُمنع مشاركة الحساب مع أي طرف آخر دون تصريح رسمي.

2. التزامات المستخدم
الامتثال التام للشروط والتعليمات الصادرة من المنصة.

احترام السائقين ومقدمي الخدمة وعدم إصدار أي تصرف مسيء أو غير لائق.

استخدام الخدمة فقط في الإطار القانوني والنظامي داخل المملكة.

3. إنهاء الاستخدام
يحق لـ"لبيه" إنهاء أو تعليق الحساب في حال وجود انتهاك لأي بند من الاتفاقية دون الحاجة لتقديم مبرر.

يحق للمستخدم إيقاف استخدام الخدمة في أي وقت مع مراعاة التزامات الطلبات القائمة.

4. القانون المعمول به
تخضع هذه الاتفاقية وتُفسّر وفقًا لأنظمة المملكة العربية السعودية.

في حال وجود أي نزاع، تُحال القضية للجهات القضائية المختصة داخل المملكة.

5. التواصل والاستفسارات
لأي طلب قانوني أو استفسار يتعلق بالاتفاقيات والشروط، يرجى التواصل معنا على:

📞 رقم الجوال: +966 56 980 6839
📧 البريد الإلكتروني: elsadig6839@gmail.com`;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-white text-gray-800">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">اتفاقية الاستخدام</h1>
          <p className="text-blue-100">آخر تحديث: 1 يوليو 2025</p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <p className="whitespace-pre-line leading-loose text-right">
          {agreementText}
        </p>
      </main>

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

export default UserAgreement; 