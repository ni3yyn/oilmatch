import React from "react";
import "./Pages.css";

const HowToUse = () => {
  return (
    <div className="page glassy">
      <h2>كيفية استخدام الزيوت</h2>
      <p>استخدام الزيوت بشكل صحيح يعزز من فعاليتها ويحافظ على صحة شعرك. إليك بعض النصائح:</p>

      <ul className="tips-list">
        <li><strong>للتطويل:</strong> ضع الزيت على فروة الرأس ودلك بلطف لمدة 5 دقائق.</li>
        <li><strong>للتقوية:</strong> وزع الزيت على كامل الشعر واتركه لمدة ساعة قبل الغسل.</li>
        <li><strong>للتقليل من القشرة:</strong> استخدم زيوت مثل زيت شجرة الشاي مرتين في الأسبوع.</li>
        <li><strong>للترطيب:</strong> أضف بضع قطرات من زيت الجوجوبا إلى البلسم.</li>
      </ul>
    </div>
  );
};

export default HowToUse;
