import React, { useState, useEffect } from 'react';
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
  const [locationName, setLocationName] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

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

  /** Fetch Location and Weather **/
  useEffect(() => {
    const fetchLocationAndClimate = async () => {
      try {
        if (!navigator.geolocation) {
          console.error('المتصفح لا يدعم تحديد الموقع');
          setIsLoadingLocation(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;

          // Fetch city name in Arabic using BigDataCloud
          const locationResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
          );
          const locationData = await locationResponse.json();
          const city = locationData.city || locationData.locality || locationData.principalSubdivision || 'غير محدد';
          setLocationName(city);

          // Fetch weather from Open-Meteo
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherResponse.json();

          if (weatherData && weatherData.current_weather) {
            const temp = weatherData.current_weather.temperature;
            let detectedClimate = 'معتدل';
            if (temp < 10) detectedClimate = 'جاف';
            else if (temp > 25) detectedClimate = 'رطب';
            setClimate(detectedClimate);
          }
          setIsLoadingLocation(false);
        });
      } catch (error) {
        console.error('خطأ في جلب الموقع أو المناخ:', error);
        setIsLoadingLocation(false);
      }
    };

    fetchLocationAndClimate();
  }, []);

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

    if (hairFall === 'نعم') userConditions.push("تساقط");
    if (issues === 'قشرة') userConditions.push("قشرة");
    if (issues === 'فطريات') userConditions.push("فطريات");
    if (goal) userConditions.push(goal);
    if (scalp) userConditions.push(scalp);
    if (climate) userConditions.push(climate);
    if (gender === 'ذكر' && hairFall === 'نعم') {
      userConditions.push("DHT");
    }

    const scores = oilsDB.map(oil => {
      let score = 0;
      for (const condition of userConditions) {
        if (oil.weight[condition]) {
          score += oil.weight[condition];
        }
      }
      return { ...oil, score };
    });

    const sorted = scores.sort((a, b) => b.score - a.score);
    return sorted.slice(0, 3).map(oil => oil.name).join(', ');
  };

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

          {step === 2 && (
            <div className="location-info">
              {isLoadingLocation ? (
                <p>جارٍ تحديد موقعك والمناخ...</p>
              ) : (
                <p>المدينة: <strong>{locationName}</strong> | المناخ المقترح: <strong>{climate}</strong></p>
              )}
            </div>
          )}

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
        <div className="loading-overlay">جارٍ إنشاء التركيبة المثالية...</div>
      )}
    </div>
  );
}

export default Quiz;
