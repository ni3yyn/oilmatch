import React from 'react';

function Result({ blend }) {
  const descriptions = {
    "Jojoba Oil": "🟡 يرطّب فروة الرأس الجافة بعمق ويوازن إفراز الدهون.",
    "Pumpkin Seed Oil": "🎃 ينظّم الإفرازات الدهنية ويدعم كثافة الشعر.",
    "Sweet Almond Oil": "🌸 يهدّئ البشرة الحساسة ويضفي لمعاناً على الشعر.",
    "Rosemary Oil": "🌿 ينشّط الدورة الدموية في منطقة قمة الرأس.",
    "Peppermint Oil": "❄️ يعزّز بصيلات الشعر في الجانبين وينعش فروة الرأس.",
    "Castor Oil": "💧 يقوّي الشعر المتساقط في كامل الرأس ويمنع التكسر.",
    "Black Seed Oil": "🖤 محفّز أسطوري لنمو الشعر بفضل خصائصه المضادة للالتهاب.",
    "Argan Oil": "✨ يضفي كثافة وحجماً وملمساً حريرياً على الشعر.",
    "Tea Tree Oil": "🌱 يحارب القشرة ويفتح مسام بصيلات الشعر.",
  };

  const blendArray = blend.split(',').map(o => o.trim());

  return (
    <div className="animate-fade-slide animate-delay-2" style={{ marginTop: '30px' }}>
      <h3>تركيبتك الزيتية المخصصة</h3>
      <p className="animate-fade-slide animate-delay-2" style={{ fontStyle: 'italic', color: '#555', marginBottom: '10px' }}>
        بناءً على إجاباتك، حضّرنا لك هذه التركيبة الفعالة:
      </p>

      <ul className="animate-fade-slide animate-delay-2" style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {blendArray.map((oil, index) => (
          <li className="animate-fade-slide animate-delay-2" key={index} style={{ marginBottom: '8px', fontSize: '15px' }}>
            <strong>{oil}</strong>: {descriptions[oil] || "—"}
          </li>
        ))}
      </ul>

      <p className="animate-fade-slide animate-delay-2" style={{ marginTop: '20px', color: '#444' }}>
        سيتم تحضير هذه التركيبة طازجة وإرسالها مباشرة إلى عنوانك بمجرد إتمام الطلب أدناه.
      </p>
    </div>
  );
}

export default Result;
