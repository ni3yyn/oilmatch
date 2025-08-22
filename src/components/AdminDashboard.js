import React from 'react';
import { useAdminDashboard, BlendDisplay } from './AdminDashboardLogic';
import '../AdminDashboard.css';

function AdminDashboard() {
  const {
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
  } = useAdminDashboard();

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
        <h4>توزيع مسامية الشعر</h4>
        <div className="distribution-list">
          {analyticsData.porosityDistribution?.map(([porosity, count]) => (
            <div key={porosity} className="distribution-item">
              <span className="distribution-label">
                {porosity === 'منخفضة' && 'منخفضة 🔼'}
                {porosity === 'متوسطة' && 'متوسطة ⏸️'} 
                {porosity === 'عالية' && 'عالية 🔽'}
                {porosity === 'غير محدد' && 'غير محدد'}
              </span>
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

 {/* Effectiveness Tab */}
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

 {/* Seasonal Tab */}
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