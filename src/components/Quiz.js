// src/components/Quiz.js
import React, { useState } from 'react';
import '../Quiz.css';

function Quiz({ onQuizComplete }) {
  const [step, setStep] = useState(1);

  const [gender, setGender] = useState('');
  const [climate, setClimate] = useState('');
  const [scalp, setScalp] = useState('');
  const [hairFall, setHairFall] = useState('');
  const [issues, setIssues] = useState(''); // قشرة أو فطريات
  const [goal, setGoal] = useState('');

  const totalSteps = 6;

  const handleOptionClick = (value) => {
    switch (step) {
      case 1: setGender(value); break;
      case 2: setClimate(value); break;
      case 3: setScalp(value); break;
      case 4: setHairFall(value); break;
      case 5: setIssues(value); break;
      case 6: setGoal(value); break;
      default: break;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      const blend = determineBlend({ gender, climate, scalp, hairFall, issues, goal });
      onQuizComplete({ gender, climate, scalp, hairFall, issues, goal, blend });
    }
  };

  const oilsDB = [
    { name: "زيت الجوجوبا", tags: ["ترطيب", "دهني", "معتدل", "أنثى"] },
    { name: "زيت بذور اليقطين", tags: ["تكثيف", "تساقط", "ذكر", "معتدل"] },
    { name: "زيت الأرغان", tags: ["جاف", "ترطيب", "تكثيف", "أنثى"] },
    { name: "زيت إكليل الجبل", tags: ["تطويل", "تقوية الجذور", "تساقط", "عادي"] },
    { name: "زيت النعناع", tags: ["دهني", "تقوية الجذور", "رطب", "ذكر"] },
    { name: "زيت الخروع", tags: ["تساقط", "تكثيف", "جاف", "ذكر", "أنثى"] },
    { name: "زيت الحبة السوداء", tags: ["تطويل", "تساقط", "دهني", "ذكر"] },
    { name: "زيت بذور العنب", tags: ["معتدل", "عادي", "مهدئ", "أنثى"] },
    { name: "زيت النيم", tags: ["رطب", "فطريات", "قشرة"] },
    { name: "زيت شجر الشاي", tags: ["دهني", "قشرة", "فطريات"] },
    { name: "زيت الخزامى", tags: ["عادي", "مهدئ", "هرمونات", "أنثى"] },
    { name: "زيت الخروع الأسود", tags: ["تساقط", "تكثيف", "جاف"] },
    { name: "زيت اللوز الحلو", tags: ["ترطيب", "جاف", "أنثى"] },
    { name: "زيت الأفوكادو", tags: ["ترطيب", "جاف", "حساسية", "أنثى"] },
  ];

  const determineBlend = ({ gender, climate, scalp, hairFall, issues, goal }) => {
    const keywords = [];

    keywords.push(gender);
    keywords.push(climate);
    keywords.push(scalp);
    if (hairFall === 'نعم') keywords.push("تساقط");
    if (issues === 'قشرة') keywords.push("قشرة");
    if (issues === 'فطريات') keywords.push("فطريات");
    if (goal) keywords.push(goal);

    const scoredOils = oilsDB.map(oil => {
      const score = oil.tags.filter(tag => keywords.includes(tag)).length;
      return { ...oil, score };
    });

    const sorted = scoredOils.sort((a, b) => b.score - a.score);
    const selected = sorted.slice(0, 3).map(oil => oil.name);
    return selected.join(', ');
  };

  const getOptions = () => {
    switch (step) {
      case 1: return ['ذكر', 'أنثى'];
      case 2: return ['جاف', 'رطب', 'معتدل'];
      case 3: return ['دهني', 'جاف', 'عادي'];
      case 4: return ['نعم', 'لا'];
      case 5: return ['لا أعاني', 'قشرة', 'فطريات'];
      case 6: return ['ترطيب', 'تطويل', 'تكثيف', 'تقوية الجذور'];
      default: return [];
    }
  };

  const currentSelection = () => {
    switch (step) {
      case 1: return gender;
      case 2: return climate;
      case 3: return scalp;
      case 4: return hairFall;
      case 5: return issues;
      case 6: return goal;
      default: return '';
    }
  };

  const stepTitle = () => {
    switch (step) {
      case 1: return ' ما هو جنسك؟';
      case 2: return ' ما هو نوع المناخ لديك؟';
      case 3: return ' ما نوع فروة رأسك؟';
      case 4: return ' هل تعاني من تساقط الشعر؟';
      case 5: return ' هل تعاني من قشرة أو فطريات؟';
      case 6: return ' ما هو هدفك من استخدام الزيت؟';
      default: return '';
    }
  };

  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="quiz-container glassy">
      {/* Progress Bar */}
      <div className="progress-bar" style={{ width: '100%', height: '8px', backgroundColor: '#eee', marginBottom: '15px', borderRadius: '8px' }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#3baf69',
          borderRadius: '8px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      <h2 className="quiz-title">{stepTitle()}</h2>

      <div className="options-grid">
        {getOptions().map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        className="next-btn"
        onClick={handleNext}
        disabled={!currentSelection()}
      >
        {step < totalSteps ? 'التالي ➡️' : 'عرض النتيجة 🧪'}
      </button>
    </div>
  );
}

export default Quiz;
