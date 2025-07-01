import React from 'react';
import { ArrowRight } from 'lucide-react';

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
    <div dir="rtl" className="min-h-screen flex flex-col bg-white text-gray-800">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">الشروط والأحكام</h1>
          <p className="text-blue-100">آخر تحديث: 1 يوليو 2025</p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <p className="whitespace-pre-line leading-loose text-right">
          {termsText}
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

export default TermsConditions; 