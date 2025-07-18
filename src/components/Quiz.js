import React, { useState } from 'react';

function Quiz({ onQuizComplete }) {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const [climate, setClimate] = useState('');
  const [scalp, setScalp] = useState('');
  const [balding, setBalding] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState('');

  const next = () => {
    setError('');
    setStep((prev) => prev + 1);
  };
  const prev = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    if (!gender || !climate || !scalp || !balding || !goal) {
      setError('عمر كلش يالأخ ولا الأخت');
      return;
    }
  
    const oils = [];
    const descriptions = [];
  
    // === [1] Foundational Oil: Based on Gender or Climate ===
    if (gender === 'male') {
      oils.push('زيت بذور اليقطين');
      descriptions.push('يساعد زيت بذور اليقطين على تقليل هرمون DHT المرتبط بتساقط الشعر عند الرجال.');
    } else if (gender === 'female') {
      oils.push('زيت الخزامى');
      descriptions.push('يدعم زيت الخزامى توازن الهرمونات ويهدئ فروة الرأس.');
    } else if (climate === 'dry') {
      oils.push('زيت الجوجوبا');
      descriptions.push('زيت الجوجوبا يرطّب الفروة الجافة ويحاكي الزيوت الطبيعية.');
    } else if (climate === 'humid') {
      oils.push('زيت شجرة الشاي');
      descriptions.push('يقوم زيت شجرة الشاي بتنظيف فروة الرأس ومكافحة الفطريات في المناطق الرطبة.');
    } else {
      oils.push('زيت الأرجان');
      descriptions.push('يعزّز زيت الأرجان لمعان الشعر ويغذّي الفروة في المناخات المعتدلة.');
    }
  
    // === [2] Supportive Oil: Based on Scalp or Balding ===
    if (scalp === 'dry') {
      oils.push('زيت الأفوكادو');
      descriptions.push('زيت الأفوكادو غني بالدهون التي تغذّي فروة الرأس الجافة.');
    } else if (scalp === 'oily') {
      oils.push('زيت بذور العنب');
      descriptions.push('ينظّم زيت بذور العنب الإفرازات الدهنية ويقلل التهيج.');
    } else if (scalp === 'sensitive') {
      oils.push('زيت اللوز الحلو');
      descriptions.push('زيت اللوز الحلو لطيف ومناسب للفروات الحساسة.');
    } else if (balding === 'crown') {
      oils.push('زيت إكليل الجبل');
      descriptions.push('يزيد زيت إكليل الجبل من تدفق الدم إلى بصيلات الشعر.');
    } else if (balding === 'temples') {
      oils.push('زيت النعناع');
      descriptions.push('يحفّز زيت النعناع النمو في مناطق الجبهة والجانبين.');
    } else if (balding === 'diffuse') {
      oils.push('زيت الخروع الأسود');
      descriptions.push('يدعم زيت الخروع الأسود نمو الشعر المتناثر في جميع أنحاء الرأس.');
    }
  
    // === [3] Targeted Oil: Based on Goal ===
    if (goal === 'regrowth') {
      oils.push('زيت الحبة السوداء');
      descriptions.push('زيت الحبة السوداء يساعد على تنشيط بصيلات الشعر لنمو جديد.');
    } else if (goal === 'thickness') {
      oils.push('زيت الخروع');
      descriptions.push('يعزّز زيت الخروع كثافة الشعر وقوته.');
    } else if (goal === 'dandruff') {
      oils.push('زيت النيم');
      descriptions.push('يعمل زيت النيم على محاربة الفطريات المسببة للقشرة وتنظيف الفروة.');
    }
  
    // Final blend (limit to 3, unique)
    const uniqueOils = [...new Set(oils)].slice(0, 3);
    const uniqueDescriptions = uniqueOils.map((oil, i) => {
      const index = oils.indexOf(oil);
      return `${oil}: ${descriptions[index]}`;
    });
  
    const finalBlend = uniqueOils.join(', ');
    const explanation = uniqueDescriptions.join('\n');
  
    onQuizComplete({
      gender,
      climate,
      scalp,
      balding,
      goal,
      blend: finalBlend,
      explanation,
    });
  };
  

  const progress = Math.round((step / 5) * 100);

  return (
    <div>
      <p className="stagger-1" style={{ fontSize: '14px', marginBottom: '10px' }}>الخطوة {step} من 5</p>
      <div className="stagger-1" style={{ height: '6px', width: '100%', background: '#eee', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#b2d8b2', transition: 'width 0.4s ease' }}></div>
      </div>

      {step === 1 && (
  <div>
    <label className="stagger-1">ما جنسك؟</label>
    <select className="stagger-2" value={gender} onChange={(e) => setGender(e.target.value)}>
      <option value="">اختر</option>
      <option value="male">ذكر</option>
      <option value="female">أنثى</option>
      
    </select>
    <button disabled={!gender} onClick={next} style={{ marginTop: '20px' }}>التالي ←</button>
  </div>
)}

{step === 2 && (
  <div>
    <label className="stagger-1">ما طبيعة المناخ في منطقتك؟</label>
    <select className="stagger-2" value={climate} onChange={(e) => setClimate(e.target.value)}>
      <option value="">اختر</option>
      <option value="humid">رطب (ساحل الجزائر)</option>
      <option value="dry">جاف (الجنوب الصحراوي)</option>
      <option value="temperate">معتدل (المدن الداخلية)</option>
    </select>
    <div className="animate-fade-slide" style={{ marginTop: '20px' }}>
      <button onClick={prev}>← رجوع</button>
      <button disabled={!climate} onClick={next} style={{ float: 'right' }}>التالي ←</button>
    </div>
  </div>
)}

{step === 3 && (
  <div>
    <label className="stagger-1">ما نوع فروة رأسك؟</label>
    <select className="stagger-2" value={scalp} onChange={(e) => setScalp(e.target.value)}>
      <option value="">اختر</option>
      <option value="dry">جافة</option>
      <option value="oily">دهنية</option>
      <option value="sensitive">حساسة</option>
    </select>
    <div className="animate-fade-slide" style={{ marginTop: '20px' }}>
      <button onClick={prev}>← رجوع</button>
      <button disabled={!scalp} onClick={next} style={{ float: 'right' }}>التالي ←</button>
    </div>
  </div>
)}

{step === 4 && (
  <div>
    <label className="stagger-1">أين يتركز تساقط الشعر؟</label>
    <select className="stagger-2" value={balding} onChange={(e) => setBalding(e.target.value)}>
      <option value="">اختر</option>
      <option value="crown">قمة الرأس</option>
      <option value="temples">الجانبين (مقدمة الرأس)</option>
      <option value="diffuse">منتشر في كل الرأس</option>
    </select>
    <div className="animate-fade-slide" style={{ marginTop: '20px' }}>
      <button onClick={prev}>← رجوع</button>
      <button disabled={!balding} onClick={next} style={{ float: 'right' }}>التالي ←</button>
    </div>
  </div>
)}

{step === 5 && (
  <div>
    <label className="stagger-1">ما هدفك من استخدام الزيت؟</label>
    <select className="stagger-2" value={goal} onChange={(e) => setGoal(e.target.value)}>
      <option value="">اختر</option>
      <option value="regrowth">نمو الشعر من جديد</option>
      <option value="thickness">تكثيف الشعر</option>
      <option value="dandruff">إزالة القشرة</option>
    </select>
    <div className="animate-fade-slide" style={{ marginTop: '20px' }}>
      <button onClick={prev}>← رجوع</button>
      <button disabled={!goal} onClick={handleSubmit} style={{ float: 'right' }}>النتيجة →</button>
    </div>
  </div>
)}

{error && <p style={{ color: 'red', marginTop: '15px' }}>عمر كلش يالأخ ولا الأخت</p>}
    </div>
  );
}

export default Quiz;
