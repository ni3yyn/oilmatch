import React, { useEffect, useState, useCallback, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../AdminDashboard.css';

// Custom hook for admin dashboard logic
export const useAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [prodName, setProdName] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState(0);
  const [prodDesc, setProdDesc] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [articleImage, setArticleImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resultData, setResultData] = useState([]);
  const [analyticsTab, setAnalyticsTab] = useState('overview');
  const navigate = useNavigate();

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
    deliveredRevenue: 0,
    discountRevenue: 0,
    discountOrders: 0,
    monthlyData: [],
    popularProducts: []
  });

  // Fetch all data
  useEffect(() => {
    const calculateAnalytics = (ordersData) => {
      const monthlyData = ordersData.reduce((acc, order) => {
        const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
        const monthYear = `${date.getMonth()+1}/${date.getFullYear()}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: date.toLocaleString('ar-EG', { month: 'long', year: 'numeric' }),
            orders: 0,
            revenue: 0,
            delivered: 0,
            discountAmount: 0
          };
        }
        
        acc[monthYear].orders++;
        acc[monthYear].revenue += order.total || 0;
        if (order.delivered) acc[monthYear].delivered++;
        
        // Calculate discount amounts
        order.cart?.forEach(item => {
          if (item.discount && item.discount > 0) {
            const discountAmount = item.price * item.quantity * (item.discount/100);
            acc[monthYear].discountAmount += discountAmount;
          }
        });
        
        return acc;
      }, {});
      
      const productSales = {};
      let totalDiscountRevenue = 0;
      let totalDiscountOrders = 0;
      
      ordersData.forEach(order => {
        let hasDiscount = false;
        order.cart?.forEach(item => {
          productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
          if (item.discount && item.discount > 0) {
            totalDiscountRevenue += (item.price * item.quantity * item.discount/100);
            hasDiscount = true;
          }
        });
        if (hasDiscount) totalDiscountOrders++;
      });
      
      setAnalytics({
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum, order) => sum + (order.total || 0), 0),
        deliveredOrders: ordersData.filter(o => o.delivered).length,
        deliveredRevenue: ordersData.filter(o => o.delivered).reduce((sum, order) => sum + (order.total || 0), 0),
        discountRevenue: totalDiscountRevenue,
        discountOrders: totalDiscountOrders,
        discountPercentage: (totalDiscountOrders / ordersData.length) * 100,
        monthlyData: Object.values(monthlyData).reverse(),
        popularProducts: products
          .map(p => ({ ...p, sales: productSales[p.id] || 0 }))
          .sort((a,b) => b.sales - a.sales)
          .slice(0, 5)
      });
    };

    const ordersUnsubscribe = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')), 
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersData);
        calculateAnalytics(ordersData);
      }
    );

    const resultDataUnsubscribe = onSnapshot(
      query(collection(db, 'resultdata'), orderBy('timestamp', 'desc')), 
      (snapshot) => {
        const resultData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setResultData(resultData);
      }
    );

    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const articlesUnsubscribe = onSnapshot(
      query(collection(db, 'articles'), orderBy('createdAt', 'desc')), 
      (snapshot) => {
        setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    return () => {
      ordersUnsubscribe();
      productsUnsubscribe();
      articlesUnsubscribe();
      resultDataUnsubscribe();
    };
  }, [products]);

  const getSeasonName = (season) => {
    const seasons = {
      winter: 'الشتاء',
      summer: 'الصيف', 
      spring: 'الربيع',
      autumn: 'الخريف'
    };
    return seasons[season] || season;
  };
  
  const getMonthName = (monthNumber) => {
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return months[monthNumber - 1] || monthNumber;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // Orders functions
  const handleCheckboxChange = async (id, field, currentValue = false) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { [field]: !currentValue });
    } catch (err) {
      console.error(`فشل التحديث لحقل ${field}:`, err);
    }
  };

  // Helper function to get season
  const getSeason = (month) => {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب؟')) {
      try {
        await deleteDoc(doc(db, 'orders', id));
      } catch (err) {
        console.error('فشل الحذف:', err);
        alert('حدث خطأ أثناء حذف الطلب');
      }
    }
  };
  
  // Function to delete all result data
  
  
  const parseBlendData = (blend) => {
    if (!blend) return [];
    
    try {
      // Case 1: Already an array
      if (Array.isArray(blend)) return blend;
      
      // Case 2: Stringified JSON
      if (typeof blend === 'string') {
        const parsed = JSON.parse(blend);
        return Array.isArray(parsed) ? parsed : [];
      }
      
      // Case 3: Other formats (unlikely)
      return [];
    } catch (e) {
      console.error('Failed to parse blend:', e, blend);
      return [];
    }
  };

  // Products functions
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !price) return alert('الرجاء ملء جميع الحقول المطلوبة');
  
    setUploading(true);
    try {
      let thumbnailUrl = editingProduct?.thumbnail || '';
      
      if (thumbnailFile) {
        const thumbForm = new FormData();
        thumbForm.append('file', thumbnailFile);
        thumbForm.append('upload_preset', 'product');
        thumbForm.append('quality', '50');
        
        const thumbRes = await axios.post(
          'https://api.cloudinary.com/v1_1/de122nwjr/image/upload',
          thumbForm
        );
        thumbnailUrl = thumbRes.data.secure_url;
      }

      const uploadedImages = [...(editingProduct?.images || [])];
      if (additionalImages.length > 0) {
        for (const file of additionalImages) {
          const imgForm = new FormData();
          imgForm.append('file', file);
          imgForm.append('upload_preset', 'product');
          imgForm.append('quality', '50');
          
          const res = await axios.post(
            'https://api.cloudinary.com/v1_1/de122nwjr/image/upload',
            imgForm
          );
          uploadedImages.push(res.data.secure_url);
        }
      }

      const discountedPrice = discount > 0 
        ? Math.round(Number(price) * (1 - discount/100))
        : Number(price);

      const productData = {
        name: prodName.trim(),
        price: Number(price),
        discount: Number(discount) || 0,
        discountedPrice,
        description: prodDesc.trim(),
        thumbnail: thumbnailUrl,
        images: uploadedImages,
        displayPrice: `${discountedPrice} دج`,
        originalPrice: Number(price),
        searchName: prodName.toLowerCase().trim(),
        updatedAt: new Date()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
      }

      resetProductForm();
      setShowProductModal(false);
    } catch (err) {
      console.error('فشل عملية المنتج', err);
      alert(editingProduct ? 'فشل تحديث المنتج' : 'فشل رفع المنتج');
    }
    setUploading(false);
  };

  const resetProductForm = () => {
    setProdName('');
    setPrice('');
    setDiscount(0);
    setProdDesc('');
    setThumbnailFile(null);
    setAdditionalImages([]);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setPrice(product.originalPrice?.toString() || product.price.toString());
    setDiscount(product.discount || 0);
    setProdDesc(product.description || '');
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        console.error('فشل الحذف:', err);
        alert('حدث خطأ أثناء حذف المنتج');
      }
    }
  };

  // Articles functions
  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleContent) return alert('الرجاء ملء جميع الحقول المطلوبة');

    setUploading(true);
    try {
      let imageUrl = editingArticle?.image || '';
      
      if (articleImage) {
        const imgForm = new FormData();
        imgForm.append('file', articleImage);
        imgForm.append('upload_preset', 'articles');
        const res = await axios.post(
          'https://api.cloudinary.com/v1_1/de122nwjr/image/upload',
          imgForm
        );
        imageUrl = res.data.secure_url;
      }

      const articleData = {
        title: articleTitle,
        content: articleContent,
        image: imageUrl,
        updatedAt: new Date()
      };

      if (editingArticle) {
        await updateDoc(doc(db, 'articles', editingArticle.id), articleData);
      } else {
        articleData.createdAt = new Date();
        await addDoc(collection(db, 'articles'), articleData);
      }

      resetArticleForm();
      setShowArticleModal(false);
    } catch (err) {
      console.error('فشل عملية المقال', err);
      alert(editingArticle ? 'فشل تحديث المقال' : 'حدث خطأ أثناء إضافة المقال');
    }
    setUploading(false);
  };

  const resetArticleForm = () => {
    setArticleTitle('');
    setArticleContent('');
    setArticleImage(null);
    setEditingArticle(null);
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setArticleTitle(article.title);
    setArticleContent(article.content);
    setShowArticleModal(true);
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المقال؟')) {
      try {
        await deleteDoc(doc(db, 'articles', id));
      } catch (err) {
        console.error('فشل الحذف:', err);
        alert('حدث خطأ أثناء حذف المقال');
      }
    }
  };

  // Add demographic cross analysis
  const demographicCrossAnalysis = {
    ageHairType: {},
    genderGoals: {},
    climateScalp: {},
    ageGoals: {}
  };

  resultData.forEach(result => {
    const age = result.userData?.ageGroup || 'غير محدد';
    const hairType = result.userData?.hairType || 'غير محدد';
    const gender = result.userData?.gender || 'غير محدد';
    const climate = result.userData?.climate || 'غير محدد';
    const scalp = result.userData?.scalp || 'غير محدد';
    
    // Age vs Hair Type
    const ageHairKey = `${age}||${hairType}`;
    demographicCrossAnalysis.ageHairType[ageHairKey] = (demographicCrossAnalysis.ageHairType[ageHairKey] || 0) + 1;
    
    // Gender vs Goals
    if (result.userData?.goals) {
      try {
        const goals = JSON.parse(result.userData.goals);
        goals.forEach(goal => {
          const genderGoalKey = `${gender}||${goal}`;
          demographicCrossAnalysis.genderGoals[genderGoalKey] = (demographicCrossAnalysis.genderGoals[genderGoalKey] || 0) + 1;
        });
      } catch (e) {}
    }
    
    // Climate vs Scalp
    const climateScalpKey = `${climate}||${scalp}`;
    demographicCrossAnalysis.climateScalp[climateScalpKey] = (demographicCrossAnalysis.climateScalp[climateScalpKey] || 0) + 1;
  });

  // Add oil effectiveness analysis
  const oilEffectiveness = {};

  resultData.forEach(result => {
    const blendData = parseBlendData(result.result?.blend);
    const confidence = result.result?.confidence || 50;
    
    if (blendData.length > 0) {
      blendData.forEach(oil => {
        if (!oilEffectiveness[oil.name]) {
          oilEffectiveness[oil.name] = {
            total: 0,
            sumConfidence: 0,
            averageConfidence: 0,
            count: 0
          };
        }
        
        oilEffectiveness[oil.name].count++;
        oilEffectiveness[oil.name].sumConfidence += confidence;
        oilEffectiveness[oil.name].averageConfidence = 
          oilEffectiveness[oil.name].sumConfidence / oilEffectiveness[oil.name].count;
      });
    }
  });

  // Convert to sorted array
  const sortedOilEffectiveness = Object.entries(oilEffectiveness)
    .map(([name, data]) => ({
      name,
      averageConfidence: Math.round(data.averageConfidence),
      count: data.count
    }))
    .sort((a, b) => b.averageConfidence - a.averageConfidence);

  // Add seasonal analysis
  const monthlyTrends = {};
  const seasonalOilPreferences = {
    winter: {},
    summer: {},
    spring: {},
    autumn: {}
  };

  resultData.forEach(result => {
    const timestamp = result.timestamp?.toDate ? result.timestamp.toDate() : new Date();
    const month = timestamp.getMonth();
    const season = getSeason(month);
    
    // Monthly trends
    const monthKey = `${timestamp.getMonth() + 1}/${timestamp.getFullYear()}`;
    monthlyTrends[monthKey] = (monthlyTrends[monthKey] || 0) + 1;
    
    // Seasonal oil preferences
    const blendData = parseBlendData(result.result?.blend);
    blendData.forEach(oil => {
      seasonalOilPreferences[season][oil.name] = (seasonalOilPreferences[season][oil.name] || 0) + 1;
    });
  });

  // Add problem-solution analysis
  const problemSolutions = {
    'قشرة': {},
    'فطريات': {},
    'تساقط': {},
    'دهني': {},
    'جاف': {},
    'عادي': {}
  };

  resultData.forEach(result => {
    const issues = result.userData?.issues;
    const hairFall = result.userData?.hairFall;
    const scalpType = result.userData?.scalp;
    const blendData = parseBlendData(result.result?.blend);
    
    if (!blendData.length) return;

    // Analyze based on specific issues
    if (issues && issues !== 'كلا') {
      blendData.forEach(oil => {
        problemSolutions[issues][oil.name] = (problemSolutions[issues][oil.name] || 0) + 1;
      });
    }
    
    // Analyze hair fall problems
    if (hairFall === 'نعم') {
      blendData.forEach(oil => {
        problemSolutions['تساقط'][oil.name] = (problemSolutions['تساقط'][oil.name] || 0) + 1;
      });
    }
    
    // Analyze scalp type solutions
    if (scalpType && problemSolutions[scalpType]) {
      blendData.forEach(oil => {
        problemSolutions[scalpType][oil.name] = (problemSolutions[scalpType][oil.name] || 0) + 1;
      });
    }
  });

  // Convert to sorted arrays for each problem
  const sortedProblemSolutions = {};
  Object.entries(problemSolutions).forEach(([problem, oils]) => {
    sortedProblemSolutions[problem] = Object.entries(oils)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  });

  // Calculate result analytics
  const calculateResultAnalytics = useCallback(() => {
    if (resultData.length === 0) return {};

    const porosityDistribution = {};

  resultData.forEach(result => {
    // Porosity distribution
    const porosity = result.userData?.porosity || 'غير محدد';
    porosityDistribution[porosity] = (porosityDistribution[porosity] || 0) + 1;
  });

    // Basic statistics
    const totalResults = resultData.length;
    const today = new Date();
    const lastWeekResults = resultData.filter(result => {
      const resultDate = result.timestamp?.toDate ? result.timestamp.toDate() : new Date();
      return (today - resultDate) <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    // Demographic analysis
    const ageDistribution = {};
    const genderDistribution = {};
    const hairTypeDistribution = {};
    const scalpTypeDistribution = {};

    // Goal analysis
    const goalDistribution = {};
    const climateDistribution = {};
    
    // Oil popularity
    const oilPopularity = {};
    const oilCombinations = {};

    resultData.forEach(result => {
      // Age distribution
      const age = result.userData?.ageGroup || 'غير محدد';
      ageDistribution[age] = (ageDistribution[age] || 0) + 1;

      // Gender distribution
      const gender = result.userData?.gender || 'غير محدد';
      genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;

      // Hair type distribution
      const hairType = result.userData?.hairType || 'غير محدد';
      hairTypeDistribution[hairType] = (hairTypeDistribution[hairType] || 0) + 1;

      // Scalp type distribution
      const scalp = result.userData?.scalp || 'غير محدد';
      scalpTypeDistribution[scalp] = (scalpTypeDistribution[scalp] || 0) + 1;

      // Goals distribution
      if (result.userData?.goals) {
        try {
          const goals = JSON.parse(result.userData.goals);
          goals.forEach(goal => {
            goalDistribution[goal] = (goalDistribution[goal] || 0) + 1;
          });
        } catch (e) {
          console.error('Error parsing goals:', e);
        }
      }

      // Climate distribution
      const climate = result.userData?.climate || 'غير محدد';
      climateDistribution[climate] = (climateDistribution[climate] || 0) + 1;

      const blendData = parseBlendData(result.result?.blend);
    
    if (blendData.length > 0) {
      // Count oil popularity
      blendData.forEach(oil => {
        oilPopularity[oil.name] = (oilPopularity[oil.name] || 0) + 1;
      });
      
      // Count UNIQUE combinations only once per blend
      const uniquePairs = new Set();
      
      for (let i = 0; i < blendData.length; i++) {
        for (let j = i + 1; j < blendData.length; j++) {
          if (blendData[i].name !== blendData[j].name) {
            const combination = [blendData[i].name, blendData[j].name].sort().join(' + ');
            uniquePairs.add(combination);
          }
        }
      }
      
      // Add each unique pair only once for this blend
      uniquePairs.forEach(combination => {
        oilCombinations[combination] = (oilCombinations[combination] || 0) + 1;
      });
    }
  });
    // Convert to arrays and sort
    const sortedOils = Object.entries(oilPopularity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    const sortedCombinations = Object.entries(oilCombinations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      totalResults,
      lastWeekResults,
      ageDistribution: Object.entries(ageDistribution).sort(([,a], [,b]) => b - a),
      genderDistribution: Object.entries(genderDistribution).sort(([,a], [,b]) => b - a),
      hairTypeDistribution: Object.entries(hairTypeDistribution).sort(([,a], [,b]) => b - a),
      scalpTypeDistribution: Object.entries(scalpTypeDistribution).sort(([,a], [,b]) => b - a),
      goalDistribution: Object.entries(goalDistribution).sort(([,a], [,b]) => b - a),
      climateDistribution: Object.entries(climateDistribution).sort(([,a], [,b]) => b - a),
      popularOils: sortedOils,
      popularCombinations: sortedCombinations,
      porosityDistribution: Object.entries(porosityDistribution).sort(([,a], [,b]) => b - a),
      averageConfidence: resultData.reduce((sum, result) => sum + (result.result?.confidence || 0), 0) / totalResults
    };
  }, [resultData]);

  const analyticsData = calculateResultAnalytics();

  // Filtering
  const filteredOrders = useCallback(() => {
    return orders.filter((order) => {
      const statusMatch = 
        filteredStatus === 'all' || 
        (filteredStatus === 'confirmed' && order.confirmed) || 
        (filteredStatus === 'delivered' && order.delivered);
      
      const searchMatch = 
        !searchTerm ||
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.includes(searchTerm) ||
        order.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return statusMatch && searchMatch;
    });
  }, [orders, filteredStatus, searchTerm]);

  // Return all state and functions needed by the UI
  return {
    activeTab,
    setActiveTab,
    orders,
    products,
    articles,
    filteredStatus,
    setFilteredStatus,
    showProductModal,
    setShowProductModal,
    showArticleModal,
    setShowArticleModal,
    editingProduct,
    editingArticle,
    prodName,
    setProdName,
    price,
    setPrice,
    discount,
    setDiscount,
    prodDesc,
    setProdDesc,
    articleTitle,
    setArticleTitle,
    articleContent,
    setArticleContent,
    thumbnailFile,
    setThumbnailFile,
    articleImage,
    setArticleImage,
    additionalImages,
    setAdditionalImages,
    uploading,
    searchTerm,
    setSearchTerm,
    resultData,
    analyticsTab,
    setAnalyticsTab,
    analytics,
    getSeasonName,
    getMonthName,
    handleLogout,
    handleCheckboxChange,
    handleDeleteOrder,

    parseBlendData,
    handleAddProduct,
    resetProductForm,
    handleEditProduct,
    handleDeleteProduct,
    handleAddArticle,
    resetArticleForm,
    handleEditArticle,
    handleDeleteArticle,
    demographicCrossAnalysis,
    sortedOilEffectiveness,
    monthlyTrends,
    seasonalOilPreferences,
    sortedProblemSolutions,
    analyticsData,
    filteredOrders,
    getSeason
  };
};

// Blend Display Component
export const BlendDisplay = ({ blend, quantity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeBlend = Array.isArray(blend) ? blend : [];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <span 
        className="blend-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {quantity}× خلطة زيوت ▼
      </span>
      
      {isOpen && (
        <div className="blend-popover">
          {safeBlend.map((oil, idx) => (
            <div key={idx} className="blend-oil-item">
              <span>{oil.name || 'زيت غير معروف'}</span>
              <span>{oil.percentage || 0}%</span>
            </div>
          ))}
          <div className="blend-quantity">الكمية: {quantity}</div>
        </div>
      )}
    </div>
  );
};
