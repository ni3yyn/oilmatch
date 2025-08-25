// File: Review.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import '../Review.css';

const Review = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Review state - تم التبسيط
  const [ratings, setRatings] = useState({
    effectiveness: 0,
    treatment: 0
  });
  
  const [feedback, setFeedback] = useState({
    hairFeel: '',
    improvements: '',
    wouldRepurchase: null
  });

  const [activeRating, setActiveRating] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Try to get order data from orders collection
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          
          // Try to get result data from resultdata collection
          const resultDoc = await getDoc(doc(db, 'resultdata', orderId));
          
          if (resultDoc.exists()) {
            const resultData = resultDoc.data();
            
            // Combine data from both collections
            setOrderData({
              id: orderId,
              // Order information
              ...orderData,
              // Quiz/result information
              result: resultData.result,
              userData: resultData.userData
            });
          } else {
            // Only order data exists
            setOrderData({ id: orderId, ...orderData });
          }
        } else {
          // Try to get result data as fallback
          const resultDoc = await getDoc(doc(db, 'resultdata', orderId));
          if (resultDoc.exists()) {
            setOrderData({ id: resultDoc.id, ...resultDoc.data() });
          } else {
            setOrderData(null);
          }
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const submitReview = async () => {
    // Check if both ratings are selected
    if (ratings.effectiveness === 0 || ratings.treatment === 0) {
      alert('يرجى تقييم جميع النقاط قبل الإرسال');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare review data
      const reviewData = {
        orderId,
        ratings,
        feedback,
        timestamp: serverTimestamp(),
        // Include blend information for ML training
        blend: orderData?.result?.blend || orderData?.blend,
        userData: orderData?.userData,
        // Calculate overall satisfaction score for ML
        satisfactionScore: calculateSatisfactionScore(ratings, feedback),
        reviewed: true
      };

      // Save to Firebase in a dedicated reviews collection
      await setDoc(doc(db, 'reviews', orderId), reviewData);
      
      // Also update the resultdata collection with review information
      const resultDataUpdate = {
        review: reviewData,
        reviewed: true,
        reviewTimestamp: serverTimestamp()
      };
      await updateDoc(doc(db, 'resultdata', orderId), resultDataUpdate);
      
      // Also update the orders collection with review status
      const orderUpdate = {
        reviewed: true,
        reviewTimestamp: serverTimestamp()
      };
      await updateDoc(doc(db, 'orders', orderId), orderUpdate);
      
      setSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleFeedbackChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateSatisfactionScore = (ratings, feedback) => {
    // Simple average of the two ratings
    let score = (ratings.effectiveness + ratings.treatment) / 2;
    
    // Adjust based on text feedback sentiment (simplified)
    const positiveWords = ['جيد', 'ممتاز', 'رائع', 'راضي', 'نصح', 'يعجب', 'ممتازة', 'جميل'];
    const negativeWords = ['سيء', 'غير', 'لم يعجب', 'مشكلة', 'ضعيف', 'سيئة'];
    
    const combinedFeedback = `${feedback.hairFeel} ${feedback.improvements}`.toLowerCase();
    
    let sentimentAdjustment = 0;
    positiveWords.forEach(word => {
      if (combinedFeedback.includes(word)) sentimentAdjustment += 0.1;
    });
    
    negativeWords.forEach(word => {
      if (combinedFeedback.includes(word)) sentimentAdjustment -= 0.1;
    });
    
    return Math.min(5, Math.max(1, score + sentimentAdjustment));
  };

  if (loading) {
    return (
      <div className="review-container premium-green">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="loading-container"
        >
          <div className="loading-spinner"></div>
          <p>جاري تحميل بيانات الطلب...</p>
        </motion.div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="review-container premium-green">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-message glass-card"
        >
          <div className="error-icon">⚠️</div>
          <h2>لم يتم العثور على الطلب</h2>
          <p>رقم الطلب {orderId} غير موجود في نظامنا.</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="premium-button"
          >
            العودة إلى الصفحة الرئيسية
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="review-container premium-green">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="thank-you-container"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="success-icon"
          >
            <div className="success-animation">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            شكراً لك على تقييمك!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            ملاحظاتك تساعدنا على تحسين توصياتنا وتحسين تجربة العملاء.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="premium-button"
          >
            العودة إلى الصفحة الرئيسية
          </motion.button>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="thank-you-footer"
          >
            <p>شاركنا تجربتك على وسائل التواصل الاجتماعي</p>
            <div className="social-share">
              <button className="social-btn twitter">
                <i className="icon-twitter"></i>
              </button>
              <button className="social-btn instagram">
                <i className="icon-instagram"></i>
              </button>
              <button className="social-btn whatsapp">
                <i className="icon-whatsapp"></i>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Parse blend information
  const blend = typeof orderData.blend === 'string' ? 
    JSON.parse(orderData.blend) : orderData.blend || [];
  const resultBlend = orderData.result?.blend ? 
    (typeof orderData.result.blend === 'string' ? 
      JSON.parse(orderData.result.blend) : orderData.result.blend) : [];

  const displayBlend = blend.length > 0 ? blend : resultBlend;

  return (
    <div className="review-container premium-green">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="review-content"
      >
        {/* Floating background elements */}
        
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        

        <div className="review-header glass-card">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <i className="icon-star"></i>
            تقييم خلطة الزيوت
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            طلب رقم: <strong>{orderId}</strong>
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="blend-summary glass-card"
        >
          <h2>
            <i className="icon-oil"></i>
            خلطتك الخاصة
          </h2>
          <div className="blend-composition">
            {displayBlend.map((oil, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="oil-item"
              >
                <span className="oil-name">
                  <i className="icon-drop"></i>
                  {oil.name}
                </span>
                <span className="oil-percentage">{oil.percentage}%</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="review-form glass-card"
        >
          <h2>
            <i className="icon-review"></i>
            كيف كانت تجربتك مع الخلطة؟
          </h2>
          
          <div className="rating-section">
            <h3>قيم الخلطة من 1 إلى 5 نجوم</h3>
            
            <div 
              className="rating-category"
              onMouseEnter={() => setActiveRating('effectiveness')}
              onMouseLeave={() => setActiveRating(null)}
            >
              <label>
                <i className="icon-effective"></i>
                الفعالية والنتائج
              </label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.span
                    key={star}
                    className={`star ${star <= ratings.effectiveness ? 'selected' : ''} 
                               ${activeRating === 'effectiveness' && star <= ratings.effectiveness ? 'active' : ''}`}
                    onClick={() => handleRatingChange('effectiveness', star)}
                    whileHover={{ scale: 1.3, rotate: star === ratings.effectiveness ? 10 : 0 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                      scale: activeRating === 'effectiveness' && star <= ratings.effectiveness ? 1.2 : 1
                    }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <div className="rating-labels">
                <span>غير فعالة</span>
                <span>ممتازة</span>
              </div>
            </div>
            
            <div 
              className="rating-category"
              onMouseEnter={() => setActiveRating('treatment')}
              onMouseLeave={() => setActiveRating(null)}
            >
              <label>
                <i className="icon-service"></i>
                جودة المعاملة وخدمة التوصيل
              </label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.span
                    key={star}
                    className={`star ${star <= ratings.treatment ? 'selected' : ''}
                               ${activeRating === 'treatment' && star <= ratings.treatment ? 'active' : ''}`}
                    onClick={() => handleRatingChange('treatment', star)}
                    whileHover={{ scale: 1.3, rotate: star === ratings.treatment ? 10 : 0 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ 
                      scale: activeRating === 'treatment' && star <= ratings.treatment ? 1.2 : 1
                    }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <div className="rating-labels">
                <span>سيئة</span>
                <span>ممتازة</span>
              </div>
            </div>
          </div>
          
          <div className="feedback-section">
            <h3>
              <i className="icon-feedback"></i>
              ملاحظات إضافية
            </h3>
            
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label>كيف أصبح شعرك يشعر بعد استخدام الخلطة؟</label>
              <textarea 
                value={feedback.hairFeel}
                onChange={(e) => handleFeedbackChange('hairFeel', e.target.value)}
                placeholder="صفي لنا كيف أصبح ملمس شعرك، رطوبته، ومظهره العام..."
                rows="3"
              />
            </motion.div>
            
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label>ماذا يمكننا تحسين في الخلطة؟</label>
              <textarea 
                value={feedback.improvements}
                onChange={(e) => handleFeedbackChange('improvements', e.target.value)}
                placeholder="أخبرنا بما يمكننا فعله لجعل الخلطة أفضل لشعرك..."
                rows="3"
              />
            </motion.div>
            
            <motion.div 
              className="form-group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label>هل ستعيد شراء هذه الخلطة؟</label>
              <div className="purchase-options">
                <motion.button 
                  className={`option-btn ${feedback.wouldRepurchase === true ? 'selected' : ''}`}
                  onClick={() => handleFeedbackChange('wouldRepurchase', true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="icon-yes"></i>
                  نعم
                </motion.button>
                <motion.button 
                  className={`option-btn ${feedback.wouldRepurchase === false ? 'selected' : ''}`}
                  onClick={() => handleFeedbackChange('wouldRepurchase', false)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="icon-no"></i>
                  لا
                </motion.button>
              </div>
            </motion.div>
          </div>
          
          <motion.button 
            className="submit-review-btn premium-button"
            onClick={submitReview}
            disabled={submitting || ratings.effectiveness === 0 || ratings.treatment === 0}
            whileHover={{ 
              scale: submitting ? 1 : 1.05, 
              y: submitting ? 0 : -2,
              boxShadow: submitting ? '0 4px 14px rgba(0, 0, 0, 0.1)' : '0 8px 20px rgba(46, 204, 113, 0.4)'
            }}
            whileTap={{ scale: submitting ? 1 : 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <i className="icon-send"></i>
                إرسال التقييم
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Review;