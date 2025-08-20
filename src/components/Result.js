import React from 'react';
import '../Quiz.css';

// Import all icons
import jojobaIcon from '../icons/jojoba.png';
import pumpkinseedsIcon from '../icons/pumpkinseeds.png';
import arganIcon from '../icons/argan.png';
import rosemaryIcon from '../icons/rosemary.png';
import peppermintIcon from '../icons/peppermint.png';
import castorIcon from '../icons/castor.png';
import blackseedIcon from '../icons/blackseed.png';
import neemIcon from '../icons/neem.png';
import almondIcon from '../icons/sweetalmond.png';
import coconutIcon from '../icons/coconut.png';

function Result({ blend }) {
  const descriptions = {
    "زيت الجوجوبا": "مطابق كيميائياً لزيت الشعر الطبيعي - يوازن الإفرازات الدهنية ويمنع الانسداد",
    "زيت بذور اليقطين": "مثبط طبيعي لـ DHT - يقلل تساقط الشعر الهرموني ويدعم الكثافة",
    "زيت الأرغان": "غني بفيتامين E ومضادات الأكسدة - يحمي من التلف الحراري ويصلح التقصف",
    "زيت إكليل الجبل": "محفز للدورة الدموية - يزيد توصيل الغذاء للبصيلات ويسرع النمو",
    "زيت النعناع": "منشط للدورة الدموية - يخفض درجة حرارة الفروة ويقلل الالتهابات",
    "زيت الخروع": "غني بحمض الريسينوليك - يقوي البصيلات ويزيد سماكة الشعرة",
    "زيت الحبة السوداء": "مضاد للالتهابات والفطريات - ينظم مناعة الفروة ويمنع التساقط",
    "زيت النيم": "مطهر قوي - يقضي على البكتيريا المسببة للقشرة والحكة",
    "زيت اللوز الحلو": "غني بالأحماض الدهنية أوميغا-9 - يرطب بعمق دون انسداد المسام",
    "زيت جوز الهند": "جزيئات صغيرة تخترق القشرة - تمنع فقدان البروتين وتحافظ على الرطوبة"
  };

  const icons = {
    "زيت الجوجوبا": jojobaIcon,
    "زيت بذور اليقطين": pumpkinseedsIcon,
    "زيت الأرغان": arganIcon,
    "زيت إكليل الجبل": rosemaryIcon,
    "زيت النعناع": peppermintIcon,
    "زيت الخروع": castorIcon,
    "زيت الحبة السوداء": blackseedIcon,
    "زيت النيم": neemIcon,
    "زيت اللوز الحلو": almondIcon,
    "زيت جوز الهند": coconutIcon
  };

  const emojiFallbacks = {
    "زيت الجوجوبا": "⚖️",
    "زيت بذور اليقطين": "💪",
    "زيت الأرغان": "✨",
    "زيت إكليل الجبل": "🔄",
    "زيت النعناع": "❄️",
    "زيت الخروع": "📈",
    "زيت الحبة السوداء": "🛡️",
    "زيت النيم": "🧴",
    "زيت اللوز الحلو": "🤲",
    "زيت جوز الهند": "🛡️"
  };

  // Safe blend parsing with error handling
  const parseBlend = () => {
    try {
      if (!blend) return [];
      if (Array.isArray(blend)) return blend;
      return JSON.parse(blend);
    } catch (e) {
      console.error("Error parsing blend:", e);
      return [];
    }
  };

  const blendArray = parseBlend();

  if (blendArray.length === 0) {
    return (
      <div className="resultcontainer glassy animate-fade-slide" style={{ padding: '40px 25px' }}>
        <h3 className="result-intro">عذراً، حدث خطأ في تحميل التركيبة</h3>
        <p className="error-message">الرجاء المحاولة مرة أخرى أو اختيار تركيبة أخرى</p>
      </div>
    );
  }

  // Helper function to render icon (image or emoji)
  const renderIcon = (oilName) => {
    const iconSrc = icons[oilName];
    const fallbackEmoji = emojiFallbacks[oilName] || "🌿";
    
    if (!iconSrc) {
      return fallbackEmoji;
    }

    return (
      <img 
        src={iconSrc} 
        alt={oilName}
        className="oil-icon-img"
        onError={(e) => {
          // If image fails to load, show emoji instead
          e.target.style.display = 'none';
          const span = document.createElement('span');
          span.className = 'emoji-fallback';
          span.textContent = fallbackEmoji;
          e.target.parentNode.appendChild(span);
        }}
      />
    );
  };

  return (
    <div className="resultcontainer glassy animate-fade-slide" style={{ padding: '40px 25px' }}>
      <h3 className="result-intro">:أحسنت! هاهي النتيجة</h3>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="oilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" className="oil-progress-start" />
            <stop offset="100%" className="oil-progress-end" />
          </linearGradient>
        </defs>
      </svg>

      <ul className="oil-list">
        {blendArray.map((oil, index) => {
          const offset = 100 - (oil.percentage || 0);
          const description = descriptions[oil.name] || "زيت مفيد لصحة شعرك.";

          return (
            <li key={index} className="oil-item">
              <span className="oil-icon">
                {renderIcon(oil.name)}
              </span>
              <div className="oil-text">
                <h4>{oil.name || "زيت مخصص"}</h4>
                <p>{description}</p>
              </div>
              <div className="circular-progress-container">
                <svg viewBox="0 0 36 36" className="circular-progress-svg">
                  <path
                    className="circular-progress-track"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circular-progress-fill"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{ '--progress-offset': offset }}
                  />
                </svg>
                <div className="circular-percentage-text">
                  {oil.percentage || 0}%
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Result;