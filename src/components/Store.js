import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ProductOrderForm from './ProductOrderForm';
import '../Store.css';
import { FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function Store({ onGoHome }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 8;

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
          // ✅ Remove duplicates using Set
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search filter
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

  return (
    <div className="store-wrapper">
      <div className="app-container glass">
        <button onClick={onGoHome} className="back-button">
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
              <h2 className="store-title"> المتجر</h2>
              <input
                type="text"
                placeholder="🔍 ابحث عن منتج..."
                className="search-bar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Skeleton Loader */}
              {loading ? (
                <div className="product-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="product-card skeleton"></div>
                  ))}
                </div>
              ) : (
                <div className="product-grid">
                  {filteredProducts.length === 0 ? (
                    <p className="empty-text">لا توجد منتجات مطابقة.</p>
                  ) : (
                    filteredProducts.map((product) => (
                      <motion.div
                        className="product-card glass"
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="product-img"
                          loading="lazy"
                        />
                        <div className="product-name-wrapper">
                          <div
                            className={`product-name-inner ${
                              product.name.length > 13 ? 'scroll' : ''
                            }`}
                          >
                            {product.name}
                          </div>
                        </div>
                        <p className="product-price">دج{product.price}</p> 
                        
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Load More */}
              {!loading && hasMore && (
                <button className="load-more-btn" onClick={() => fetchProducts(true)}>
                  {loadingMore ? 'جار التحميل...' : 'تحميل المزيد'}
                </button>
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

              {/* Slideshow */}
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
                  />
                </AnimatePresence>
                <button className="slide-btn" onClick={() => handleSlide('next')}>
                  ›
                </button>
              </div>

              {/* Details */}
              <h2 className="product-title">{selectedProduct.name}</h2>
              <p className="product-description">{selectedProduct.description}</p>
              <p className="product-price detail-price">{selectedProduct.price} دج</p>

              {/* Order form */}
              <ProductOrderForm
                productName={selectedProduct.name}
                productPrice={selectedProduct.price}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Store;
