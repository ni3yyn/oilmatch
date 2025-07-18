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
      setError('Please complete all fields.');
      return;
    }

    const blend = [];

    // Gender-based foundation oils
    if (gender === 'male') blend.push('Pumpkin Seed Oil'); // anti-DHT
    if (gender === 'female') blend.push('Lavender Oil'); // hormonal balance
    if (gender === 'other') blend.push('Hemp Seed Oil'); // neutral & regenerative

    // Climate customization
    if (climate === 'dry') blend.push('Jojoba Oil'); // sebum mimic
    if (climate === 'humid') blend.push('Tea Tree Oil'); // antifungal
    if (climate === 'temperate') blend.push('Argan Oil'); // balance & shine

    // Scalp Type
    if (scalp === 'dry') blend.push('Avocado Oil');
    if (scalp === 'oily') blend.push('Grapeseed Oil');
    if (scalp === 'sensitive') blend.push('Sweet Almond Oil');

    // Balding Pattern
    if (balding === 'crown') blend.push('Rosemary Oil');
    if (balding === 'temples') blend.push('Peppermint Oil');
    if (balding === 'diffuse') blend.push('Black Castor Oil');

    // Goal
    if (goal === 'regrowth') blend.push('Black Seed Oil');
    if (goal === 'thickness') blend.push('Castor Oil');
    if (goal === 'dandruff') blend.push('Neem Oil');

    const finalBlend = [...new Set(blend)].join(', '); // remove duplicates

    onQuizComplete({ gender, climate, scalp, balding, goal, blend: finalBlend });
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
      <option value="other">آخر / أفضل عدم الإفصاح</option>
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
      <button disabled={!goal} onClick={handleSubmit} style={{ float: 'right' }}>عرض النتيجة →</button>
    </div>
  </div>
)}

{error && <p style={{ color: 'red', marginTop: '15px' }}>يرجى ملء جميع الحقول.</p>}
    </div>
  );
}

export default Quiz;
