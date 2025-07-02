import React from 'react';
import { ArrowRight, UserCheck } from 'lucide-react';

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
تخضع هذه الاتفاقية وتُفسَّر وفقًا لأنظمة المملكة العربية السعودية.

في حال وجود أي نزاع، تُحال القضية للجهات القضائية المختصة داخل المملكة.

5. التواصل والاستفسارات
لأي طلب قانوني أو استفسار يتعلق بالاتفاقيات والشروط، يرجى التواصل معنا على:

📞 رقم الجوال: +966 56 980 6839
📧 البريد الإلكتروني: elsadig6839@gmail.com`;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-100 text-gray-800">
      <header className="relative bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-20 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
          <div className="mb-4 animate-fade-in">
            <UserCheck className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-lg">اتفاقية الاستخدام</h1>
          <p className="text-blue-100 text-lg">آخر تحديث: 1 يوليو 2025</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-2 animate-fade-in">
        <div className="w-full max-w-2xl bg-white/80 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-md border border-blue-100">
          <p className="whitespace-pre-line leading-loose text-right text-lg text-blue-900 font-medium">
            {agreementText}
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

export default UserAgreement; 