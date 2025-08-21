import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSpinner, FaLightbulb, FaCheckCircle, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import '../Quiz.css';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


function Quiz({ onQuizComplete }) {
  // ======= STATE (kept from your file, with a few additions) =======
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Answers
  const [gender, setGender] = useState('');
  const [hairFall, setHairFall] = useState('');
  const [scalp, setScalp] = useState('');
  const [issues, setIssues] = useState('');
  const [washFrequency, setWashFrequency] = useState('');
  const [porosity, setPorosity] = useState('');
  const [climate, setClimate] = useState(''); 
  const [goals, setGoals] = useState([]); // Changed from goal to goals
  const [ageGroup, setAgeGroup] = useState(''); // الفئة العمرية
  const [hairType, setHairType] = useState(''); // نوع الشعر

  // Extended inputs (optional toggles shown at the end)
  const [season, setSeason] = useState(''); // الشتاء/الصيف/الربيع/الخريف
  const [scentPreference, setScentPreference] = useState(''); // خفيف/عشبي/زهري/محايد
  const [allergies, setAllergies] = useState([]); // ["لوز", "جوز"...]
  const [mode, setMode] = useState('balanced'); // balanced | therapeutic | cosmetic

  // Weather state
  const [isFetchingClimate, setIsFetchingClimate] = useState(false);
  const [locationInfo, setLocationInfo] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [showManualOptions, setShowManualOptions] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Add this line

  const totalSteps = 10;

  // ======= EXPERT DATA MODEL (richer than before; inline & editable) =======
  /**
   * Each oil record:
   * - tags/weights: base relevance per condition/goal
   * - penalties: negative scores when mismatched
   * - props: viscosity, absorption, heaviness, scent
   * - climateSuitability/seasonalSuitability
   * - synergy: multiplicative bonuses with other oils
   * - contraindications: exclude if present in user conditions/allergies
   */
  const oilsDB = useMemo(() => ([
    {
      name: 'زيت الجوجوبا',
      type: 'carrier',
      viscosity: 'خفيف',
      absorption: 'سريع',
      heaviness: 'خفيف',
      scent: 'محايد',
      maxPercentage: 100,
      idealRange: [20, 100],
      climateSuitability: ['رطب', 'معتدل'],
      seasonalSuitability: ['الصيف', 'الربيع'],
      weights: { 
        'ترطيب': 2, 'دهني': 4, 'خفيف': 3, 'غسيل متكرر': 3, 'تقوية': 1,
        'أقل من 18 سنة': 4, '18-35 سنة': 3, '36-50 سنة': 2, 'أكثر من 50 سنة': 1,
        'ناعم': 5, 'مجعد': 2, 'خشن': 1, 'ملون/مصفف': 3
      },
      penalties: { 'جاف شديد': 0.5, 'شعر_خشن': 0.7 },
      synergy: { 'زيت الأرغان': 1.05, 'زيت إكليل الجبل': 1.05 },
      contraindications: []
    },
    {
      name: 'زيت بذور اليقطين',
      type: 'carrier',
      viscosity: 'متوسط',
      absorption: 'متوسط',
      heaviness: 'متوسط',
      scent: 'محايد',
      maxPercentage: 100,
      idealRange: [10, 40],
      climateSuitability: ['معتدل'],
      seasonalSuitability: ['الخريف', 'الشتاء'],
      weights: { 
        'تكثيف': 4, 'تساقط': 5, 'DHT': 5, 'متوسط': 3,
        '18-35 سنة': 4, '36-50 سنة': 5, 'أكثر من 50 سنة': 3,
        'ناعم': 2, 'مجعد': 4, 'خشن': 5, 'ملون/مصفف': 3
      },
      penalties: { 'دهني': 0.5, 'أقل من 18 سنة': 0.3 },
      synergy: { 'زيت الخروع': 1.08, 'زيت إكليل الجبل': 1.05 },
      contraindications: []
    },
    {
      name: 'زيت الأرغان',
      type: 'carrier',
      viscosity: 'متوسط',
      absorption: 'متوسط',
      heaviness: 'متوسط',
      scent: 'فاخر',
      maxPercentage: 100,
      idealRange: [15, 50],
      climateSuitability: ['جاف', 'معتدل'],
      seasonalSuitability: ['الشتاء', 'الخريف'],
      weights: { 
        'ترطيب': 4, 'جاف': 5, 'متوسط': 3, 'غسيل نادر': 4, 'تقوية': 2,
        '36-50 سنة': 4, 'أكثر من 50 سنة': 5,
        'ناعم': 3, 'مجعد': 5, 'خشن': 4, 'ملون/مصفف': 5
      },
      penalties: { 'دهني': 1, 'أقل من 18 سنة': 0.5 },
      synergy: { 'زيت الجوجوبا': 1.05, 'زيت اللوز الحلو': 1.03 },
      contraindications: []
    },
    {
      name: 'زيت إكليل الجبل',
      type: 'essential',
      viscosity: 'خفيف',
      absorption: 'سريع',
      heaviness: 'خفيف',
      scent: 'عشبي',
      maxPercentage: 5,
      idealRange: [1, 3],
      climateSuitability: ['معتدل', 'جاف'],
      seasonalSuitability: ['الربيع', 'الخريف'],
      weights: { 
        'إطالة': 3, 'تقوية': 3, 'تساقط': 4, 'DHT': 4, 'خفيف': 2,
        '18-35 سنة': 4, '36-50 سنة': 3,
        'ناعم': 3, 'مجعد': 2, 'خشن': 4, 'ملون/مصفف': 2
      },
      penalties: { 'حساسية روائح': 0.5, 'أكثر من 50 سنة': 0.3 },
      synergy: { 'زيت النعناع': 1.06, 'زيت الجوجوبا': 1.04 },
      contraindications: ['حمل']
    },
    {
      name: 'زيت النعناع',
      type: 'essential',
      viscosity: 'خفيف',
      absorption: 'سريع',
      heaviness: 'خفيف',
      scent: 'منعش',
      maxPercentage: 3,
      idealRange: [0.5, 2],
      climateSuitability: ['رطب', 'معتدل'],
      seasonalSuitability: ['الصيف'],
      weights: { 
        'دهني': 3, 'DHT': 2, 'انتعاش': 4, 'خفيف': 3, 'تقوية': 1,
        'أقل من 18 سنة': 4, '18-35 سنة': 3,
        'ناعم': 4, 'مجعد': 2, 'خشن': 1, 'ملون/مصفف': 2
      },
      penalties: { 'حساسية روائح': 0.8, 'أكثر من 50 سنة': 0.6 },
      synergy: { 'زيت إكليل الجبل': 1.06, 'زيت الجوجوبا': 1.03 },
      contraindications: ['حمل']
    },
    {
      name: 'زيت الخروع',
      type: 'special',
      viscosity: 'عالي',
      absorption: 'بطيء',
      heaviness: 'ثقيل',
      scent: 'قوي',
      maxPercentage: 20,
      idealRange: [10, 15],
      climateSuitability: ['جاف', 'معتدل'],
      seasonalSuitability: ['الشتاء'],
      weights: { 
        'تساقط': 4, 'تكثيف': 4, 'ثقيل': 5, 'غسيل نادر': 5,
        '18-35 سنة': 4, '36-50 سنة': 5,
        'مجعد': 5, 'خشن': 5, 'ملون/مصفف': 3
      },
      penalties: { 'دهني': 2, 'غسيل متكرر': 1, 'ناعم': 1.5 },
      synergy: { 'زيت بذور اليقطين': 1.08, 'زيت الجوجوبا': 1.1 },
      contraindications: [],
      usageTips: 'يخلط دائماً مع زيوت خفيفة لتحسين الامتصاص'
    },
    {
      name: 'زيت الحبة السوداء',
      type: 'special',
      viscosity: 'متوسط',
      absorption: 'بطيء',
      heaviness: 'ثقيل',
      scent: 'حار',
      maxPercentage: 15,
      idealRange: [5, 10],
      climateSuitability: ['جاف'],
      seasonalSuitability: ['الشتاء', 'الخريف'],
      weights: { 
        'إطالة': 3, 'تساقط': 3, 'ثقيل': 4, 'تقوية': 2,
        '36-50 سنة': 4, 'أكثر من 50 سنة': 5,
        'مجعد': 4, 'خشن': 5, 'ملون/مصفف': 2
      },
      penalties: { 'دهني': 1, 'أقل من 18 سنة': 0.7 },
      synergy: { 'زيت الأرغان': 1.03, 'زيت الزيتون': 1.02 },
      contraindications: [],
      usageTips: 'يستخدم بحذر على البشرة الحساسة'
    },
    {
      name: 'زيت النيم',
      type: 'essential',
      viscosity: 'متوسط',
      absorption: 'متوسط',
      heaviness: 'ثقيل',
      scent: 'نفاذ',
      maxPercentage: 5,
      idealRange: [2, 4],
      climateSuitability: ['رطب'],
      seasonalSuitability: ['الصيف'],
      weights: { 
        'فطريات': 5, 'قشرة': 4, 'ثقيل': 3, 'تقوية': 1,
        '18-35 سنة': 4, '36-50 سنة': 3,
        'ناعم': 1, 'مجعد': 3, 'خشن': 4
      },
      penalties: { 'حساسية روائح': 1.2, 'دهني': 1, 'أكثر من 50 سنة': 0.5 },
      synergy: { 'زيت الجوجوبا': 1.02, 'زيت شجرة الشاي': 1.04 },
      contraindications: []
    },
    {
      name: 'زيت اللوز الحلو',
      type: 'carrier',
      viscosity: 'متوسط',
      absorption: 'متوسط',
      heaviness: 'متوسط',
      scent: 'خفيف',
      maxPercentage: 100,
      idealRange: [20, 70],
      climateSuitability: ['معتدل'],
      seasonalSuitability: ['الربيع', 'الخريف'],
      weights: { 
        'ترطيب': 2, 'جاف': 3, 'متوسط': 3, 'محايد': 2,
        'أقل من 18 سنة': 4, '18-35 سنة': 3, 'أكثر من 50 سنة': 2,
        'ناعم': 5, 'مجعد': 3, 'خشن': 2, 'ملون/مصفف': 4
      },
      penalties: { 'حساسية لوز': 5, 'دهني': 0.3 },
      synergy: { 'زيت الأرغان': 1.02, 'زيت الجوجوبا': 1.03 },
      contraindications: ['لوز']
    },
    {
      name: 'زيت جوز الهند',
      type: 'special',
      viscosity: 'عالي',
      absorption: 'بطيء',
      heaviness: 'ثقيل',
      scent: 'جوزي',
      maxPercentage: 30,
      idealRange: [15, 25],
      climateSuitability: ['جاف'],
      seasonalSuitability: ['الشتاء'],
      weights: { 
        'ترطيب': 3, 'تقوية': 2, 'ثقيل': 4,
        '18-35 سنة': 3, '36-50 سنة': 4,
        'مجعد': 5, 'خشن': 5, 'ملون/مصفف': 2
      },
      penalties: { 'دهني': 2, 'منخفضة': 0.5, 'ناعم': 1.2 },
      synergy: { 'زيت الأرغان': 1.03, 'زيت الخروع': 1.05 },
      contraindications: [],
      usageTips: 'يتصلب في البرد - يسخن قبل الاستخدام'
    }
    
  ]), []);

  // ======= HELPERS =======
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function roundRatiosTo100(items) {
    // items: [{ name, raw }], where raw >= 0
    const total = items.reduce((s, it) => s + it.raw, 0) || 1;
    let out = items.map(it => ({ name: it.name, pct: Math.round((it.raw / total) * 100) }));
    // Adjust to sum 100 exactly
    let diff = 100 - out.reduce((s, it) => s + it.pct, 0);
    while (diff !== 0) {
      const idx = diff > 0
        ? out.reduce((iMax, it, i) => (it.pct < 100 && it.pct >= out[iMax].pct ? i : iMax), 0)
        : out.reduce((iMax, it, i) => (it.pct > 0 && it.pct >= out[iMax].pct ? i : iMax), 0);
      out[idx].pct += diff > 0 ? 1 : -1;
      diff = 100 - out.reduce((s, it) => s + it.pct, 0);
    }
    return out;
  }

  function safeIncludes(arr, key) {
    return Array.isArray(arr) && arr.includes(key);
  }

  // Build user conditions vector from answers
  const userConditions = useMemo(() => {
    const c = [];
    if (gender) c.push(gender);
    if (ageGroup) c.push(ageGroup);
    if (hairType) c.push(hairType);
    if (hairFall === 'نعم') c.push('تساقط');
    if (scalp) c.push(scalp);
    if (issues === 'قشرة') c.push('قشرة');
    if (issues === 'فطريات') c.push('فطريات');
    if (washFrequency) c.push(washFrequency);
    if (porosity === 'منخفضة') c.push('خفيف');
    if (porosity === 'عالية') c.push('ثقيل');
    if (porosity === 'متوسطة') c.push('متوسط');
    if (climate) c.push(climate);
    if (goals.length > 0) goals.forEach(g => c.push(g));
    if (scentPreference) c.push(scentPreference);
    
    // Add specific conditions based on combinations
    if (gender === 'ذكر' && hairFall === 'نعم') c.push('DHT');
    if (washFrequency === 'كل يوم') c.push('غسيل متكرر');
    if (washFrequency === 'كل أسبوعين') c.push('غسيل نادر');
    
    
    
    // Add hair type specific conditions
    if (hairType === 'مجعد') c.push('مجعد');
    if (hairType === 'خشن') c.push('خشن');
    if (hairType === 'ناعم') c.push('ناعم');
    if (hairType === 'ملون/مصفف') c.push('ملون/مصفف');

    goals.forEach(goal => {
      c.push(goal);
    });
  
    return c;
  }, [
    gender, 
    ageGroup, 
    hairType, 
    hairFall, 
    scalp, 
    issues, 
    washFrequency, 
    porosity, 
    climate, 
    goals
  ]);
  // ======= CORE ENGINE =======
  function determineBlendEnhanced() {
    const trace = [];
    const warnings = [];
  
    // 1. Initialize scores
    const scores = {};
    oilsDB.forEach(oil => (scores[oil.name] = 0));
  
    // 2. Base scoring
    userConditions.forEach(cond => {
      oilsDB.forEach(oil => {
        const w = oil.weights?.[cond];
        if (w) {
          scores[oil.name] += w;
          trace.push(`${oil.name}: +${w} لشرط "${cond}"`);
        }
      });
    });
  
    // 3. Climate/season adjustments
    oilsDB.forEach(oil => {
      if (climate && safeIncludes(oil.climateSuitability, climate)) {
        scores[oil.name] += 0.4;
        trace.push(`${oil.name}: +0.4 ملائمة مناخ (${climate})`);
      }
      if (season && safeIncludes(oil.seasonalSuitability, season)) {
        scores[oil.name] += 0.3;
        trace.push(`${oil.name}: +0.3 ملائمة موسم (${season})`);
      }
    });
  
    // 4. Mode adjustments
    oilsDB.forEach(oil => {
      if (mode === 'therapeutic') {
        const effect = (oil.weights?.['تساقط'] || 0) + 
                      (oil.weights?.['تقوية'] || 0) + 
                      (oil.weights?.['تكثيف'] || 0) + 
                      (oil.weights?.['إطالة'] || 0);
        const boost = effect * 0.05;
        if (boost) {
          scores[oil.name] += boost;
          trace.push(`${oil.name}: +${boost.toFixed(2)} وضع علاجي`);
        }
      } else if (mode === 'cosmetic') {
        const lightness = oil.heaviness === 'خفيف' ? 0.6 :
                  oil.heaviness === 'متوسط' ? 0.2 : -0.4;
        scores[oil.name] += lightness;
        trace.push(`${oil.name}: ${lightness >= 0 ? '+' : ''}${lightness.toFixed(2)} وضع تجميلي`);
      }
    });
  
    // 5. Apply penalties
    userConditions.forEach(cond => {
      oilsDB.forEach(oil => {
        const p = oil.penalties?.[cond];
        if (p) {
          scores[oil.name] -= p;
          trace.push(`${oil.name}: -${p} عقوبة لعدم الملاءمة (${cond})`);
        }
      });
    });
  
    // 6. Hard exclusions
    oilsDB.forEach(oil => {
      const contraindicated = (oil.contraindications || []).some(ci => 
        userConditions.includes(ci) || 
        allergies.includes(ci) || 
        (ci === 'حساسية لوز' && allergies.includes('لوز'))
      );
      
      if (contraindicated) {
        scores[oil.name] = -Infinity;
        warnings.push(`${oil.name} مستبعد بسبب موانع الاستخدام`);
        trace.push(`${oil.name}: مستبعد (موانع)`);
      }
    });
  
    // 7. Apply synergies
    oilsDB.forEach(oil => {
      Object.entries(oil.synergy || {}).forEach(([otherOil, multiplier]) => {
        if (scores[oil.name] > 0 && scores[otherOil] > 0) {
          const bonus = scores[oil.name] * (multiplier - 1);
          scores[oil.name] += bonus;
          trace.push(`${oil.name}: +${bonus.toFixed(2)} تآزر مع ${otherOil}`);
        }
      });
    });
  
    // 8. Filter and rank oils
    let ranked = Object.entries(scores)
      .filter(([, score]) => score > 0 && Number.isFinite(score))
      .sort((a, b) => b[1] - a[1]);
  
    // 9. Create initial blend (top 3-5 oils)
    let blend = ranked.slice(0, 3).map(([name, score]) => ({
      name,
      rawScore: score,
      isEssential: oilsDB.find(o => o.name === name)?.type === 'essential',
      isSpecial: oilsDB.find(o => o.name === name)?.type === 'special'
    }));
  
    // 10. Normalize to percentages
    let normalized = roundRatiosTo100(blend.map(oil => ({ name: oil.name, raw: oil.rawScore })));
  
    // 11. Apply safety limits
    blend = normalized.map(item => {
      const oilData = oilsDB.find(o => o.name === item.name);
      return {
        name: item.name,
        percentage: item.pct,
        ...oilData
      };
    });
  
    // 12. Enforce essential oil limits (max 5% total)
    const essentialOils = blend.filter(oil => oil.isEssential);
    const totalEssential = essentialOils.reduce((sum, oil) => sum + oil.percentage, 0);
  
    if (totalEssential > 5) {
      const reductionFactor = 5 / totalEssential;
      const carrierOils = blend.filter(oil => !oil.isEssential);
  
      // Reduce essential oils
      blend = blend.map(oil => {
        if (oil.isEssential) {
          const newPercentage = Math.round(oil.percentage * reductionFactor);
          trace.push(`خفض ${oil.name} من ${oil.percentage}% إلى ${newPercentage}% (حد الزيوت الأساسية)`);
          return { ...oil, percentage: newPercentage };
        }
        return oil;
      });
  
      // Redistribute remaining percentage
      const remaining = 100 - blend.reduce((sum, oil) => sum + oil.percentage, 0);
      if (remaining > 0 && carrierOils.length > 0) {
        const perOil = Math.round(remaining / carrierOils.length);
        blend = blend.map(oil => {
          if (!oil.isEssential) {
            return { ...oil, percentage: oil.percentage + perOil };
          }
          return oil;
        });
      }
    }
  
    // 13. Enforce individual oil limits
    blend = blend.map(oil => {
      if (oil.maxPercentage && oil.percentage > oil.maxPercentage) {
        warnings.push(`تم تقليل ${oil.name} إلى ${oil.maxPercentage}% (الحد الأقصى الآمن)`);
        trace.push(`${oil.name}: خفض من ${oil.percentage}% إلى ${oil.maxPercentage}% (حد فردي)`);
        return { ...oil, percentage: oil.maxPercentage };
      }
      return oil;
    });
  
    // 14. Special handling for castor oil
    const castorOil = blend.find(oil => oil.name === 'زيت الخروع');
    if (castorOil) {
      // Extra reduction for oily scalps
      if (scalp === 'دهني' && castorOil.percentage > 10) {
        castorOil.percentage = 10;
        warnings.push('زيت الخروع خُفض إلى 10% لأن فروة رأسك دهنية');
      }
      // Warning for high percentages
      if (castorOil.percentage > 15) {
        warnings.push('زيت الخروع مرتفع - قد يكون ثقيلاً على الشعر');
      }
    }
  
    // 15. Final normalization
    const finalBlend = roundRatiosTo100(blend.map(oil => ({ name: oil.name, raw: oil.percentage })))
      .map(item => ({
        name: item.name,
        percentage: item.pct,
        ...oilsDB.find(o => o.name === item.name)
      }));
  
    // 16. Calculate confidence
    const answeredQuestions = [gender, hairType, ageGroup, hairFall, scalp, issues, washFrequency, porosity, climate, goals]
      .filter(Boolean).length;
    const completeness = answeredQuestions / totalSteps;
    const topScore = ranked[0]?.[1] || 1;
    const secondScore = ranked[1]?.[1] || topScore;
    const spread = clamp(topScore / secondScore, 1, 3);
    const confidence = Math.round((0.6 * completeness + 0.4 * (1 / spread)) * 100);
  
    // 17. Prepare alternatives
    const currentOilNames = new Set(finalBlend.map(oil => oil.name));
    const alternatives = ranked
      .filter(([name]) => !currentOilNames.has(name))
      .slice(0, 3)
      .map(([name]) => name);
  
    // 18. Generate reasoning
    const reasoning = [
      `الخلطة النهائية: ${finalBlend.map(o => `${o.name} (${o.percentage}%)`).join(' + ')}`,
      `بناءً على: ${userConditions.join(', ') || 'لا توجد شروط محددة'}`,
      `الوضع: ${mode === 'therapeutic' ? 'علاجي مكثف' : mode === 'cosmetic' ? 'تجميلي يومي' : 'متوازن'}`,
      climate && `مناخ: ${climate}`,
      season && `موسم: ${season}`
    ].filter(Boolean).join('. ');
  
    return {
      blend: finalBlend,
      alternatives,
      confidence,
      reasoning,
      warnings: [...new Set(warnings)], // Remove duplicates
      trace
    };
  }

  // Update the saveResultsToFirebase function
const saveResultsToFirebase = async (orderId, userData, result) => {
  try {
    const resultData = {
      orderId: orderId,
      timestamp: serverTimestamp(),
      userData: {
        gender: userData.gender,
        ageGroup: userData.ageGroup,
        hairType: userData.hairType,
        hairFall: userData.hairFall,
        scalp: userData.scalp,
        issues: userData.issues,
        washFrequency: userData.washFrequency,
        porosity: userData.porosity,
        climate: userData.climate,
        goals: userData.goals,
        allergies: userData.allergies || [],
        season: userData.season,
        scentPreference: userData.scentPreference,
        mode: userData.mode
      },
      result: {
        blend: result.blend,
        alternatives: result.alternatives,
        confidence: result.confidence,
        reasoning: result.reasoning,
        warnings: result.warnings,
        trace: result.trace
      },
      status: 'completed'
    };

    // Changed from "orders" to "resultdata"
    await setDoc(doc(db, "resultdata", orderId), resultData);
    console.log("Result data saved successfully with ID:", orderId);
    return orderId;
  } catch (error) {
    console.error("Error saving result data to Firebase:", error);
    throw error;
  }
};

  // ======= UI HELPERS (mostly from your code) =======
  const handleOptionClick = (value) => {
    switch (step) {
      case 1: setGender(value); break;
      case 2: setAgeGroup(value); break; // جديد
      case 3: setHairType(value); break; // جديد 
      case 4: setHairFall(value); break;
      case 5: setScalp(value); break;
      case 6: setIssues(value); break;
      case 7: setWashFrequency(value); break;
      case 8: setPorosity(value); break;
      case 9: setClimate(value); break;
      case 10: 
      // Toggle selection for goals
      setGoals(prev => 
        prev.includes(value) 
          ? prev.filter(g => g !== value) 
          : [...prev, value]
      );
      break;
      default: break;
    }
  };

  const currentSelection = () => {
    switch (step) {
      case 1: return gender;
      case 2: return ageGroup; // جديد
      case 3: return hairType; // جديد
      case 4: return hairFall;
      case 5: return scalp;
      case 6: return issues;
      case 7: return washFrequency;
      case 8: return porosity;
      case 9: return climate;
      case 10: return goals.length > 0 ? goals.join(', ') : ''; // Return joined string for display
      default: return '';
    }
  };

  // ======= CLIMATE DETECTION (kept) =======
  useEffect(() => {
    if (step === 7 && !climate && !showManualOptions) {
      detectClimate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, climate, showManualOptions]);

  const detectClimate = async () => {
    setIsFetchingClimate(true);
    setLocationError(false);
  
    try {
      // --- تحديد الموقع ---
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 7000 });
      });
  
      const { latitude, longitude } = position.coords;
  
      // --- اسم المدينة بالعربية باستخدام Nominatim ---
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`
      );
      const geoData = await geoRes.json();
      const city =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        geoData.address?.county ||
        geoData.address?.state ||
        "موقعك الحالي";
  
      // --- forecast للحصول على أعلى temp ورطوبة ---
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=bb086ec12341a0771a869beb72103dc6&units=metric&lang=ar`
      );
      if (!forecastRes.ok) throw new Error("Forecast API failed");
      const forecastData = await forecastRes.json();
  
      const todayDate = new Date().toISOString().split("T")[0];
      const todayList = forecastData.list.filter((entry) =>
        entry.dt_txt.startsWith(todayDate)
      );
  
      let maxTemp = -Infinity;
      let maxHumidity = -Infinity;
      todayList.forEach((entry) => {
        if (entry.main.temp_max > maxTemp) maxTemp = entry.main.temp_max;
        if (entry.main.humidity > maxHumidity) maxHumidity = entry.main.humidity;
      });
  
      const temp = maxTemp === -Infinity ? 22 : maxTemp;
      const humidity = maxHumidity === -Infinity ? 50 : maxHumidity;
  
      const nearCoast = isNearCoast(latitude, longitude);
  
      // --- المنطق النهائي لتبسيط المناخ ---
      let climateType = "معتدل";
  
      if (temp >= 25 && humidity >= 60) climateType = "رطب";                 // حر رطب
      else if (temp >= 25 && humidity <= 40) climateType = nearCoast ? "معتدل" : "جاف";  
      else if (temp <= 15 && humidity >= 65) climateType = "رطب";            // برد رطب
      else if (temp <= 15 && humidity <= 40) climateType = "جاف";            // برد جاف
      else climateType = nearCoast ? "رطب" : "معتدل";                        // منطقة وسطية
  
      setLocationInfo(city);
      setClimate(climateType);
  
    } catch (err) {
      console.error("Detection failed:", err);
      setLocationError(true);
    } finally {
      setIsFetchingClimate(false);
    }
  };
  
  // --- دالة لحساب المسافة بين نقطتين (Haversine formula) ---
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2)**2 +
      Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
      Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  
  // نقاط ساحلية أوسع (الجزائر + المغرب + تونس + ليبيا، وتقدر تزيد لاحقًا)
  const coastPoints = [
    // الجزائر (متوسط)
    { lat: 36.7538, lon: 3.0588 },   // الجزائر العاصمة
    { lat: 36.5920, lon: 2.4470 },   // تيبازة
    { lat: 36.6100, lon: 2.1900 },   // شرشال
    { lat: 35.6970, lon: -0.6300 },  // وهران
    { lat: 36.7500, lon: 5.0700 },   // بجاية
    { lat: 36.8200, lon: 5.7500 },   // جيجل
    { lat: 36.9000, lon: 7.7700 },   // عنابة
    { lat: 36.4500, lon: 6.2600 },   // سكيكدة
    { lat: 36.8800, lon: 6.9100 },   // القالة
    // تونس
    { lat: 36.8000, lon: 10.1800 },  // العاصمة
    { lat: 35.7800, lon: 10.8300 },  // سوسة/المنستير
    // المغرب
    { lat: 34.0209, lon: -6.8416 },  // الرباط/المحيط
    { lat: 33.5731, lon: -7.5898 },  // الدار البيضاء
    { lat: 35.7595, lon: -5.8340 },  // طنجة
    // ليبيا (متوسط)
    { lat: 32.8872, lon: 13.1913 },  // طرابلس
  ];
  
  const isNearCoast = (lat, lon, thresholdKm = 50) =>
    coastPoints.some(p => getDistanceKm(lat, lon, p.lat, p.lon) <= thresholdKm);
  
  // تحويل طابع وقت forecast إلى تاريخ محلي حسب إزاحة OWM
  const toLocalDateStr = (unixSec, tzOffsetSec) => {
    const d = new Date((unixSec + tzOffsetSec) * 1000);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  
  // ======= FLOW =======
  // Add this function at the top of your Quiz component (with other helper functions)
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// Then update your handleNext function to include scrolling
const handleNext = async () => {
  if (step < totalSteps) {
    setDirection(1);
    setStep(prev => prev + 1);
  } else {
    // Scroll to top before showing results
    scrollToTop();
    
    setLoading(true);
    setProgress(0);
    let counter = 0;
    const interval = setInterval(async () => {
      counter += 2;
      if (counter <= 100) {
        setProgress(counter);
      } else {
        clearInterval(interval);
        
        try {
          const result = determineBlendEnhanced();
          const orderId = generateOrderId();
          
          // Prepare user data
          const userData = {
            gender,
            ageGroup,
            hairType,
            hairFall,
            scalp,
            issues,
            washFrequency,
            porosity,
            climate,
            goals: JSON.stringify(goals),
            allergies: allergies, // Add this when you implement allergies
            season,
            scentPreference,
            mode
          };

          // Save to Firebase
          await saveResultsToFirebase(orderId, userData, result);
          
          // Pass orderId to onQuizComplete
          onQuizComplete({
            ...userData,
            orderId, // Add orderId to the result
            blend: JSON.stringify(result.blend),
            alternatives: JSON.stringify(result.alternatives),
            confidence: result.confidence,
            reasoning: result.reasoning,
            warnings: JSON.stringify(result.warnings),
            trace: JSON.stringify(result.trace)
          });

        } catch (error) {
          console.error("Error processing results:", error);
          // Fallback - still show results even if Firebase fails
          const result = determineBlendEnhanced();
          onQuizComplete({
            gender,
            ageGroup,
            hairType,
            hairFall,
            scalp,
            issues,
            washFrequency,
            porosity,
            climate,
            goals: JSON.stringify(goals),
            allergies: allergies,
            season,
            scentPreference,
            mode,
            blend: JSON.stringify(result.blend),
            alternatives: JSON.stringify(result.alternatives),
            confidence: result.confidence,
            reasoning: result.reasoning,
            warnings: JSON.stringify(result.warnings),
            trace: JSON.stringify(result.trace),
            orderId: 'ERROR_SAVING' // Indicate save error
          });
        }
      }
    }, 100);
  }
};

// Add this function in your Quiz component or a separate utility file
const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `DATA_${timestamp}_${randomStr}`.toUpperCase();
};

  // ======= OPTIONS & LABELS (kept + extended) =======
  const getOptions = () => {
    switch (step) {
      case 1: return ['ذكر', 'أنثى'];
      case 2: return ['أقل من 18 سنة', '18-35 سنة', '36-50 سنة', 'أكثر من 50 سنة']; // جديد
      case 3: return ['ناعم', 'مجعد', 'خشن', 'ملون/مصفف']; // جديد
      case 4: return ['نعم', 'لا'];
      case 5: return ['دهني', 'جاف', 'عادي'];
      case 6: return ['كلا', 'قشرة', 'فطريات'];
      case 7: return ['كل يوم', '2-3 مرات أسبوعيًا', 'مرة أسبوعيًا', 'كل أسبوعين'];
      case 8: return ['منخفضة', 'متوسطة', 'عالية'];
      case 9: return ['جاف', 'رطب', 'معتدل'];
      case 10: return ['ترطيب', 'إطالة', 'تكثيف', 'تقوية'];
      default: return [];
    }
  };

  const stepTitle = () => {
    const titles = [
      'ما هو جنسك؟',
      'ما هي فئتك العمرية؟', // جديد
      'ما هو نوع شعرك؟', // جديد
      'هل تعاني من تساقط الشعر؟',
      'ما نوع فروة رأسك؟',
      'هل لديك مشاكل في فروة الرأس؟',
      'كم مرة تغسل شعرك؟',
      'ما هي مسامية شعرك؟',
      'ما هو مناخ منطقتك؟',
      'ما هو هدفك الأساسي؟'
    ];
    return titles[step - 1];
  };

  const motivationText = () => {
    const texts = [
      'الجنس يؤثر على هرمونات الشعر واستجابته للزيوت.',
      'العمر يحدد كثافة الزيوت الطبيعية التي تنتجها فروة الرأس.', // جديد
      'نوع الشعر يحدد قدرة الامتصاص والزيوت المناسبة له.', // جديد
      'التساقط يحتاج زيوت موجهة للجذور وتقليل DHT.',
      'نوع الفروة يحدد وزن الزيت وسرعة امتصاصه.',
      'عالج المشكلة أولًا ثم غذِّ الشعر.',
      'التكرار يغيّر لزوجة التركيبة ونسبة الزيوت.',
      'المسامية تحدد قدرة الامتصاص وعمق الاختراق.',
      'المناخ يغيّر الاحتياجات بين ترطيب وخفة.',
      'الهدف يحدد تركيز الفعالية في المزج.'
    ];
    return texts[step - 1];
  };

  // Compact Porosity Guide (kept)
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

  const progressBar = Math.round((step / totalSteps) * 100);
  // ======= RENDER =======
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