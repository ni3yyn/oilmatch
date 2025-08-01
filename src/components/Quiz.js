import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../Quiz.css';

function Quiz({ onQuizComplete }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Answers
  const [gender, setGender] = useState('');
  const [climate, setClimate] = useState('');
  const [scalp, setScalp] = useState('');
  const [hairFall, setHairFall] = useState('');
  const [issues, setIssues] = useState('');
  const [goal, setGoal] = useState('');

  const totalSteps = 6;

  /** Enhanced Oil Database with Weighted Attributes **/
  const oilsDB = [
    { name: "زيت الجوجوبا", tags: ["ترطيب", "دهني"], weight: { "دهني": 4, "ترطيب": 2 } },
    { name: "زيت بذور اليقطين", tags: ["تكثيف", "تساقط", "DHT"], weight: { "تساقط": 5, "DHT": 5 } },
    { name: "زيت الأرغان", tags: ["ترطيب", "جاف"], weight: { "جاف": 5, "ترطيب": 4 } },
    { name: "زيت إكليل الجبل", tags: ["تطويل", "تقوية", "تساقط", "DHT"], weight: { "تساقط": 4, "DHT": 4, "تقوية": 3 } },
    { name: "زيت النعناع", tags: ["دهني", "انتعاش", "DHT"], weight: { "دهني": 3, "DHT": 2 } },
    { name: "زيت الخروع", tags: ["تساقط", "تكثيف"], weight: { "تساقط": 4, "تكثيف": 4 } },
    { name: "زيت الحبة السوداء", tags: ["تطويل", "تساقط"], weight: { "تساقط": 3, "تطويل": 3 } },
    { name: "زيت بذور العنب", tags: ["معتدل"], weight: { "دهني": 1, "جاف": 1 } },
    { name: "زيت النيم", tags: ["فطريات", "قشرة"], weight: { "فطريات": 5, "قشرة": 4 } },
    { name: "زيت شجر الشاي", tags: ["قشرة", "فطريات"], weight: { "قشرة": 5, "فطريات": 4 } },
    { name: "زيت الخزامى", tags: ["مهدئ"], weight: {} },
    { name: "زيت الخروع الأسود", tags: ["تكثيف"], weight: { "تساقط": 4, "تكثيف": 4 } },
    { name: "زيت اللوز الحلو", tags: ["ترطيب", "جاف"], weight: { "جاف": 3, "ترطيب": 2 } },
    { name: "زيت الأفوكادو", tags: ["ترطيب", "جاف"], weight: { "جاف": 4, "ترطيب": 3 } },
  ];

  /** Handle Answer Selection **/
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

  /** Move to Next Step or Process Results **/
  const handleNext = () => {
    if (step < totalSteps) {
      setDirection(1);
      setStep((prev) => prev + 1);
    } else {
      setLoading(true);
      setProgress(0);
  let counter = 0;
  const interval = setInterval(() => {
    counter += 2; // 2% every 100ms -> ~5 seconds
    if (counter <= 100) {
      setProgress(counter);
    } else {
      clearInterval(interval);
      const blend = determineBlend({ gender, climate, scalp, hairFall, issues, goal });
      onQuizComplete({ gender, climate, scalp, hairFall, issues, goal, blend });
    }
  }, 100);
  
    }
  };

  /** Improved Scoring System **/
  const determineBlend = ({ gender, climate, scalp, hairFall, issues, goal }) => {
    let userConditions = [];

    // Main conditions
    if (hairFall === 'نعم') userConditions.push("تساقط");
    if (issues === 'قشرة') userConditions.push("قشرة");
    if (issues === 'فطريات') userConditions.push("فطريات");
    if (goal) userConditions.push(goal);
    if (scalp) userConditions.push(scalp);
    if (climate) userConditions.push(climate);

    // Gender + Hair Fall → Add DHT factor
    if (gender === 'ذكر' && hairFall === 'نعم') {
      userConditions.push("DHT");
    }

    /** Calculate Weighted Score for Each Oil **/
    const scores = oilsDB.map(oil => {
      let score = 0;
      for (const condition of userConditions) {
        if (oil.weight[condition]) {
          score += oil.weight[condition];
        }
      }
      return { ...oil, score };
    });

    // Sort oils by score and filter top matches
    const sorted = scores.sort((a, b) => b.score - a.score);
    return sorted.slice(0, 3).map(oil => oil.name).join(', ');
  };

  /** Options per Step **/
  const getOptions = () => {
    switch (step) {
      case 1: return ['ذكر', 'أنثى'];
      case 2: return ['جاف', 'رطب', 'معتدل'];
      case 3: return ['دهني', 'جاف', 'عادي'];
      case 4: return ['نعم', 'لا'];
      case 5: return ['كلا', 'قشرة', 'فطريات'];
      case 6: return ['ترطيب', 'تطويل', 'تكثيف', 'تقوية'];
      default: return [];
    }
  };

  /** Current Selection **/
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

  /** Titles & Motivations **/
  const stepTitle = () => {
    const titles = [
      'ما هو جنسك؟',
      'كيف تصف المناخ في منطقتك؟',
      'ما نوع فروة رأسك؟',
      'هل تعاني من تساقط الشعر؟',
      'هل لديك قشرة أو فطريات؟',
      'ما هو هدفك من الزيت؟'
    ];
    return titles[step - 1];
  };

  const motivationText = () => {
    const texts = [
      'اختيار الزيت يبدأ بفهم طبيعتك الأساسية.',
      'المناخ يؤثر على رطوبة شعرك.',
      'نوع فروة الرأس يحدد مكونات الترطيب أو التنظيف.',
      'تساقط الشعر يحتاج مكونات فعالة للتقوية.',
      'علاج المشاكل مثل القشرة مهم قبل التغذية.',
      'هدفك هو سر الوصفة المثالية لشعرك.'
    ];
    return texts[step - 1];
  };

  const progressBar = Math.round((step / totalSteps) * 100);

  return (
    <div className="quiz-container glassy">
      {!loading ? (
        <>
          <div className="progress-container">
            <div className="oil-tube">
              <div className="oil-fill" style={{ width: `${progressBar}%` }}>
                <div className="oil-wave"></div>
              </div>
            </div>
            <span className="progress-text">{progressBar}%</span>
          </div>

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
      ) : (
        <div className="loading-overlay">
  <div className="circle-loader enhanced-loader">
    {/* Animated radial glow layers */}
    <div className="soft-glow"></div>
    <div className="soft-glow second"></div>

    {/* Pulsating ripple background */}
    <div className="loader-background"></div>

    {/* SVG Circle */}
    <svg className="progress-ring" width="180" height="180" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3edc81" />
          <stop offset="100%" stopColor="#0f803f" />
        </linearGradient>
      </defs>
      <circle
        className="progress-ring__background"
        cx="90"
        cy="90"
        r="80"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
        fill="none"
      />
      <motion.circle
        className="progress-ring__progress"
        cx="90"
        cy="90"
        r="80"
        stroke="url(#loadingGradient)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="502"
        strokeDashoffset={502 - (progress / 100) * 502}
        style={{ filter: 'drop-shadow(0px 0px 12px #3edc81)' }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />
    </svg>

    {/* Progress and AI Messages */}
    <div className="progress-text-center">{progress}%</div>
    <div className="ai-messages">
      <AnimatePresence mode="wait">
        <motion.p
          key={Math.floor(progress / 33)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {progress < 33
            ? "تحليل فروة الرأس والمناخ..."
            : progress < 66
            ? "اختيار أفضل الزيوت لمشكلتك..."
            : "إنشاء التركيبة المثالية لشعرك..."}
        </motion.p>
      </AnimatePresence>
    </div>
    <a
  href="https://www.instagram.com/ni3yyn"
  target="_blank"
  rel="noopener noreferrer"
  className="instagram-btn"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="white"
    viewBox="0 0 24 24"
    style={{ marginRight: '8px' }}
  >
    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 2 .2 2.5.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.5.3 1.3.4 2.5.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 2-.4 2.5-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.5.2-1.3.3-2.5.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-2-.2-2.5-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.5-.3-1.3-.4-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-2 .4-2.5.2-.6.5-1 1-1.5s.9-.8 1.5-1c.5-.2 1.3-.3 2.5-.4C8.4 2.2 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3 0 7 .1 5.7.2 4.7.4 3.9.8c-.9.3-1.6.8-2.4 1.6C.7 3.2.3 3.9 0 4.8c-.4.8-.6 1.8-.7 3-.1 1.3-.1 1.7-.1 5s0 3.7.1 5c.1 1.2.3 2.2.7 3 .3.9.8 1.6 1.6 2.4.8.8 1.5 1.3 2.4 1.6.8.4 1.8.6 3 .7 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.2-.1 2.2-.3 3-.7.9-.3 1.6-.8 2.4-1.6.8-.8 1.3-1.5 1.6-2.4.4-.8.6-1.8.7-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.2-.3-2.2-.7-3-.3-.9-.8-1.6-1.6-2.4-.8-.8-1.5-1.3-2.4-1.6-.8-.4-1.8-.6-3-.7C15.7 0 15.3 0 12 0z"/>
    <path d="M12 5.8A6.2 6.2 0 1 0 18.2 12 6.21 6.21 0 0 0 12 5.8zm0 10.2A4 4 0 1 1 16 12a4 4 0 0 1-4 4z"/>
    <circle cx="18.4" cy="5.6" r="1.44"/>
  </svg>
  تابعنا على إنستغرام
</a>


  </div>
</div>

      )}
    </div>
  );
}

export default Quiz;
