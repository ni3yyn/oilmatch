import React from 'react';

function Result({ blend }) {
  const descriptions = {
    "زيت الجوجوبا": "🟡 يرطّب فروة الرأس الجافة بعمق ويوازن إفراز الدهون.",
    "زيت بذور اليقطين": "🎃 ينظّم الإفرازات الدهنية ويدعم كثافة الشعر.",
    "زيت اللوز الحلو": "🌸 يهدّئ البشرة الحساسة ويضفي لمعاناً على الشعر.",
    "زيت إكليل الجبل": "🌿 ينشّط الدورة الدموية في منطقة قمة الرأس.",
    "زيت النعناع": "❄️ يعزّز بصيلات الشعر في الجانبين وينعش فروة الرأس.",
    "زيت الخروع": "💧 يقوّي الشعر المتساقط في كامل الرأس ويمنع التكسر.",
    "زيت الحبة السوداء": "🖤 محفّز أسطوري لنمو الشعر بفضل خصائصه المضادة للالتهاب.",
    "زيت الأرجان": "✨ يضفي كثافة وحجماً وملمساً حريرياً على الشعر.",
    "زيت شجرة الشاي": "🌱 يحارب القشرة ويفتح مسام بصيلات الشعر.",
  };

  const blendArray = blend.split(',').map(o => o.trim());

  return (
    <div dir="center" className="animate-fade-slide animate-delay-2" style={{ marginTop: '30px' }}>
      <h3 style={{ fontStyle: 'italic', color: '#555' }}>تركيبتك الزيتية المخصصة</h3>
      <p dir="rtl" className="animate-fade-slide animate-delay-2" style={{ fontStyle: 'italic', color: '#555', marginBottom: '10px' }}>
        بناءً على إجاباتك، حضّرنا لك هذه التركيبة الفعالة:
      </p>

      <ul dir="rtl" className="animate-fade-slide animate-delay-2" style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {blendArray.map((oil, index) => (
          <li dir="rtl" className="animate-fade-slide animate-delay-2" key={index} style={{ marginBottom: '8px', fontSize: '15px' }}>
            <strong>{oil}</strong>: {descriptions[oil] || "—"}
          </li>
        ))}
      </ul>

      <p dir="rtl" className="animate-fade-slide animate-delay-2" style={{ marginTop: '20px', color: '#444' }}>
        سيتم تحضير هذه التركيبة طازجة وإرسالها مباشرة إلى عنوانك بمجرد إتمام الطلب أدناه.
      </p>
    </div>
  );
}

export default Result;
