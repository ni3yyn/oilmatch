import React, { useEffect, useState, useCallback, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../AdminDashboard.css';

// Blend Display Component
const BlendDisplay = ({ blend, quantity }) => {
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

function AdminDashboard() {
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
  const [analyticsTab, setAnalyticsTab] = useState('overview'); // 'overview', 'demographics', 'oils'
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

  // Create targeted products for specific problems
const problemSpecificBlends = {
  'قشرة': ['زيت النيم', 'زيت شجرة الشاي', 'زيت الجوجوبا'],
  'تساقط': ['زيت بذور اليقطين', 'زيت إكليل الجبل', 'زيت الخروع'],
  'دهني': ['زيت الجوجوبا', 'زيت بذور العنب', 'زيت النعناع']
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

  // Add this to your analytics calculation
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
// Replace the problemSolutions code with this:
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
  // Add these functions before your return statement
const calculateResultAnalytics = useCallback(() => {
  if (resultData.length === 0) return {};

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
  
  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>لوحة التحكم</h2>
        <button className="admin-logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'admin-tab-active' : ''}`} 
          onClick={() => setActiveTab('orders')}
        >
          الطلبات
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'admin-tab-active' : ''}`} 
          onClick={() => setActiveTab('products')}
        >
          المنتجات
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'articles' ? 'admin-tab-active' : ''}`} 
          onClick={() => setActiveTab('articles')}
        >
          المقالات
        </button>
        <button 
  className={`admin-tab-btn ${activeTab === 'analytics' ? 'admin-tab-active' : ''}`} 
  onClick={() => setActiveTab('analytics')}
>
  تحليلات النتائج
</button>
      </div>

      {/* Analytics Section */}
      <div className="admin-analytics-section">
        <h3>التحليلات والإحصائيات</h3>
        
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-value">{analytics.totalOrders}</div>
            <div className="admin-stat-label">إجمالي الطلبات</div>
          </div>
          
          <div className="admin-stat-card">
            <div className="admin-stat-value">{analytics.deliveredOrders}</div>
            <div className="admin-stat-label">طلبات مسلمة</div>
          </div>
          
          <div className="admin-stat-card revenue">
            <div className="admin-stat-value">
              {analytics.totalRevenue.toLocaleString('ar-DZ')} دج
            </div>
            <div className="admin-stat-label">إجمالي الإيرادات</div>
          </div>
          
          <div className="admin-stat-card revenue">
            <div className="admin-stat-value">
              {analytics.deliveredRevenue.toLocaleString('ar-DZ')} دج
            </div>
            <div className="admin-stat-label">إيرادات مسلمة</div>
          </div>

          <div className="admin-stat-card discount">
            <div className="admin-stat-value">
              {analytics.discountRevenue.toLocaleString('ar-DZ')} دج
            </div>
            <div className="admin-stat-label">إجمالي الخصومات</div>
          </div>

          <div className="admin-stat-card discount">
            <div className="admin-stat-value">
              {Math.round(analytics.discountPercentage || 0)}%
            </div>
            <div className="admin-stat-label">نسبة الطلبات المخفضة</div>
          </div>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-tab-content">
          <div className="admin-controls">
            <div className="admin-filter-btns">
              <button 
                className={`admin-filter-btn ${filteredStatus === 'all' ? 'admin-filter-active' : ''}`} 
                onClick={() => setFilteredStatus('all')}
              >
                الكل
              </button>
              <button 
                className={`admin-filter-btn ${filteredStatus === 'confirmed' ? 'admin-filter-active' : ''}`} 
                onClick={() => setFilteredStatus('confirmed')}
              >
                مؤكدة
              </button>
              <button 
                className={`admin-filter-btn ${filteredStatus === 'delivered' ? 'admin-filter-active' : ''}`} 
                onClick={() => setFilteredStatus('delivered')}
              >
                مسلمة
              </button>
            </div>

            <div className="admin-search">
              <input 
                type="text" 
                placeholder="ابحث في الطلبات..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-order-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>وقت الطلب</th>
                  <th>الاسم</th>
                  <th>العنوان</th>
                  <th>الولاية</th>
                  <th>طريقة التوصيل</th>
                  <th>المنتجات</th>
                  <th>المجموع</th>
                  <th>الخصم</th>
                  <th>الهاتف</th>
                  <th>ملاحظة</th>
                  <th>تم التأكيد</th>
                  <th>تم التسليم</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders().map((order, index) => {
                  const orderDiscount = order.cart?.reduce((sum, item) => {
                    return sum + (item.discount ? (item.price * item.quantity * item.discount/100) : 0);
                  }, 0) || 0;
                  
                  return (
                    <tr key={order.id} className={order.delivered ? 'admin-delivered-row' : ''}>
                      <td>{orders.length - index}</td>
                      <td>
                        {order.createdAt?.toDate ? 
                          new Date(order.createdAt.toDate()).toLocaleString('ar-DZ', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          }) : 
                          '---'
                        }
                      </td>
                      <td>{order.name}</td>
                      <td>{order.address}</td>
                      <td>{order.wilaya || '---'}</td>
                      <td>
                        {order.deliveryType === 'home' && 'المنزل'}
                        {order.deliveryType === 'office' && 'مكتب البريد'}
                        {!order.deliveryType && '---'}
                      </td>
                    
<td className="admin-products-cell">
  {order.cart?.map((item, i) => {
    // Handle custom blend case
    if (item.blend) {
      return <BlendDisplay key={i} blend={item.blend} quantity={item.quantity} />;
    }
    
    // Handle regular product case
    const productName = typeof item.name === 'string' ? item.name : 'منتج غير معروف';
    return (
      <div key={i}>
        {productName} - {item.quantity}×
        {item.discount > 0 ? (
          <>
            <span className="original-price">{item.price} دج</span>
            <span className="discounted-price">
              {Math.round(item.price * (1 - item.discount/100))} دج
            </span>
            <span className="discount-badge">-{item.discount}%</span>
          </>
        ) : (
          <span>{item.price} دج</span>
        )}
      </div>
    );
  })}
</td>
                      <td>{order.total} دج</td>
                      <td className={orderDiscount > 0 ? 'discount-cell' : ''}>
                        {orderDiscount > 0 ? `-${orderDiscount.toLocaleString('ar-DZ')} دج` : '---'}
                      </td>
                      <td>{order.phone}</td>
                      <td>{order.note || '---'}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!order.confirmed}
                          onChange={() => handleCheckboxChange(order.id, 'confirmed', order.confirmed)}
                          className="admin-checkbox"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={!!order.delivered}
                          onChange={() => handleCheckboxChange(order.id, 'delivered', order.delivered)}
                          className="admin-checkbox"
                        />
                      </td>
                      <td>
                        <button 
                          className="admin-delete-btn" 
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="admin-tab-content">
          <div className="admin-grid-controls">
            <button 
              className="admin-add-btn"
              onClick={() => {
                resetProductForm();
                setShowProductModal(true);
              }}
            >
              إضافة منتج
            </button>
          </div>

          <div className="admin-products-grid">
            {products.map(product => (
              <div key={product.id} className="admin-product-card">
                <div className="admin-product-image-container">
                  {product.discount > 0 && (
                    <div className="admin-discount-badge">-{product.discount}%</div>
                  )}
                  <img 
                    src={product.thumbnail} 
                    alt={product.name} 
                    className="admin-product-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150?text=لا+توجد+صورة';
                    }}
                  />
                </div>
                <div className="admin-product-info">
                  <h3 className="admin-product-title">{product.name}</h3>
                  <div className="admin-product-pricing">
                    {product.discount > 0 ? (
                      <>
                        <span className="original-price">{product.originalPrice || product.price} دج</span>
                        <span className="discounted-price">
                          {product.discountedPrice || Math.round(product.price * (1 - product.discount/100))} دج
                        </span>
                      </>
                    ) : (
                      <span className="product-price">{product.price} دج</span>
                    )}
                  </div>
                  <p className="admin-product-desc">
                    {product.description?.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description}
                  </p>
                  <div className="admin-product-actions">
                    <button 
                      className="admin-edit-btn"
                      onClick={() => handleEditProduct(product)}
                    >
                      تعديل
                    </button>
                    <button 
                      className="admin-delete-btn"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showProductModal && (
            <div className="admin-modal-overlay">
              <form className="admin-modal-form" onSubmit={handleAddProduct}>
                <h3>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">اسم المنتج *</label>
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">السعر الأصلي *</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="admin-form-input"
                  />
                  {discount > 0 && (
                    <div className="price-preview">
                      السعر بعد الخصم: {Math.round(Number(price) * (1 - discount/100))} دج
                    </div>
                  )}
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">الوصف</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="admin-form-textarea"
                    rows="3"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {editingProduct ? 'صورة جديدة (اختياري)' : 'صورة المنتج *'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    className="admin-form-file"
                    required={!editingProduct}
                  />
                  {editingProduct?.thumbnail && !thumbnailFile && (
                    <div className="admin-current-image">
                      <p>الصورة الحالية:</p>
                      <img 
                        src={editingProduct.thumbnail} 
                        alt="الصورة الحالية" 
                        className="admin-thumbnail-preview"
                      />
                    </div>
                  )}
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">صور إضافية (اختياري)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setAdditionalImages(Array.from(e.target.files))}
                    className="admin-form-file"
                  />
                  {editingProduct?.images?.length > 0 && additionalImages.length === 0 && (
                    <div className="admin-current-images">
                      <p>الصور الحالية ({editingProduct.images.length}):</p>
                      <div className="admin-images-preview">
                        {editingProduct.images.map((img, index) => (
                          <img 
                            key={index} 
                            src={img} 
                            alt={`صورة المنتج ${index + 1}`} 
                            className="admin-image-preview"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="admin-form-actions">
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="admin-submit-btn"
                  >
                    {uploading ? 'جاري المعالجة...' : (editingProduct ? 'تحديث المنتج' : 'إضافة المنتج')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowProductModal(false);
                      resetProductForm();
                    }}
                    className="admin-cancel-btn"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
{activeTab === 'analytics' && (
  <div className="admin-tab-content">
    <div className="admin-analytics-header">
      <h3>تحليلات نتائج اختبار الزيوت</h3>
      <div className="admin-analytics-stats">
        <div className="admin-analytics-stat">
          <span className="stat-number">{analyticsData.totalResults || 0}</span>
          <span className="stat-label">إجمالي النتائج</span>
        </div>
        <div className="admin-analytics-stat">
          <span className="stat-number">{analyticsData.lastWeekResults || 0}</span>
          <span className="stat-label">نتائج هذا الأسبوع</span>
        </div>
        <div className="admin-analytics-stat">
          <span className="stat-number">{Math.round(analyticsData.averageConfidence || 0)}%</span>
          <span className="stat-label">متوسط الثقة</span>
        </div>
      </div>
    </div>

    // Add more tabs to your analytics interface
<div className="admin-analytics-tabs">
  <button className={`analytics-tab-btn ${analyticsTab === 'overview' ? 'analytics-tab-active' : ''}`} onClick={() => setAnalyticsTab('overview')}>
    نظرة عامة
  </button>
  <button className={`analytics-tab-btn ${analyticsTab === 'demographics' ? 'analytics-tab-active' : ''}`} onClick={() => setAnalyticsTab('demographics')}>
    الديموغرافيا
  </button>
  <button className={`analytics-tab-btn ${analyticsTab === 'oils' ? 'analytics-tab-active' : ''}`} onClick={() => setAnalyticsTab('oils')}>
    تحليل الزيوت
  </button>
  <button className={`analytics-tab-btn ${analyticsTab === 'effectiveness' ? 'analytics-tab-active' : ''}`} onClick={() => setAnalyticsTab('effectiveness')}>
    فعالية الزيوت
  </button>
  <button className={`analytics-tab-btn ${analyticsTab === 'seasonal' ? 'analytics-tab-active' : ''}`} onClick={() => setAnalyticsTab('seasonal')}>
    trends موسمية
  </button>
  <button className={`analytics-tab-btn ${analyticsTab === 'problems' ? 'analytics-tab-active' : ''}`} onClick={() => setAnalyticsTab('problems')}>
    حلول المشاكل
  </button>
</div>

    {/* Overview Tab */}
    {analyticsTab === 'overview' && (
      <div className="analytics-tab-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>توزيع الأهداف</h4>
            <div className="distribution-list">
              {analyticsData.goalDistribution?.map(([goal, count]) => (
                <div key={goal} className="distribution-item">
                  <span className="distribution-label">{goal}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>توزيع المناخ</h4>
            <div className="distribution-list">
              {analyticsData.climateDistribution?.map(([climate, count]) => (
                <div key={climate} className="distribution-item">
                  <span className="distribution-label">{climate}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
{analyticsTab === 'problems' && (
  <div className="analytics-tab-content">
    <div className="analytics-grid">
      {Object.entries(sortedProblemSolutions).map(([problem, solutions]) => (
        solutions.length > 0 && (
          <div key={problem} className="analytics-card">
            <h4>
              {problem === 'قشرة' && '🔴 حلول القشرة'}
              {problem === 'فطريات' && '🟠 حلول الفطريات'}
              {problem === 'تساقط' && '💪 حلول التساقط'}
              {problem === 'دهني' && '✨ حلول الفروة الدهنية'}
              {problem === 'جاف' && '💧 حلول الفروة الجافة'}
              {problem === 'عادي' && '🌿 عناية الفروة العادية'}
            </h4>
            <div className="distribution-list">
              {solutions.map(([oil, count]) => (
                <div key={oil} className="distribution-item">
                  <span className="distribution-label">{oil}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / Math.max(...solutions.map(([,c]) => c))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            {solutions.length === 0 && (
              <p className="no-data-message">لا توجد بيانات كافية بعد</p>
            )}
          </div>
        )
      ))}
    </div>
  </div>
)}
    {/* Demographics Tab */}
    {analyticsTab === 'demographics' && (
      <div className="analytics-tab-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>توزيع الفئات العمرية</h4>
            <div className="distribution-list">
              {analyticsData.ageDistribution?.map(([age, count]) => (
                <div key={age} className="distribution-item">
                  <span className="distribution-label">{age}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>توزيع الجنس</h4>
            <div className="distribution-list">
              {analyticsData.genderDistribution?.map(([gender, count]) => (
                <div key={gender} className="distribution-item">
                  <span className="distribution-label">{gender}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>توزيع أنواع الشعر</h4>
            <div className="distribution-list">
              {analyticsData.hairTypeDistribution?.map(([hairType, count]) => (
                <div key={hairType} className="distribution-item">
                  <span className="distribution-label">{hairType}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>توزيع أنواع الفروة</h4>
            <div className="distribution-list">
              {analyticsData.scalpTypeDistribution?.map(([scalp, count]) => (
                <div key={scalp} className="distribution-item">
                  <span className="distribution-label">{scalp}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

// Effectiveness Tab
{analyticsTab === 'effectiveness' && (
  <div className="analytics-tab-content">
    <div className="analytics-card">
      <h4>فعالية الزيوت بناءً على ثقة النظام</h4>
      <div className="distribution-list">
        {sortedOilEffectiveness.slice(0, 10).map((oil, index) => (
          <div key={oil.name} className="distribution-item">
            <span className="distribution-label">{oil.name}</span>
            <span className="distribution-value">{oil.averageConfidence}%</span>
            <div className="distribution-bar">
              <div 
                className="distribution-bar-fill effectiveness-bar"
                style={{ width: `${oil.averageConfidence}%` }}
              ></div>
            </div>
            <span className="distribution-count">({oil.count} مرة)</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

// Seasonal Tab
{analyticsTab === 'seasonal' && (
  <div className="analytics-tab-content">
    <div className="analytics-grid">
      {['winter', 'summer', 'spring', 'autumn'].map(season => (
        <div key={season} className="analytics-card">
          <h4>الزيوت المفضلة في {getSeasonName(season)}</h4>
          <div className="distribution-list">
            {Object.entries(seasonalOilPreferences[season] || {})
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([oil, count]) => (
                <div key={oil} className="distribution-item">
                  <span className="distribution-label">{oil}</span>
                  <span className="distribution-value">{count}</span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    {/* Oils Tab */}
    {analyticsTab === 'oils' && (
      <div className="analytics-tab-content">
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>الزيوت الأكثر شيوعاً</h4>
            <div className="distribution-list">
              {analyticsData.popularOils?.map(([oil, count]) => (
                <div key={oil} className="distribution-item">
                  <span className="distribution-label">{oil}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h4>أفضل التركيبات</h4>
            <div className="distribution-list">
              {analyticsData.popularCombinations?.map(([combination, count]) => (
                <div key={combination} className="distribution-item">
                  <span className="distribution-label">{combination}</span>
                  <span className="distribution-value">{count}</span>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-bar-fill"
                      style={{ 
                        width: `${(count / analyticsData.totalResults) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Data Export */}
    <div className="analytics-export">
      <button 
        className="export-btn"
        onClick={() => {
          const dataStr = JSON.stringify(resultData, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'oil_results_data.json';
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
        }}
      >
        تصدير البيانات الخام
      </button>
    </div>
  </div>
)}

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <div className="admin-tab-content">
          <div className="admin-grid-controls">
            <button 
              className="admin-add-btn"
              onClick={() => {
                resetArticleForm();
                setShowArticleModal(true);
              }}
            >
              إضافة مقال
            </button>
          </div>

          <div className="admin-articles-list">
            {articles.map(article => (
              <div key={article.id} className="admin-article-card">
                {article.image && (
                  <div className="admin-article-image">
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="admin-article-img"
                    />
                  </div>
                )}
                <div className="admin-article-content">
                  <h3 className="admin-article-title">{article.title}</h3>
                  <p className="admin-article-date">
                    {new Date(article.createdAt?.seconds * 1000).toLocaleDateString('ar-DZ')}
                    {article.updatedAt && ` (تم التحديث: ${new Date(article.updatedAt?.seconds * 1000).toLocaleDateString('ar-DZ')})`}
                  </p>
                  <p className="admin-article-preview">
                    {article.content.length > 150 
                      ? `${article.content.substring(0, 150)}...` 
                      : article.content}
                  </p>
                  <div className="admin-article-actions">
                    <button 
                      className="admin-edit-btn"
                      onClick={() => handleEditArticle(article)}
                    >
                      تعديل
                    </button>
                    <button 
                      className="admin-delete-btn"
                      onClick={() => handleDeleteArticle(article.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showArticleModal && (
            <div className="admin-modal-overlay">
              <form className="admin-modal-form" onSubmit={handleAddArticle}>
                <h3>{editingArticle ? 'تعديل المقال' : 'إضافة مقال جديد'}</h3>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">العنوان *</label>
                  <input
                    type="text"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    className="admin-form-input"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">المحتوى *</label>
                  <textarea
                    value={articleContent}
                    onChange={(e) => setArticleContent(e.target.value)}
                    className="admin-form-textarea"
                    rows="6"
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    {editingArticle ? 'صورة جديدة (اختياري)' : 'صورة المقال (اختياري)'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArticleImage(e.target.files[0])}
                    className="admin-form-file"
                  />
                  {editingArticle?.image && !articleImage && (
                    <div className="admin-current-image">
                      <p>الصورة الحالية:</p>
                      <img 
                        src={editingArticle.image} 
                        alt="الصورة الحالية" 
                        className="admin-thumbnail-preview"
                      />
                    </div>
                  )}
                </div>
                
                <div className="admin-form-actions">
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="admin-submit-btn"
                  >
                    {uploading ? 'جاري المعالجة...' : (editingArticle ? 'تحديث المقال' : 'نشر المقال')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowArticleModal(false);
                      resetArticleForm();
                    }}
                    className="admin-cancel-btn"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;