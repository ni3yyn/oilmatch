// File: Review.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
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
    effectiveness: 3,
    treatment: 3
  });
  
  const [feedback, setFeedback] = useState({
    hairFeel: '',
    improvements: '',
    wouldRepurchase: null
  });

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Try to get order data
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          setOrderData({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          // Try to get result data as fallback
          const resultDoc = await getDoc(doc(db, 'resultdata', orderId));
          if (resultDoc.exists()) {
            setOrderData({ id: resultDoc.id, ...resultDoc.data() });
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

  const submitReview = async () => {
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
        satisfactionScore: calculateSatisfactionScore(ratings, feedback)
      };

      // Save to Firebase in a dedicated reviews collection
      await setDoc(doc(db, 'reviews', orderId), reviewData);
      
      // Also add a reference to the order document
      if (orderData) {
        await setDoc(doc(db, 'orders', orderId), {
          ...orderData,
          reviewed: true,
          review: reviewData
        }, { merge: true });
      }
      
      setSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('حدث خطأ أثناء إرسال التقييم. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSatisfactionScore = (ratings, feedback) => {
    // Weighted average of ratings
    const weights = {
      effectiveness: 0.6,
      treatment: 0.4
    };
    
    let score = 0;
    for (const [category, value] of Object.entries(ratings)) {
      score += value * weights[category];
    }
    
    // Adjust based on text feedback sentiment (simplified)
    const positiveWords = ['جيد', 'ممتاز', 'رائع', 'راضي', 'نصح', 'يعجب', 'شكرا', 'ممتازة'];
    const negativeWords = ['سيء', 'غير', 'لم يعجب', 'مشكلة', 'ضعيف', 'بطيء', 'مخيب'];
    
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
      <div className="review-container">
        <div className="loading">جاري تحميل بيانات الطلب...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="review-container">
        <div className="error-message">
          <h2>لم يتم العثور على الطلب</h2>
          <p>رقم الطلب {orderId} غير موجود في نظامنا.</p>
          <button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="review-container">
        <div className="thank-you-message">
          <h2>شكراً لك على تقييمك!</h2>
          <p>ملاحظاتك تساعدنا على تحسين توصياتنا وتحسين تجربة العملاء.</p>
          <button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</button>
        </div>
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
    <motion.div 
      className="review-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="review-header">
        <h1>تقييم خلطة الزيوت</h1>
        <p>طلب رقم: <strong>{orderId}</strong></p>
      </div>

      <div className="blend-summary">
        <h2>خلطتك الخاصة</h2>
        <div className="blend-composition">
          {displayBlend.map((oil, index) => (
            <div key={index} className="oil-item">
              <span className="oil-name">{oil.name}</span>
              <span className="oil-percentage">{oil.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="review-form">
        <h2>كيف كانت تجربتك مع الخلطة؟</h2>
        
        <div className="rating-section">
          <h3>قيم الخلطة من 1 إلى 5 نجوم</h3>
          
          <div className="rating-category">
            <label>الفعالية والنتائج</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= ratings.effectiveness ? 'selected' : ''}`}
                  onClick={() => handleRatingChange('effectiveness', star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="rating-category">
            <label>جودة المعاملة وخدمة التوصيل</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= ratings.treatment ? 'selected' : ''}`}
                  onClick={() => handleRatingChange('treatment', star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="feedback-section">
          <h3>ملاحظات إضافية</h3>
          
          <div className="form-group">
            <label>كيف أصبح شعرك يشعر بعد استخدام الخلطة؟</label>
            <textarea 
              value={feedback.hairFeel}
              onChange={(e) => handleFeedbackChange('hairFeel', e.target.value)}
              placeholder="صفي لنا كيف أصبح ملمس شعرك، رطوبته، ومظهره العام..."
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>ماذا يمكننا تحسين في الخلطة أو الخدمة؟</label>
            <textarea 
              value={feedback.improvements}
              onChange={(e) => handleFeedbackChange('improvements', e.target.value)}
              placeholder="أخبرنا بما يمكننا فعله لجعل الخلطة والخدمة أفضل..."
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>هل ستعيد شراء هذه الخلطة؟</label>
            <div className="purchase-options">
              <button 
                className={`option-btn ${feedback.wouldRepurchase === true ? 'selected' : ''}`}
                onClick={() => handleFeedbackChange('wouldRepurchase', true)}
              >
                نعم
              </button>
              <button 
                className={`option-btn ${feedback.wouldRepurchase === false ? 'selected' : ''}`}
                onClick={() => handleFeedbackChange('wouldRepurchase', false)}
              >
                لا
              </button>
            </div>
          </div>
        </div>
        
        <motion.button 
          className="submit-review-btn"
          onClick={submitReview}
          disabled={submitting}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {submitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Review;