import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ProductOrderForm from './ProductOrderForm';
import '../Store.css';
import { FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function Store({ onGoHome }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [zoomImage, setZoomImage] = useState(null);
  const navigate = useNavigate();

  const PAGE_SIZE = 8;
  const skeletonItems = Array(PAGE_SIZE).fill(null);

  const fetchProducts = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
  
      const productsRef = collection(db, 'products');
      let q = query(productsRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
  
      if (isLoadMore && lastDoc) {
        q = query(productsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
        setLoadingMore(true);
      }
  
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const newProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        setProducts(prev => {
          const allProducts = [...prev, ...newProducts];
          const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values());
          return uniqueProducts;
        });
  
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const goBack = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const handleSlide = (direction) => {
    if (!selectedProduct?.images) return;
    const totalImages = selectedProduct.images.length;
    setCurrentImageIndex((prevIndex) => {
      if (direction === 'next') {
        return (prevIndex + 1) % totalImages;
      } else {
        return (prevIndex - 1 + totalImages) % totalImages;
      }
    });
  };

  const handleImageClick = () => {
    setZoomImage(
      selectedProduct.images?.[currentImageIndex] || selectedProduct.thumbnail
    );
  };

  const closeZoom = (e) => {
    if (e.target === e.currentTarget) {
      setZoomImage(null);
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    return Math.round(price * (1 - discount / 100));
  };

  return (
    <div className="store-wrapper">
      <div className="app-container glass">
        <button onClick={() => navigate('/')} className="back-button">
          <FaHome />
        </button>

        <AnimatePresence mode="wait">
          {!selectedProduct ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="store-title">المتجر</h2>
              <input
                type="text"
                placeholder="🔍 ابحث عن منتج..."
                className="search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {loading ? (
                <div className="product-grid">
                  {skeletonItems.map((_, index) => (
                    <motion.div
                      key={`skeleton-${index}`}
                      className="product-card skeleton"
                      initial={{ opacity: 0.5, y: 20 }}
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        y: 0,
                        transition: { 
                          repeat: Infinity, 
                          duration: 1.8,
                          delay: index * 0.08,
                          ease: "easeInOut"
                        } 
                      }}
                    >
                      <div className="skeleton-img"></div>
                      <div className="skeleton-info">
                        <div className="skeleton-title"></div>
                        <div className="skeleton-price"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="product-grid">
          {filteredProducts.map((product) => (
            <motion.div
              className="product-card glass"
              key={product.id}
              onClick={() => handleProductClick(product)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {product.discount > 0 && (
                <div className="discount-badge">
                  -{product.discount}%
                </div>
              )}
              <img
                src={product.thumbnail}
                alt={product.name}
                className="product-img"
                loading="lazy"
              />
              <div className="product-info">
                <div className="product-name-wrapper">
                  <div className={`product-name-inner ${product.name.length > 13 ? 'scroll' : ''}`}>
                    {product.name}
                  </div>
                </div>
                <div className="product-price-wrapper">
                  {product.discount > 0 ? (
                    <>
                      <span className="original-price">{product.price} دج</span>
                      <span className="discounted-price">
                        {Math.round(product.price * (1 - product.discount/100))} دج
                      </span>
                    </>
                  ) : (
                    <span className="product-price">{product.price} دج</span>
                  )}
                </div>
              </div>
            </motion.div>
                      ))}                            
                </div>
              )}

              {!loading && hasMore && (
                <motion.button 
                  className="load-more-btn" 
                  onClick={() => fetchProducts(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loadingMore ? (
                    <>
                      <span className="loading-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </span>
                      جار التحميل
                    </>
                  ) : 'تحميل المزيد'}
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="details"
              className="product-details glass"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <button className="back-btn" onClick={goBack}>
                ← رجوع
              </button>

              <div className="slideshow">
                <button className="slide-btn" onClick={() => handleSlide('prev')}>
                  ‹
                </button>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={
                      selectedProduct.images?.[currentImageIndex] ||
                      selectedProduct.thumbnail
                    }
                    alt="product"
                    className="product-slide-img"
                    loading="lazy"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleImageClick}
                  />
                </AnimatePresence>
                <button className="slide-btn" onClick={() => handleSlide('next')}>
                  ›
                </button>
              </div>

              <h2 className="product-title">{selectedProduct.name}</h2>
              <p className="product-description">{selectedProduct.description}</p>
              
              <div className="product-pricing-detail">
                {selectedProduct.discount > 0 ? (
                  <>
                    <div className="price-with-discount">
                      <span className="original-price">{selectedProduct.price} دج</span>
                      <span className="discounted-price">
                        {calculateDiscountedPrice(selectedProduct.price, selectedProduct.discount)} دج
                      </span>
                    </div>
                    <div className="discount-badge-detail">
                      وفر {selectedProduct.discount}%
                    </div>
                  </>
                ) : (
                  <span className="product-price">{selectedProduct.price} دج</span>
                )}
              </div>

              <ProductOrderForm
                productName={selectedProduct.name}
                productPrice={
                  selectedProduct.discount > 0
                    ? calculateDiscountedPrice(selectedProduct.price, selectedProduct.discount)
                    : selectedProduct.price
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {zoomImage && (
            <motion.div
              className="image-zoom-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeZoom}
            >
              <motion.img
                src={zoomImage}
                alt="Zoomed product"
                className="zoomed-image"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                className="close-zoom-btn" 
                onClick={() => setZoomImage(null)}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Store;