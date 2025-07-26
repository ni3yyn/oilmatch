import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../Quiz.css';

function Quiz({ onQuizComplete }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [gender, setGender] = useState('');
  const [climate, setClimate] = useState('');
  const [scalp, setScalp] = useState('');
  const [hairFall, setHairFall] = useState('');
  const [issues, setIssues] = useState('');
  const [goal, setGoal] = useState('');

  const totalSteps = 6;

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
      setDirection(1);
      setStep((prev) => prev + 1);
    } else {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              const blend = determineBlend({ gender, climate, scalp, hairFall, issues, goal });
              onQuizComplete({ gender, climate, scalp, hairFall, issues, goal, blend });
            }, 500);
          }
          return Math.min(prev + 4, 100);
        });
      }, 150);
    }
  };

  const determineBlend = ({ gender, climate, scalp, hairFall, issues, goal }) => {
    const keywords = [gender, climate, scalp];
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
      case 5: return ['كلا', 'قشرة', 'فطريات'];
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
      case 1: return 'ما هو جنسك؟';
      case 2: return 'كيف تصف المناخ في منطقتك؟';
      case 3: return 'ما نوع فروة رأسك؟';
      case 4: return 'هل تعاني من تساقط الشعر؟';
      case 5: return 'هل لديك قشرة أو فطريات؟';
      case 6: return 'ما هو هدفك من الزيت؟';
      default: return '';
    }
  };

  const motivationText = () => {
    switch (step) {
      case 1: return 'اختيار الزيت يبدأ بفهم طبيعتك الأساسية.';
      case 2: return 'المناخ يؤثر على رطوبة شعرك.';
      case 3: return 'نوع فروة الرأس يحدد مكونات الترطيب أو التنظيف.';
      case 4: return 'تساقط الشعر يحتاج مكونات فعالة للتقوية.';
      case 5: return 'علاج المشاكل مثل القشرة مهم قبل التغذية.';
      case 6: return 'هدفك هو سر الوصفة المثالية لشعرك.';
      default: return '';
    }
  };

  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="quiz-container glassy">
      {isAnalyzing ? (
        <div className="analysis-screen">
          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            🤖 جارٍ تحليل إجاباتك...
          </motion.h2>

          {/* AI Brain Animation */}
          <motion.div
            className="ai-brain"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="ai-dot"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </motion.div>

          {/* Analysis Progress */}
          <div className="analysis-bar-container">
            <motion.div
              className="analysis-wave"
              animate={{ x: [0, 50, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="analysis-bar">
              <motion.div
                className="analysis-progress"
                style={{ width: `${analysisProgress}%` }}
                animate={{
                  background: [
                    'linear-gradient(90deg, #06b6d4, #3b82f6)',
                    'linear-gradient(90deg, #10b981, #6ee7b7)',
                    'linear-gradient(90deg, #8b5cf6, #6366f1)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </div>

          <motion.p className="analysis-text">{analysisProgress}%</motion.p>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="oil-tube">
              <div className="oil-fill" style={{ width: `${progress}%` }}>
                <div className="oil-wave"></div>
              </div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>

          {/* Question & Options */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="quiz-title">{stepTitle()}</h3>
              <p className="quiz-motivation">{motivationText()}</p>
              <div className="options-grid">
                {getOptions().map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOptionClick(option)}
                    className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="quiz-navigation">
            <button
              className="quiz-btn"
              onClick={() => {
                if (step > 1) {
                  setDirection(-1);
                  setStep((prev) => prev - 1);
                }
              }}
              disabled={step === 1}
            >
              ← رجوع
            </button>

            <button
              className="quiz-btn"
              onClick={handleNext}
              disabled={!currentSelection()}
            >
              {step < totalSteps ? 'التالي →' : 'النتيجة'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Quiz;
