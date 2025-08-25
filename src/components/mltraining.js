// File: MLTraining.js (updated)
import React, { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import '../mltraining.css';

const MLTraining = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [model, setModel] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [stats, setStats] = useState({
    totalRecords: 0,
    withReviews: 0,
    averageSatisfaction: 0
  });
  const [generatingData, setGeneratingData] = useState(false);
  const [insights, setInsights] = useState(null);
const [patterns, setPatterns] = useState(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [selectedInsightCategory, setSelectedInsightCategory] = useState('hairType');

  // Load training data from Firebase
  // Update the loadTrainingData function
const loadTrainingData = useCallback(async () => {
  try {
    // Get all resultdata
    const resultQuery = query(collection(db, 'resultdata'), orderBy('timestamp', 'desc'));
    const resultSnapshot = await getDocs(resultQuery);
    const resultsData = resultSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Get all reviews
    const reviewQuery = query(collection(db, 'reviews'));
    const reviewSnapshot = await getDocs(reviewQuery);
    const reviewsData = reviewSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Combine data - prioritize reviews from reviews collection
    const combinedData = resultsData.map(result => {
      // First try to find a review in the reviews collection
      let review = reviewsData.find(r => r.orderId === result.orderId);
      
      // If not found, check if the review is embedded in the resultdata
      if (!review && result.review) {
        review = result.review;
      }
      
      return {
        ...result,
        review: review || null
      };
    });
    
    setTrainingData(combinedData);
    
    // Calculate stats
    const withReviews = combinedData.filter(item => item.review).length;
    const satisfactionScores = combinedData
      .filter(item => item.review)
      .map(item => item.review.satisfactionScore || 0);
    
    const avgSatisfaction = satisfactionScores.length > 0 
      ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length 
      : 0;
    
    setStats({
      totalRecords: combinedData.length,
      withReviews: withReviews,
      averageSatisfaction: avgSatisfaction.toFixed(2)
    });
  } catch (error) {
    console.error('Error loading training data:', error);
  }
}, []);

  useEffect(() => {
    loadTrainingData();
  }, [loadTrainingData]);

  // Generate realistic oil blends based on user data
  // Improved generateRealisticBlend function
const generateRealisticBlend = (userData) => {
  const allOils = [
    { name: 'زيت الجوجوبا', baseWeight: 0.3, forOily: true, forDry: false },
    { name: 'زيت بذور اليقطين', baseWeight: 0.2, forHairLoss: true },
    { name: 'زيت الأرغان', baseWeight: 0.25, forDry: true, forDamaged: true },
    { name: 'زيت إكليل الجبل', baseWeight: 0.05, forHairLoss: true, essential: true },
    { name: 'زيت النعناع', baseWeight: 0.03, forOily: true, essential: true },
    { name: 'زيت الخروع', baseWeight: 0.1, forGrowth: true, thick: true },
    { name: 'زيت اللوز الحلو', baseWeight: 0.2, forNormal: true },
    { name: 'زيت جوز الهند', baseWeight: 0.15, forDry: true, thick: true },
    { name: 'زيت الزيتون', baseWeight: 0.1, forDry: true },
    { name: 'زيت النيم', baseWeight: 0.08, forDandruff: true, strongScent: true },
    { name: 'زيت شجرة الشاي', baseWeight: 0.06, forDandruff: true, essential: true }
  ];

  // Filter and adjust oils based on user data
  let selectedOils = allOils.map(oil => ({ ...oil }));
  
  // Adjust based on scalp type
  if (userData.scalp === 'دهني') {
    selectedOils = selectedOils.map(oil => ({
      ...oil,
      baseWeight: oil.forOily ? oil.baseWeight * 1.4 : oil.baseWeight * 0.7
    }));
  } else if (userData.scalp === 'جاف') {
    selectedOils = selectedOils.map(oil => ({
      ...oil,
      baseWeight: oil.forDry ? oil.baseWeight * 1.4 : oil.baseWeight * 0.7
    }));
  }

  // Adjust based on issues
  if (userData.issues === 'قشرة') {
    selectedOils = selectedOils.map(oil => ({
      ...oil,
      baseWeight: oil.forDandruff ? oil.baseWeight * 1.5 : oil.baseWeight
    }));
  } else if (userData.hairFall === 'نعم') {
    selectedOils = selectedOils.map(oil => ({
      ...oil,
      baseWeight: oil.forHairLoss ? oil.baseWeight * 1.5 : oil.baseWeight
    }));
  }

  // Adjust based on hair type
  if (userData.hairType === 'ناعم') {
    selectedOils = selectedOils.map(oil => ({
      ...oil,
      baseWeight: oil.thick ? oil.baseWeight * 0.6 : oil.baseWeight * 1.2
    }));
  } else if (userData.hairType === 'خشن') {
    selectedOils = selectedOils.map(oil => ({
      ...oil,
      baseWeight: oil.thick ? oil.baseWeight * 1.3 : oil.baseWeight * 0.8
    }));
  }

  // Remove oils with very low weight and limit essential oils
  const filteredOils = selectedOils.filter(oil => oil.baseWeight > 0.05);
  
  // Limit to 3-5 oils for realism
  const topOils = filteredOils
    .sort((a, b) => b.baseWeight - a.baseWeight)
    .slice(0, Math.floor(Math.random() * 3)); // 3-5 oils

  // Normalize to 100%
  const totalWeight = topOils.reduce((sum, oil) => sum + oil.baseWeight, 0);
  return topOils.map(oil => ({
    name: oil.name,
    percentage: Math.round((oil.baseWeight / totalWeight) * 100)
  }));
};

  // Generate realistic satisfaction score based on user data and blend
  const generateRealisticSatisfaction = (userData, blend) => {
    let baseScore = 70; // Base satisfaction
    
    // Adjust based on hair type compatibility
    if (userData.hairType === 'جاف' && blend.some(o => o.name === 'زيت الأرغان')) {
      baseScore += 15;
    }
    
    if (userData.hairType === 'دهني' && blend.some(o => o.name === 'زيت الجوجوبا')) {
      baseScore += 12;
    }
    
    // Adjust based on issues addressed
    if (userData.issues === 'قشرة' && blend.some(o => o.name === 'زيت النيم')) {
      baseScore += 10;
    }
    
    if (userData.hairFall === 'نعم' && blend.some(o => o.name === 'زيت بذور اليقطين')) {
      baseScore += 8;
    }
    
    // Add some randomness (±10 points)
    const randomVariation = Math.floor(Math.random() * 21) - 10;
    
    return Math.max(40, Math.min(100, baseScore + randomVariation));
  };

  // Generate synthetic data and store in Firebase
  // File: MLTraining.js (updated generateSyntheticData function)
const generateSyntheticData = async () => {
  setGeneratingData(true);
  
  try {
    const userAttributes = {
      genders: ['ذكر', 'أنثى'],
      ageGroups: ['أقل من 18 سنة', '18-35 سنة', '36-50 سنة', 'أكثر من 50 سنة'],
      hairTypes: ['ناعم', 'مجعد', 'خشن', 'ملون/مصفف'],
      scalps: ['دهني', 'جاف', 'عادي'],
      issues: ['كلا', 'قشرة', 'فطريات'],
      porosities: ['منخفضة', 'متوسطة', 'عالية'],
      climates: ['جاف', 'رطب', 'معتدل']
    };
    
    // Generate 20 synthetic records
    for (let i = 0; i < 20; i++) {
      const userData = {
        gender: userAttributes.genders[Math.floor(Math.random() * userAttributes.genders.length)],
        ageGroup: userAttributes.ageGroups[Math.floor(Math.random() * userAttributes.ageGroups.length)],
        hairType: userAttributes.hairTypes[Math.floor(Math.random() * userAttributes.hairTypes.length)],
        hairFall: Math.random() > 0.5 ? 'نعم' : 'لا',
        scalp: userAttributes.scalps[Math.floor(Math.random() * userAttributes.scalps.length)],
        issues: userAttributes.issues[Math.floor(Math.random() * userAttributes.issues.length)],
        washFrequency: ['كل يوم', '2-3 مرات أسبوعيًا', 'مرة أسبوعيًا', 'كل أسبوعين'][Math.floor(Math.random() * 4)],
        porosity: userAttributes.porosities[Math.floor(Math.random() * userAttributes.porosities.length)],
        climate: userAttributes.climates[Math.floor(Math.random() * userAttributes.climates.length)],
        goals: JSON.stringify(['ترطيب', 'إطالة', 'تكثيف', 'تقوية'].filter(() => Math.random() > 0.5))
      };
      
      // Generate realistic blend
      const blend = generateRealisticBlend(userData);
      
      // Generate realistic satisfaction score
      const satisfactionScore = generateRealisticSatisfaction(userData, blend);
      
      // Convert to 1-5 star ratings
      const ratingFromScore = (score) => Math.max(1, Math.min(5, Math.round(score / 20)));
      
      // Create order ID
      const orderId = `synth-${Date.now()}-${i}`;
      
      // Save to resultdata collection
      const resultData = {
        orderId: orderId,
        timestamp: serverTimestamp(),
        userData: userData,
        result: {
          blend: blend,
          confidence: Math.floor(Math.random() * 30) + 70, // 70-100% confidence
          reasoning: `خلطة مخصصة ل${userData.hairType} شعر مع ${userData.scalp} فروة رأس`
        },
        status: 'completed',
        isSynthetic: true
      };
      
      await addDoc(collection(db, 'resultdata'), resultData);
      
      // Generate realistic review text based on satisfaction
      let hairFeelText, improvementsText;
      
      if (satisfactionScore >= 80) {
        hairFeelText = 'شعر ناعم حريري مع لمعان صحي ملحوظ';
        improvementsText = 'لا شيء، الخلطة مثالية';
      } else if (satisfactionScore >= 60) {
        hairFeelText = 'شعر أكثر نعومة وترطيباً ولكن يحتاج وقتاً أطول';
        improvementsText = 'يمكن تحسين سرعة الامتصاص';
      } else {
        hairFeelText = 'شعر ثقيل قليلاً يحتاج إلى تكييف';
        improvementsText = 'تخفيف قوام الخلطة وتحسين الرائحة';
      }
      
      // Save review to reviews collection
      const reviewData = {
        orderId: orderId,
        timestamp: serverTimestamp(),
        ratings: {
          effectiveness: ratingFromScore(satisfactionScore),
          scent: Math.max(1, Math.min(5, ratingFromScore(satisfactionScore) + Math.floor(Math.random() * 2) - 1)),
          texture: Math.max(1, Math.min(5, ratingFromScore(satisfactionScore) + Math.floor(Math.random() * 2) - 1)),
          absorption: Math.max(1, Math.min(5, ratingFromScore(satisfactionScore) + Math.floor(Math.random() * 2) - 1)),
          overall: ratingFromScore(satisfactionScore)
        },
        feedback: {
          hairFeel: hairFeelText,
          improvements: improvementsText,
          wouldRepurchase: satisfactionScore > 70
        },
        satisfactionScore: satisfactionScore,
        isSynthetic: true,
        // Include blend information for ML training
        blend: blend,
        userData: userData
      };
      
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Also update the order document to mark it as reviewed
      try {
        // We need to find the document we just created to update it
        const resultQuery = query(collection(db, 'resultdata'), where('orderId', '==', orderId));
        const resultSnapshot = await getDocs(resultQuery);
        
        if (!resultSnapshot.empty) {
          const docId = resultSnapshot.docs[0].id;
          await updateDoc(doc(db, 'resultdata', docId), {
            reviewed: true,
            review: reviewData
          });
        }
      } catch (updateError) {
        console.warn('Could not update resultdata with review:', updateError);
      }
      
      // Update progress
      setGeneratingData(`جاري إنشاء البيانات... ${i + 1}/20`);
      
      // Small delay to avoid Firebase rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    alert('تم إنشاء 20 سجلًا اصطناعيًا وحفظها في Firebase!');
    
    // Reload data to include the new synthetic records
    await loadTrainingData();
    
  } catch (error) {
    console.error('Error generating synthetic data:', error);
    alert('حدث خطأ أثناء إنشاء البيانات الاصطناعية: ' + error.message);
  } finally {
    setGeneratingData(false);
  }
};

  // Prepare features from user data (keep the rest of your existing functions)
  // Fixed prepareFeatures function
const prepareFeatures = (userData) => {
  if (!userData) return null;
  
  try {
    const features = [];
    
    // Gender (one-hot encoding)
    if (userData.gender === 'ذكر') features.push(1, 0);
    else if (userData.gender === 'أنثى') features.push(0, 1);
    else features.push(0, 0);
    
    // Age group (one-hot encoding)
    const ageGroups = ['أقل من 18 سنة', '18-35 سنة', '36-50 سنة', 'أكثر من 50 سنة'];
    ageGroups.forEach(age => {
      features.push(userData.ageGroup === age ? 1 : 0);
    });
    
    // Hair type (one-hot encoding)
    const hairTypes = ['ناعم', 'مجعد', 'خشن', 'ملون/مصفف'];
    hairTypes.forEach(type => {
      features.push(userData.hairType === type ? 1 : 0);
    });
    
    // Hair fall (binary)
    features.push(userData.hairFall === 'نعم' ? 1 : 0);
    
    // Scalp type (one-hot encoding)
    const scalpTypes = ['دهني', 'جاف', 'عادي'];
    scalpTypes.forEach(type => {
      features.push(userData.scalp === type ? 1 : 0);
    });
    
    // Issues (one-hot encoding)
    const issuesTypes = ['كلا', 'قشرة', 'فطريات'];
    issuesTypes.forEach(type => {
      features.push(userData.issues === type ? 1 : 0);
    });
    
    // Wash frequency (one-hot encoding)
    const washFreqs = ['كل يوم', '2-3 مرات أسبوعيًا', 'مرة أسبوعيًا', 'كل أسبوعين'];
    washFreqs.forEach(freq => {
      features.push(userData.washFrequency === freq ? 1 : 0);
    });
    
    // Porosity (one-hot encoding)
    const porosityTypes = ['منخفضة', 'متوسطة', 'عالية'];
    porosityTypes.forEach(type => {
      features.push(userData.porosity === type ? 1 : 0);
    });
    
    // Climate (one-hot encoding)
    const climateTypes = ['جاف', 'رطب', 'معتدل'];
    climateTypes.forEach(type => {
      features.push(userData.climate === type ? 1 : 0);
    });
    
    // Goals (multi-hot encoding)
    const allGoals = ['ترطيب', 'إطالة', 'تكثيف', 'تقوية'];
    let userGoals = [];
    try {
      userGoals = typeof userData.goals === 'string' ? JSON.parse(userData.goals) : [];
    } catch (e) {
      userGoals = [];
    }
    allGoals.forEach(goal => {
      features.push(userGoals.includes(goal) ? 1 : 0);
    });
    
    console.log('Generated features vector length:', features.length);
    return features;
    
  } catch (error) {
    console.error('Error preparing features:', error);
    return null;
  }
};

  // Prepare targets from review data (keep the same)
  const prepareTargets = (review, originalBlend) => {
    if (!review || !review.ratings) return null;
    
    try {
      const targets = [];
      const { ratings, feedback } = review;
      
      // Overall satisfaction is the primary target
      targets.push((ratings.overall || 3) / 5); // Normalize to 0-1, default to 3 if missing
      
      // Individual rating targets with fallbacks
      targets.push((ratings.effectiveness || 3) / 5);
      targets.push((ratings.scent || 3) / 5);
      targets.push((ratings.texture || 3) / 5);
      targets.push((ratings.absorption || 3) / 5);
      
      // Would repurchase (binary with fallback)
      targets.push(feedback?.wouldRepurchase ? 1 : 0);
      
      console.log('Generated targets:', targets);
      return targets;
      
    } catch (error) {
      console.error('Error preparing targets:', error);
      return null;
    }
  };

  // Create and train the model (keep the same)
  const trainModel = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      // Filter data with reviews
      const validData = trainingData.filter(item => item.review);
      
      if (validData.length < 10) {
        alert('تحتاج إلى 10 سجلات على الأقل مع تقييمات لتدريب النموذج');
        setIsTraining(false);
        return;
      }
      
      console.log(`Training with ${validData.length} records`);
      
      // Prepare training data
      const features = [];
      const targets = [];
      
      validData.forEach((item, index) => {
        try {
          const featureVector = prepareFeatures(item.userData);
          const targetVector = prepareTargets(item.review, item.result?.blend);
          
          if (featureVector && targetVector) {
            features.push(featureVector);
            targets.push(targetVector);
          }
          
          setTrainingProgress(Math.round((index + 1) / validData.length * 33));
        } catch (error) {
          console.error('Error processing item:', item.id, error);
        }
      });
      
      if (features.length === 0 || targets.length === 0) {
        alert('لا توجد بيانات صالحة للتدريب');
        setIsTraining(false);
        return;
      }
      
      console.log(`Prepared ${features.length} training examples`);
      
      // Convert to tensors
      const featureTensor = tf.tensor2d(features);
      const targetTensor = tf.tensor2d(targets);
      
      console.log('Feature tensor shape:', featureTensor.shape);
      console.log('Target tensor shape:', targetTensor.shape);
      
      // Create a simpler model for better compatibility
      const newModel = tf.sequential();
      
      // Input layer
      newModel.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
        inputShape: [features[0].length]
      }));
      
      // Add dropout to prevent overfitting
      newModel.add(tf.layers.dropout({ rate: 0.2 }));
      
      // Hidden layer
      newModel.add(tf.layers.dense({ 
        units: 16, 
        activation: 'relu' 
      }));
      
      // Output layer - 6 outputs: overall, effectiveness, scent, texture, absorption, repurchase
      newModel.add(tf.layers.dense({ 
        units: 6, 
        activation: 'sigmoid' 
      }));
      
      // Compile model with simpler configuration
      newModel.compile({
        optimizer: tf.train.adam(0.001), // Lower learning rate
        loss: 'meanSquaredError',
        metrics: ['mse'] // Use MSE instead of accuracy for regression
      });
      
      // Train model with callbacks for progress
      const history = await newModel.fit(featureTensor, targetTensor, {
        epochs: 50, // Reduced epochs
        batchSize: 8, // Smaller batch size
        validationSplit: 0.2,
        verbose: 0, // Suppress default logging
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const progress = 33 + Math.round((epoch + 1) / 50 * 67);
            setTrainingProgress(progress);
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss ? logs.val_loss.toFixed(4) : 'N/A'}`);
          },
          onTrainEnd: () => {
            console.log('Training completed');
          }
        }
      });
      
      setModel(newModel);
      setTrainingHistory(history);
      
      // Save model locally
      try {
        await newModel.save('localstorage://oil-blend-model');
        console.log('Model saved successfully');
      } catch (saveError) {
        console.error('Error saving model:', saveError);
      }
      
      // Clean up tensors to avoid memory leaks
      featureTensor.dispose();
      targetTensor.dispose();
      
      alert('تم تدريب النموذج بنجاح!');
      
    } catch (error) {
      console.error('Error training model:', error);
      alert('حدث خطأ أثناء التدريب: ' + error.message);
    } finally {
      setIsTraining(false);
      setTrainingProgress(0);
    }
  };

  // Load saved model (keep the same)
  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadLayersModel('localstorage://oil-blend-model');
      setModel(loadedModel);
      alert('تم تحميل النموذج المحفوظ');
    } catch (error) {
      console.error('Error loading model:', error);
      alert('لا يوجد نموذج محفوظ أو حدث خطأ في التحميل');
    }
  };

  // Compare ML recommendations with original logic
  const compareRecommendations = async () => {
    if (!model) {
      alert('يجب تدريب أو تحميل النموذج أولاً');
      return;
    }
    
    // Get some test data
    const testData = trainingData.filter(item => item.review).slice(0, 3);
    
    if (testData.length === 0) {
      alert('لا توجد بيانات كافية للمقارنة');
      return;
    }
    
    const comparisons = [];
    
    for (const item of testData) {
      // Prepare features for prediction
      const features = prepareFeatures(item.userData);
      const featureTensor = tf.tensor2d([features]);
      
      // Get ML prediction
      const prediction = model.predict(featureTensor);
      const predictionArray = await prediction.array();
      
      // Get original blend and satisfaction
      const originalSatisfaction = item.review.satisfactionScore || 
        (item.review.ratings.overall * 20); // Convert 1-5 scale to 0-100
      
      // Store comparison
      comparisons.push({
        orderId: item.id,
        originalBlend: item.result.blend,
        originalSatisfaction: originalSatisfaction,
        mlPredictedSatisfaction: predictionArray[0][0] * 100, // Convert back to 0-100 scale
        mlRecommendation: await generateMLBlend(item.userData, predictionArray[0])
      });
      
      featureTensor.dispose();
      prediction.dispose();
    }
    
    setComparisonResults(comparisons);
  };


  // Generate ML-based blend recommendation (keep the same)
  const generateMLBlend = async (userData, mlOutput) => {
    // This is a simplified version - in a real implementation, you would
    // use the ML output to adjust oil weights based on predicted effectiveness
    
    const oilsDB = [
      { name: 'زيت الجوجوبا', baseWeight: 0.3 },
      { name: 'زيت بذور اليقطين', baseWeight: 0.2 },
      { name: 'زيت الأرغان', baseWeight: 0.25 },
      { name: 'زيت إكليل الجبل', baseWeight: 0.05 },
      { name: 'زيت النعناع', baseWeight: 0.03 },
      { name: 'زيت الخروع', baseWeight: 0.1 },
      { name: 'زيت الحبة السوداء', baseWeight: 0.07 }
    ];
    
    // Adjust weights based on ML prediction
    // effectiveness prediction is at index 1 of mlOutput
    const effectiveness = mlOutput[1];
    
    // For demonstration - adjust weights based on predicted effectiveness
    const adjustedWeights = oilsDB.map(oil => {
      let adjusted = oil.baseWeight;
      
      // Example logic: if effectiveness prediction is high, increase therapeutic oils
      if (effectiveness > 0.7) {
        if (oil.name === 'زيت إكليل الجبل' || oil.name === 'زيت بذور اليقطين') {
          adjusted *= 1.3;
        }
      }
      
      // If scent prediction is low, reduce strong-scented oils
      if (mlOutput[2] < 0.5) {
        if (oil.name === 'زيت النعناع' || oil.name === 'زيت الحبة السوداء') {
          adjusted *= 0.7;
        }
      }
      
      return {
        name: oil.name,
        weight: adjusted
      };
    });
    
    // Normalize to 100%
    const totalWeight = adjustedWeights.reduce((sum, oil) => sum + oil.weight, 0);
    return adjustedWeights.map(oil => ({
      name: oil.name,
      percentage: Math.round((oil.weight / totalWeight) * 100)
    }));
  };

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    try {
      const validData = trainingData.filter(item => item.review && item.userData);
      
      if (validData.length < 5) {
        alert('تحتاج إلى 5 سجلات على الأقل لتحليل الأنماط');
        return;
      }
  
      const newInsights = {
        hairType: {},
        scalpType: {},
        climate: {},
        ageGroup: {},
        mostEffectiveOils: {},
        commonComplaints: {},
        seasonalPatterns: {}
      };
  
      const newPatterns = {
        correlations: [],
        successfulCombinations: [],
        unsuccessfulCombinations: []
      };
  
      // Analyze by hair type
      const hairTypes = ['ناعم', 'مجعد', 'خشن', 'ملون/مصفف'];
      hairTypes.forEach(type => {
        const typeData = validData.filter(item => item.userData.hairType === type);
        if (typeData.length > 0) {
          const avgSatisfaction = typeData.reduce((sum, item) => sum + (item.review.satisfactionScore || 0), 0) / typeData.length;
          const topOils = findTopOilsForCategory(typeData, type);
          newInsights.hairType[type] = { 
            avgSatisfaction: avgSatisfaction.toFixed(1),
            sampleSize: typeData.length,
            topOils: topOils.slice(0, 3)
          };
        }
      });
  
      // Analyze by scalp type
      const scalpTypes = ['دهني', 'جاف', 'عادي'];
      scalpTypes.forEach(type => {
        const typeData = validData.filter(item => item.userData.scalp === type);
        if (typeData.length > 0) {
          const avgSatisfaction = typeData.reduce((sum, item) => sum + (item.review.satisfactionScore || 0), 0) / typeData.length;
          newInsights.scalpType[type] = { 
            avgSatisfaction: avgSatisfaction.toFixed(1),
            sampleSize: typeData.length
          };
        }
      });
  
      // Find most effective oils
      const oilEffectiveness = {};
      validData.forEach(item => {
        if (item.result?.blend) {
          item.result.blend.forEach(oil => {
            if (!oilEffectiveness[oil.name]) {
              oilEffectiveness[oil.name] = { totalScore: 0, count: 0 };
            }
            oilEffectiveness[oil.name].totalScore += item.review.satisfactionScore || 0;
            oilEffectiveness[oil.name].count += 1;
          });
        }
      });
  
      Object.keys(oilEffectiveness).forEach(oil => {
        if (oilEffectiveness[oil].count >= 3) { // Minimum 3 occurrences
          newInsights.mostEffectiveOils[oil] = {
            avgEffectiveness: (oilEffectiveness[oil].totalScore / oilEffectiveness[oil].count).toFixed(1),
            usageCount: oilEffectiveness[oil].count
          };
        }
      });
  
      // Find correlations
      const highSatisfactionData = validData.filter(item => (item.review.satisfactionScore || 0) >= 80);
      const lowSatisfactionData = validData.filter(item => (item.review.satisfactionScore || 0) <= 60);
  
      // Successful combinations
      highSatisfactionData.forEach(item => {
        if (item.result?.blend) {
          const oilNames = item.result.blend.map(o => o.name).sort();
          const combination = oilNames.join(' + ');
          
          const existing = newPatterns.successfulCombinations.find(c => c.combination === combination);
          if (existing) {
            existing.count += 1;
            existing.avgSatisfaction = ((existing.avgSatisfaction * (existing.count - 1)) + (item.review.satisfactionScore || 0)) / existing.count;
          } else {
            newPatterns.successfulCombinations.push({
              combination,
              count: 1,
              avgSatisfaction: item.review.satisfactionScore || 0
            });
          }
        }
      });
  
      // Unsuccessful combinations
      lowSatisfactionData.forEach(item => {
        if (item.result?.blend) {
          const oilNames = item.result.blend.map(o => o.name).sort();
          const combination = oilNames.join(' + ');
          
          const existing = newPatterns.unsuccessfulCombinations.find(c => c.combination === combination);
          if (existing) {
            existing.count += 1;
          } else {
            newPatterns.unsuccessfulCombinations.push({
              combination,
              count: 1
            });
          }
        }
      });
  
      // Sort and limit
      newPatterns.successfulCombinations.sort((a, b) => b.avgSatisfaction - a.avgSatisfaction);
      newPatterns.unsuccessfulCombinations.sort((a, b) => b.count - a.count);
      
      newPatterns.successfulCombinations = newPatterns.successfulCombinations.slice(0, 10);
      newPatterns.unsuccessfulCombinations = newPatterns.unsuccessfulCombinations.slice(0, 10);
  
      setInsights(newInsights);
      setPatterns(newPatterns);
  
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      alert('حدث خطأ أثناء تحليل الأنماط');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to find top oils for a category
  const findTopOilsForCategory = (data, category) => {
    const oilScores = {};
    
    data.forEach(item => {
      if (item.result?.blend) {
        item.result.blend.forEach(oil => {
          if (!oilScores[oil.name]) {
            oilScores[oil.name] = { totalScore: 0, count: 0 };
          }
          oilScores[oil.name].totalScore += item.review.satisfactionScore || 0;
          oilScores[oil.name].count += 1;
        });
      }
    });
  
    return Object.keys(oilScores)
      .filter(oil => oilScores[oil].count >= 2) // Minimum 2 occurrences
      .map(oil => ({
        name: oil,
        avgScore: oilScores[oil].totalScore / oilScores[oil].count,
        count: oilScores[oil].count
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  };
  


  return (
    <div className="ml-training-container">
      <h1>نظام التعلم الآلي لتطوير خلطات الزيوت</h1>
      
      <div className="stats-panel">
        <h2>إحصائيات البيانات</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalRecords}</span>
            <span className="stat-label">إجمالي التسجيلات</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.withReviews}</span>
            <span className="stat-label">تسجيلات بتقييمات</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.averageSatisfaction}</span>
            <span className="stat-label">متوسط الرضا</span>
          </div>
        </div>
      </div>
      
      <div className="actions-panel">
        <h2>الإجراءات</h2>
        <div className="action-buttons">
          <button onClick={loadTrainingData} className="btn btn-secondary">
            تحديث البيانات
          </button>
          <button 
            onClick={generateSyntheticData} 
            disabled={generatingData} 
            className="btn btn-secondary"
          >
            {generatingData ? generatingData : 'إنشاء بيانات اصطناعية'}
          </button>
          <button onClick={trainModel} disabled={isTraining} className="btn btn-primary">
            {isTraining ? `جاري التدريب... ${trainingProgress}%` : 'تدريب النموذج'}
          </button>
          <button onClick={loadModel} className="btn btn-secondary">
            تحميل النموذج
          </button>
          <button onClick={compareRecommendations} className="btn btn-primary">
            مقارنة التوصيات
          </button>
          <button onClick={analyzePatterns} disabled={isAnalyzing} className="btn btn-primary">
  {isAnalyzing ? 'جاري التحليل...' : 'تحليل الأنماط'}
</button>
        </div>
      </div>
      
      {trainingHistory && (
        <div className="training-results">
          <h2>نتائج التدريب</h2>
          <p>الخسارة النهائية: {trainingHistory.history.loss[trainingHistory.history.loss.length - 1].toFixed(4)}</p>
          <p>الدقة النهائية: {trainingHistory.history.acc[trainingHistory.history.acc.length - 1].toFixed(4)}</p>
        </div>
      )}

{insights && patterns && (
  <div className="insights-panel">
    <h2>الأنماط والاستنتاجات</h2>
    
    <div className="insight-categories">
      <button 
        className={`category-btn ${selectedInsightCategory === 'hairType' ? 'active' : ''}`}
        onClick={() => setSelectedInsightCategory('hairType')}
      >
        حسب نوع الشعر
      </button>
      <button 
        className={`category-btn ${selectedInsightCategory === 'scalpType' ? 'active' : ''}`}
        onClick={() => setSelectedInsightCategory('scalpType')}
      >
        حسب نوع الفروة
      </button>
      <button 
        className={`category-btn ${selectedInsightCategory === 'mostEffectiveOils' ? 'active' : ''}`}
        onClick={() => setSelectedInsightCategory('mostEffectiveOils')}
      >
        أفضل الزيوت
      </button>
      <button 
        className={`category-btn ${selectedInsightCategory === 'successfulCombinations' ? 'active' : ''}`}
        onClick={() => setSelectedInsightCategory('successfulCombinations')}
      >
        أفضل التركيبات
      </button>
    </div>

    <div className="insights-content">
      {selectedInsightCategory === 'hairType' && (
        <div className="insight-section">
          <h3>أداء الخلطات حسب نوع الشعر</h3>
          <div className="insight-grid">
            {Object.entries(insights.hairType).map(([type, data]) => (
              <div key={type} className="insight-item">
                <h4>{type}</h4>
                <p>متوسط الرضا: <strong>{data.avgSatisfaction}%</strong></p>
                <p>عدد العينات: {data.sampleSize}</p>
                {data.topOils.length > 0 && (
                  <div>
                    <p>أفضل الزيوت:</p>
                    <ul>
                      {data.topOils.map((oil, index) => (
                        <li key={index}>{oil.name} ({oil.avgScore.toFixed(1)}%)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedInsightCategory === 'scalpType' && (
        <div className="insight-section">
          <h3>أداء الخلطات حسب نوع الفروة</h3>
          <div className="insight-grid">
            {Object.entries(insights.scalpType).map(([type, data]) => (
              <div key={type} className="insight-item">
                <h4>{type}</h4>
                <p>متوسط الرضا: <strong>{data.avgSatisfaction}%</strong></p>
                <p>عدد العينات: {data.sampleSize}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedInsightCategory === 'mostEffectiveOils' && (
        <div className="insight-section">
          <h3>أكثر الزيوت فعالية</h3>
          <div className="oil-effectiveness">
            {Object.entries(insights.mostEffectiveOils)
              .sort(([,a], [,b]) => b.avgEffectiveness - a.avgEffectiveness)
              .map(([oil, data]) => (
                <div key={oil} className="oil-effectiveness-item">
                  <span className="oil-name">{oil}</span>
                  <div className="effectiveness-bar">
                    <div 
                      className="effectiveness-fill"
                      style={{ width: `${data.avgEffectiveness}%` }}
                    ></div>
                  </div>
                  <span className="effectiveness-score">{data.avgEffectiveness}%</span>
                  <span className="usage-count">({data.usageCount} استخدام)</span>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {selectedInsightCategory === 'successfulCombinations' && (
        <div className="insight-section">
          <h3>أفضل التركيبات الناجحة</h3>
          <div className="combinations-list">
            {patterns.successfulCombinations.map((combo, index) => (
              <div key={index} className="combination-item success">
                <div className="combination-name">{combo.combination}</div>
                <div className="combination-stats">
                  <span className="satisfaction">{combo.avgSatisfaction.toFixed(1)}% رضا</span>
                  <span className="count">{combo.count} مرات</span>
                </div>
              </div>
            ))}
          </div>

          <h3>التركيبات الأقل نجاحاً</h3>
          <div className="combinations-list">
            {patterns.unsuccessfulCombinations.map((combo, index) => (
              <div key={index} className="combination-item warning">
                <div className="combination-name">{combo.combination}</div>
                <div className="combination-stats">
                  <span className="count">{combo.count} مرات</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}
      
      {comparisonResults && (
        <div className="comparison-results">
          <h2>مقارنة بين التوصيات</h2>
          <div className="comparison-grid">
            {comparisonResults.map((result, index) => (
              <div key={index} className="comparison-item">
                <h3>طلب رقم: {result.orderId}</h3>
                <div className="satisfaction-comparison">
                  <div className="satisfaction-original">
                    <h4>الخلطة الأصلية</h4>
                    <p>رضا العملاء: {result.originalSatisfaction.toFixed(1)}%</p>
                    <div className="blend-composition">
                      {result.originalBlend.map((oil, idx) => (
                        <div key={idx} className="oil-item">
                          <span>{oil.name}</span>
                          <span>{oil.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="satisfaction-ml">
                    <h4>توصية التعلم الآلي</h4>
                    <p>رضا متوقع: {result.mlPredictedSatisfaction.toFixed(1)}%</p>
                    <div className="blend-composition">
                      {result.mlRecommendation.map((oil, idx) => (
                        <div key={idx} className="oil-item">
                          <span>{oil.name}</span>
                          <span>{oil.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MLTraining;