import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import '../Quiz.css';
import { useQuizLogic } from '../components/QuizLogic';

// Porosity Guide Component
const PorosityGuide = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="compact-porosity-guide">
      <button className="guide-toggle" onClick={() => setExpanded(!expanded)}>
        <span>اختبار المسامية</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="guide-steps">
          <div className="step"><span>1.</span> ضع كومة شعر في كوب ماء</div>
          <div className="step"><span>2.</span> انتظر 2-4 دقائق</div>
          <div className="step"><span>3.</span> لاحظ مكان الكومة</div>
          <div className="results">
            <div className="result"><span className="icon">🔼</span> تطفو = منخفضة</div>
            <div className="result"><span className="icon">⏸️</span> منتصف = متوسطة</div>
            <div className="result"><span className="icon">🔽</span> تغوص = عالية</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Quiz Component
function Quiz({ onQuizComplete }) {
  const {
    step,
    direction,
    loading,
    progress,
    gender,
    hairFall,
    scalp,
    issues,
    washFrequency,
    porosity,
    climate,
    goals,
    ageGroup,
    hairType,
    season,
    scentPreference,
    allergies,
    mode,
    isFetchingClimate,
    locationInfo,
    locationError,
    showManualOptions,
    retryCount,
    totalSteps,
    userConditions,
    handleOptionClick,
    currentSelection,
    detectClimate,
    handleNext,
    getOptions,
    stepTitle,
    motivationText,
    progressBar,
    setShowManualOptions,
    setClimate,
    setDirection,
    setStep
  } = useQuizLogic(onQuizComplete);

  return (
    <div className="quiz-container glassy">
      {!loading ? (
        <>
          <motion.div 
            className="progress-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="oil-tube">
              <motion.div 
                className="oil-fill" 
                style={{ width: `${progressBar}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressBar}%` }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                <div className="oil-wave"></div>
              </motion.div>
            </div>
            <motion.span 
              className="progress-text"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {progressBar}%
            </motion.span>
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <motion.h3 
                className="quiz-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {stepTitle()}
              </motion.h3>
              
              <motion.p 
                className="quiz-motivation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {motivationText()}
              </motion.p>

              {/* Step 1: Gender */}
              {step === 1 && (
                <motion.div 
                  className="options-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getOptions().map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(option)}
                      className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 2: Age Group */}
              {step === 2 && (
                <motion.div 
                className="options-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {getOptions().map((option, index) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOptionClick(option)}
                    className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                  >
                    {option}
                  </motion.button>
                ))}
              </motion.div>
            )}

              {/* Step 3: Hair Type */}
              {step === 3 && (
                <motion.div 
                  className="options-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getOptions().map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(option)}
                      className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 4: Hair Fall */}
              {step === 4 && (
                <motion.div 
                  className="options-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getOptions().map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(option)}
                      className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 5: Scalp Type */}
              {step === 5 && (
                <motion.div 
                  className="options-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getOptions().map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(option)}
                      className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 6: Scalp Issues */}
              {step === 6 && (
                <motion.div 
                  className="options-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getOptions().map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(option)}
                      className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 7: Wash Frequency */}
              {step === 7 && (
                <motion.div 
                  className="options-grid frequency-options"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {getOptions().map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleOptionClick(option)}
                      className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 8: Porosity */}
              {step === 8 && (
                <>
                  <motion.div 
                    className="options-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {getOptions().map((option, index) => (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOptionClick(option)}
                        className={`option-btn ${currentSelection() === option ? 'selected' : ''}`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </motion.div>
                  <PorosityGuide />
                </>
              )}

              {/* Step 9: Climate */}
              {step === 9 && (
                <motion.div
                className="climate-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {isFetchingClimate && !showManualOptions && (
                  <motion.div 
                    className="climate-detection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="climate-loader">
                      <motion.div 
                        className="climate-spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      >
                        
                      </motion.div>
                      <p>جاري تحديد موقعك والمناخ المحلي...</p>
                    </div>
                    <motion.div 
                      className="climate-tip"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FaLightbulb className="tip-icon" /> نستخدم بيانات الطقس لتكييف مزجتك مع مناخك.
                    </motion.div>
                  </motion.div>
                )}
                
                {!isFetchingClimate && locationInfo && climate && (
                  <motion.div 
                    className="climate-success fancy-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FaCheckCircle className="success-icon" />
                    <h4 className="climate-title">تم تحديد مناخك بدقة</h4>
                    <div className="climate-info">
                      <p>الموقع: <span>{locationInfo}</span></p>
                      <p>المناخ: <span className="highlight">{climate}</span></p>
                    </div>
                    <motion.button 
                      className="climate-change-btn"
                      whileHover={{ scale: 1.05, backgroundColor: '#eee' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setClimate('');
                        setShowManualOptions(true);
                      }}
                    >
                      تغيير النتيجة
                    </motion.button>
                  </motion.div>
                )}
                
                {locationError && (
                  <motion.div 
                    className="climate-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FaExclamationTriangle className="climate-icon error" />
                    <p>تعذر تحديد موقعك تلقائيًا</p>
                    <p className="error-reason">
                      يرجى التأكد من تفعيل خدمات الموقع أو اختيار المناخ يدويًا
                    </p>
                    <motion.button
                      className="retry-btn"
                      onClick={detectClimate}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isFetchingClimate}
                    >
                      {isFetchingClimate ? (
                        <>
                          <FaSyncAlt className="retry-spinner" /> جاري المحاولة مرة أخرى...
                        </>
                      ) : (
                        <>
                          <FaSyncAlt className="retry-icon" /> إعادة المحاولة
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
                
                {(showManualOptions || locationError) && (
                  <motion.div
                    className="climate-manual"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="climate-divider"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span>أو اختر يدويًا</span>
                    </motion.div>
                    <div className="options-grid">
                      {getOptions().map((option, index) => (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
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
                )}
              </motion.div>
                  )}
                

              
              {/* Step 10: Goals (Multiple Selection) */}
{step === 10 && (
  <motion.div 
    className="options-grid"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
    {getOptions().map((option, index) => (
      <motion.div
        key={option}
        className={`option-btn ${goals.includes(option) ? 'selected' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
        }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOptionClick(option)}
      >
        <div className="option-content">
          <h4>{option}</h4>
          <p className="option-description">
            {option === 'ترطيب' && 'ترطيب عميق للشعر الجاف والمتضرر'}
            {option === 'إطالة' && 'تحفيز نمو الشعر وتمديده'}
            {option === 'تكثيف' && 'زيادة كثافة الشعر'}
            {option === 'تقوية' && 'تقوية جذور الشعر وإيقاف التساقط'}
          </p>
        </div>
        <div className="multi-select-indicator">
          {goals.includes(option) ? (
            <div className="checkmark">✓</div>
          ) : (
            <div className="empty-circle"></div>
          )}
        </div>
      </motion.div>
    ))}

      
    
  </motion.div>
)}

            </motion.div>
          </AnimatePresence>

          <motion.div 
            className="quiz-navigation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              className="quiz-btn"
              whileHover={{ scale: step > 1 ? 1.05 : 1 }}
              whileTap={{ scale: step > 1 ? 0.95 : 1 }}
              onClick={() => {
                if (step > 1) {
                  setDirection(-1);
                  setStep((prev) => prev - 1);
                }
              }}
              disabled={step === 1}
            >
              ← رجوع
            </motion.button>
            <motion.button
              className="quiz-btn"
              whileHover={{ scale: currentSelection() ? 1.05 : 1 }}
              whileTap={{ scale: currentSelection() ? 0.95 : 1 }}
              onClick={handleNext}
              disabled={!currentSelection()}
            >
              {step < totalSteps ? 'التالي →' : 'النتيجة'}
            </motion.button>
          </motion.div>
        </>
      ) : (
        <div className="loading-overlay">
          <div className="circle-loader enhanced-loader">
            <div className="soft-glow"></div>
            <div className="soft-glow second"></div>
            <div className="loader-background"></div>

            <svg className="progress-ring" width="180" height="180" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3edc81" />
                  <stop offset="100%" stopColor="#0f803f" />
                </linearGradient>
              </defs>
              <circle
                className="progress-ring__background"
                cx="90" cy="90" r="80"
                stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none"
              />
              <motion.circle
                className="progress-ring__progress"
                cx="90" cy="90" r="80"
                stroke="url(#loadingGradient)" strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray="502"
                strokeDashoffset={502 - (progress / 100) * 502}
                style={{ filter: 'drop-shadow(0px 0px 12px #3edc81)' }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              />
            </svg>

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
                    ? 'صلّ على رسول الله'
                    : progress < 66
                    ? 'الحمد لله'
                    : 'الخلطة واجدة'}
                </motion.p>
              </AnimatePresence>
            </div>
            <a
              href="https://www.instagram.com/xtra.takata"
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