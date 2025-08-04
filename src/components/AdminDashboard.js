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
          {blend.map((oil, idx) => (
            <div key={idx} className="blend-oil-item">
              <span>{oil.name}</span>
              <span>{oil.percentage}%</span>
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
  const [prodDesc, setProdDesc] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [articleImage, setArticleImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    deliveredOrders: 0,
    deliveredRevenue: 0,
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
            delivered: 0
          };
        }
        
        acc[monthYear].orders++;
        acc[monthYear].revenue += order.total || 0;
        if (order.delivered) acc[monthYear].delivered++;
        
        return acc;
      }, {});
      
      const productSales = {};
      ordersData.forEach(order => {
        order.cart?.forEach(item => {
          productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
        });
      });
      
      setAnalytics({
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum, order) => sum + (order.total || 0), 0),
        deliveredOrders: ordersData.filter(o => o.delivered).length,
        deliveredRevenue: ordersData.filter(o => o.delivered).reduce((sum, order) => sum + (order.total || 0), 0),
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
    };
  }, [products]);

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

      const productData = {
        name: prodName.trim(),
        price: Number(price),
        description: prodDesc.trim(),
        thumbnail: thumbnailUrl,
        images: uploadedImages,
        displayPrice: `دج ${price}` ,
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
    setProdDesc('');
    setThumbnailFile(null);
    setAdditionalImages([]);
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setPrice(product.price.toString());
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
                  <th>الهاتف</th>
                  <th>ملاحظة</th>
                  <th>تم التأكيد</th>
                  <th>تم التسليم</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders().map((order, index) => (
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
                        if (item.name.startsWith('[')) {
                          try {
                            const blend = JSON.parse(item.name);
                            return <BlendDisplay key={i} blend={blend} quantity={item.quantity} />;
                          } catch (e) {
                            return <div key={i}>{item.name} - {item.quantity}×{item.price} دج</div>;
                          }
                        }
                        return <div key={i}>{item.name} - {item.quantity}×{item.price} دج</div>;
                      })}
                    </td>
                    <td>{order.total} دج</td>
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
                ))}
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
                  <p className="admin-product-price">{product.price} دج</p>
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
                  <label className="admin-form-label">السعر *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="admin-form-input"
                    required
                  />
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