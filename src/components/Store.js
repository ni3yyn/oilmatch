// src/components/Store.js
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProductOrderForm from './ProductOrderForm';
import '../Store.css';
import { FaHome } from 'react-icons/fa';


function Store({ onGoHome }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    });
    return unsub;
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

  return (
    <div className="store-wrapper">
      

      <div className="app-container glass">
      <button onClick={onGoHome} className="back-button">
  <FaHome />
</button>
        {!selectedProduct ? (
          <>
            <h2 className="store-title">🛍️ المتجر</h2>
            <input
              type="text"
              placeholder="🔍 ابحث عن منتج..."
              className="search-bar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <p className="empty-text">لا توجد منتجات مطابقة.</p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    className="product-card glass"
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.thumbnail}
                      alt={product.name}
                      className="product-img"
                    />
                  <div className="product-name-wrapper">
  <div
    className={`product-name-inner ${product.name.length > 13 ? 'scroll' : ''}`}
  >
    {product.name}
  </div>
</div>

                    <p className="product-price"> دج ,{product.price}</p>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="product-details glass">
            <button className="back-btn" onClick={goBack}>← رجوع</button>

            {/* Slideshow */}
            <div className="slideshow">
              <button className="slide-btn" onClick={() => handleSlide('prev')}>‹</button>
              <img
                src={selectedProduct.images?.[currentImageIndex] || selectedProduct.thumbnail}
                alt="product"
                className="product-slide-img"
              />
              <button className="slide-btn" onClick={() => handleSlide('next')}>›</button>
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

          </div>
        )}
      </div>
    </div>
  );
}

export default Store;
