import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

const TermsConditions: React.FC = () => {
  const termsText = `تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية

مرحباً بك في "لبيه"، باستخدامك لخدماتنا فإنك توافق صراحة على الالتزام بالشروط والأحكام التالية والتي تحكم العلاقة بين المستخدم والمنصة.

1. تعريف الخدمة
"لبيه" تقدم خدمات التوصيل والمشاوير، من خلال وسطاء مستقلين أو شركاء، داخل وخارج المدن، مع الالتزام الكامل بالأنظمة المرورية والبلدية المعمول بها داخل المملكة العربية السعودية.

2. شروط الاستخدام
يشترط أن يكون المستخدم فوق 18 سنة.

يجب تقديم معلومات صحيحة وحديثة أثناء استخدام الخدمة.

يُمنع استخدام المنصة في أي نشاط غير مشروع أو مخالف للآداب العامة.

3. حدود المسؤولية
"لبيه" ليست مسؤولة عن أي ضرر مباشر أو غير مباشر ينشأ عن تأخير أو فشل في الخدمة بسبب ظروف قاهرة أو خارجة عن الإرادة.

المنصة ليست مسؤولة عن تصرفات السائقين أو مقدمي الخدمة، لكننا نلتزم باتخاذ الإجراءات اللازمة في حال وجود شكوى موثقة.

4. الملكية الفكرية
جميع الحقوق الفكرية للعلامة التجارية "لبيه"، بما في ذلك الشعارات، المحتوى، وأي تصميم، محفوظة بالكامل، ويُمنع استخدامها أو إعادة نشرها دون إذن كتابي مسبق.

5. التعديلات
يحق لإدارة "لبيه" تعديل أو تحديث الشروط في أي وقت دون إشعار مسبق، وتُعتبر سارية بمجرد نشرها على المنصة.`;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-100 text-gray-800">
      <header className="relative bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-20 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 text-center flex flex-col items-center">
          <div className="mb-4 animate-fade-in">
            <ShieldCheck className="w-16 h-16 text-white/80 drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight drop-shadow-lg">الشروط والأحكام</h1>
          <p className="text-blue-100 text-lg">آخر تحديث: 1 يوليو 2025</p>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-2 animate-fade-in">
        <div className="w-full max-w-2xl bg-white/80 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-md border border-blue-100">
          <p className="whitespace-pre-line leading-loose text-right text-lg text-blue-900 font-medium">
            {termsText}
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

export default TermsConditions; 