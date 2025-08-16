import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

function OrderForm({ productName, blend }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wilaya, setWilaya] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorFields, setErrorFields] = useState([]);
  const [error, setError] = useState('');
  const parsedBlend = typeof blend === 'string' ? JSON.parse(blend) : blend;

  // Custom select states
  const [isWilayaOpen, setIsWilayaOpen] = useState(false);
  const [isDeliveryTypeOpen, setIsDeliveryTypeOpen] = useState(false);
  const wilayaDropdownRef = useRef(null);
  const deliveryTypeDropdownRef = useRef(null);

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  const quantityRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wilayaDropdownRef.current && !wilayaDropdownRef.current.contains(event.target)) {
        setIsWilayaOpen(false);
      }
      if (deliveryTypeDropdownRef.current && !deliveryTypeDropdownRef.current.contains(event.target)) {
        setIsDeliveryTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const wilayas = [
    "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار",
    "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر",
    "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة",
    "قسنطينة", "المدية", "مستغانم", "المسيلة", "معسكر", "ورقلة", "وهران", "البيض",
    "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي",
    "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
    "غرداية", "غليزان", "تميمون", "برج باجي مختار", "أولاد جلال", "بني عباس",
    "إن صالح", "إن قزام", "تقرت", "جانت", "المغير", "المنيعة"
  ];

  const deliveryFees = {
    default: { home: 600, office: 400 },
    "أدرار": { home: 1400, office: 900 },
    "الشلف": { home: 750, office: 450 },
    "الأغواط": { home: 950, office: 600 },
    "أم البواقي": { home: 800, office: 450 },
    "باتنة": { home: 800, office: 450 },
    "بجاية": { home: 800, office: 450 },
    "بسكرة": { home: 950, office: 600 },
    "بشار": { home: 1100, office: 650 },
    "البليدة": { home: 750, office: 450 },
    "البويرة": { home: 750, office: 450 },
    "تمنراست": { home: 1600, office: 1050 },
    "تبسة": { home: 850, office: 450 },
    "تلمسان": { home: 850, office: 500 },
    "تيارت": { home: 800, office: 450 },
    "تيزي وزو": { home: 750, office: 450 },
    "الجزائر": { home: 500, office: 350 },
    "الجلفة": { home: 950, office: 600 },
    "جيجل": { home: 800, office: 450 },
    "سطيف": { home: 750, office: 450 },
    "سعيدة": { home: 800, office: null },
    "سكيكدة": { home: 800, office: 450 },
    "سيدي بلعباس": { home: 800, office: 450 },
    "عنابة": { home: 800, office: 450 },
    "قالمة": { home: 800, office: 450 },
    "قسنطينة": { home: 800, office: 450 },
    "المدية": { home: 750, office: 450 },
    "مستغانم": { home: 800, office: 450 },
    "المسيلة": { home: 850, office: 500 },
    "معسكر": { home: 800, office: 450 },
    "ورقلة": { home: 950, office: 600 },
    "وهران": { home: 800, office: 450 },
    "البيض": { home: 1100, office: 600 },
    "برج بوعريريج": { home: 750, office: 450 },
    "بومرداس": { home: 750, office: 450 },
    "الطارف": { home: 800, office: 450 },
    "تسمسيلت": { home: 800, office: null },
    "الوادي": { home: 950, office: 600 },
    "خنشلة": { home: 800, office: null },
    "سوق أهراس": { home: 800, office: 450 },
    "تيبازة": { home: 500, office: 300 },
    "ميلة": { home: 800, office: 450 },
    "عين الدفلى": { home: 750, office: 450 },
    "النعامة": { home: 1100, office: 600 },
    "عين تموشنت": { home: 800, office: 450 },
    "غرداية": { home: 950, office: 600 },
    "غليزان": { home: 800, office: 450 },
    "المغير": { home: 950, office: null },
    "المنيعة": { home: 1000, office: null },
    "أولاد جلال": { home: 950, office: 600 },
    "بني عباس": { home: 1000, office: null },
    "تيميمون": { home: 1400, office: null },
    "تقرت": { home: 950, office: 600 },
    "إن صالح": { home: 1600, office: null  },
    "إن قزام": { home: 1600, office: null },
  };

  const productPrice = blend ? 2500 : null;
  const productTotal = blend ? productPrice * quantity : null;

  const getDeliveryFee = () => {
    const fees = deliveryFees[wilaya] || deliveryFees.default;
    return deliveryType === 'home' ? fees.home : deliveryType === 'office' ? fees.office : 0;
  };

  const deliveryFee = getDeliveryFee();
  const finalTotal = productTotal !== null ? productTotal + deliveryFee : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorFields([]);

    const fields = [
      { name: 'name', value: name, ref: nameRef },
      { name: 'phone', value: phone, ref: phoneRef },
      { name: 'wilaya', value: wilaya, ref: wilayaDropdownRef },
      { name: 'deliveryType', value: deliveryType, ref: deliveryTypeDropdownRef },
      { name: 'address', value: address, ref: addressRef },
      { name: 'quantity', value: quantity, ref: quantityRef },
    ];

    const emptyFields = fields.filter(f => !f.value || f.value === '');
    if (emptyFields.length > 0) {
      setErrorFields(emptyFields.map(f => f.name));
      emptyFields[0].ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    const cartItem = parsedBlend
  ? { 
      name: "خلطة", // Simple name instead of JSON
      price: productPrice, 
      quantity,
      blend: parsedBlend // Store the blend array separately
    }
  : { name: productName, quantity };

    // In OrderForm.js, update the orderData creation:
const orderData = {
  name: name.trim(),
  phone: phone.trim(),
  address: address.trim(),
  wilaya,
  deliveryType,
  cart: [cartItem],
  blend: parsedBlend, // Store the parsed blend data
  total: finalTotal,
  confirmed: false,
  delivered: false,
  createdAt: Timestamp.now()
};

    try {
      await addDoc(collection(db, 'orders'), orderData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('⚠️ حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى.');
    }

    setLoading(false);
  };

  const shakeAnimation = { x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.4 } };

  // Custom Select Component
  const CustomSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    isOpen, 
    setIsOpen, 
    dropdownRef,
    error
  }) => {
    return (
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <motion.div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#B3B7B9',
            fontSize: '1rem',
            cursor: 'none',
            display: 'flex',
            marginBottom: '0.33rem',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          animate={error ? shakeAnimation : {}}
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
        >
          <span>{value || placeholder}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            style={{ display: 'inline-flex', marginRight: '0.5rem' }}
          >
            ▼
          </motion.span>
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(1.9px)',
                WebkitBackdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                zIndex: 10,
                overflow: 'hidden',
                maxHeight: '300px',
                overflowY: 'auto'
              }}
            >
              {options.map((option, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    color: value === option ? '#B3B7B9' : '#e6eaf0',
                    background: value === option ? 'e6eaf0' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {option}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    
      <motion.div 
        className="order-form-wrapper"
        style={{
          borderRadius: '12px',
        }}
      >
        <h2 className="talab"
        style={{ 
          textAlign: 'center', 
          alignContent: 'center',
          marginTop:'13px',
          marginBottom: '-20px',
          color: '#B3B7B9',
          fontSize: '1.5rem',
          fontWeight: '600'
    
        }}>
          !امتلك تركيبتك الآن
        </h2>
    
        <AnimatePresence>
          {!submitted ? (
            <motion.form 
              className="order-form" 
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <motion.input
                  ref={nameRef}
                  type="text"
                  placeholder="اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#B3B7B9',
                    fontSize: '1rem',
                    outline: 'none',
                    marginBottom: '0.33rem',
                    marginTop: '0.33rem',
                    transition: 'all 0.2s',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  animate={errorFields.includes('name') ? shakeAnimation : {}}
                />
    
                <motion.input
                  ref={phoneRef}
                  type="tel"
                  placeholder="رقم هاتفك"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#B3B7B9',
                    fontSize: '1rem',
                    outline: 'none',
                    marginBottom: '0.33rem',
                    transition: 'all 0.2s',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  animate={errorFields.includes('phone') ? shakeAnimation : {}}
                />
    
                <CustomSelect
                  options={wilayas}
                  value={wilaya}
                  onChange={(val) => setWilaya(val)}
                  placeholder="حدد ولايتك"
                  isOpen={isWilayaOpen}
                  setIsOpen={setIsWilayaOpen}
                  dropdownRef={wilayaDropdownRef}
                  error={errorFields.includes('wilaya')}
                />
    
                <CustomSelect
                  options={['إلى منزلك', 'إلى مكتب التوصيل']}
                  value={deliveryType === 'home' ? 'إلى منزلك' : deliveryType === 'office' ? 'إلى مكتب التوصيل' : ''}
                  onChange={(val) => setDeliveryType(val === 'إلى منزلك' ? 'home' : 'office')}
                  placeholder="حدد نوع التوصيل"
                  isOpen={isDeliveryTypeOpen}
                  setIsOpen={setIsDeliveryTypeOpen}
                  dropdownRef={deliveryTypeDropdownRef}
                  error={errorFields.includes('deliveryType')}
                />
    
                <motion.textarea
                  ref={addressRef}
                  placeholder="عنوانك الكامل"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#B3B7B9',
                    fontSize: '1rem',
                    outline: 'none',
                    marginBottom: '0.33rem',
                    marginTop: '0.1rem',
                    transition: 'all 0.2s',
                    minHeight: '100px',
                    resize: 'vertical',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  animate={errorFields.includes('address') ? shakeAnimation : {}}
                />
    
                <motion.div
                  ref={quantityRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.33rem',
                    marginTop: '0.1rem',
                  }}
                  animate={errorFields.includes('quantity') ? shakeAnimation : {}}
                >
                  <motion.button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#B3B7B9',
                      fontSize: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px'
                    }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    -
                  </motion.button>
                  
                  <motion.input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setQuantity(isNaN(value) ? 1 : Math.max(1, value));
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '50px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#B3B7B9',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      flex: 1,
                      maxWidth: '100px'
                    }}
                  />
                  
                  <motion.button
                    type="button"
                    onClick={() => setQuantity(prev => prev + 1)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '50px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#B3B7B9',
                      fontSize: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px'
                    }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    +
                  </motion.button>
                </motion.div>
              </div>
    
              {parsedBlend && (
                <motion.div 
                  style={{
                    marginTop: '0.25rem',
                    padding: '0.75rem',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <h4 style={{ marginBottom: '0.5rem', color: '#B3B7B9' }}>تركيبتك المخصصة</h4>
                  {parsedBlend.map((oil, index) => (
                    <p 
                      key={index} 
                      style={{
                        margin: '0.5rem',
                        color: '#B3B7B9',
                        fontWeight: '500',
                        fontSize: '1.1rem'
                      }}
                    >
                      {oil.name} - {oil.percentage}%
                    </p>
                  ))}
                </motion.div>
              )}
    
              {blend && (
                <motion.div 
                  style={{
                    padding: '1rem',
                    borderRadius: '30px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                    color: '#e5e7eb'
                  }}>
                    <span>السعر:</span>
                    <span>{productPrice} × {quantity} = {productTotal} دج</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.25rem',
                    color: '#e5e7eb'
                  }}>
                    <span>التوصيل:</span>
                    <span>{deliveryFee} دج</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8f9fa',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    <span>المجموع الكلي:</span>
                    <span>{finalTotal} دج</span>
                  </div>
                </motion.div>
              )}
    
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#fecaca',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    border: 'none'
                  }}
                >
                  {error}
                </motion.div>
              )}
    
              <motion.button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.875rem',
                  borderRadius: '50px',
                  backgroundColor: loading ? '#666' : 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  alignItems: 'center',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'none',
                  transition: 'all 0.2s',
                  marginTop: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                whileHover={{ scale: loading ? 1 : 1.03 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, rotate: 360 }}
                      exit={{ opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{
                        display: 'inline-block',
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        margin: '0 auto'
                      }}
                    />
                  ) : (
                    <motion.span 
                      key="text" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      إرسال الطلب
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{
                padding: '1.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '50px',
                textAlign: 'center',
                color: '#a7f3d0',
                fontSize: '1.1rem',
                border: 'none'
              }}
            >
              ✅ تم إرسال الطلب بنجاح! سنتواصل معك قريبًا.
              <a
                href="https://www.instagram.com/ni3yyn"
                target="_blank"
                rel="noopener noreferrer"
                className="instagram-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 2 .2 2.5.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.5.3 1.3.4 2.5.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 2-.4 2.5-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.5.2-1.3.3-2.5.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-2-.2-2.5-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.5-.3-1.3-.4-2.5C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-2 .4-2.5.2-.6.5-1 1-1.5s.9-.8 1.5-1c.5-.2 1.3-.3 2.5-.4C8.4 2.2 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3 0 7 .1 5.7.2 4.7.4 3.9.8c-.9.3-1.6.8-2.4 1.6C.7 3.2.3 3.9 0 4.8c-.4.8-.6 1.8-.7 3-.1 1.3-.1 1.7-.1 5s0 3.7.1 5c.1 1.2.3 2.2.7 3 .3.9.8 1.6 1.6 2.4.8.8 1.5 1.3 2.4 1.6.8.4 1.8.6 3 .7 1.3.1 1.7.1 5 .1s3.7 0 5-.1c1.2-.1 2.2-.3 3-.7.9-.3 1.6-.8 2.4-1.6.8-.8 1.3-1.5 1.6-2.4.4-.8.6-1.8.7-3 .1-1.3.1-1.7.1-5s0-3.7-.1-5c-.1-1.2-.3-2.2-.7-3-.3-.9-.8-1.6-1.6-2.4-.8-.8-1.5-1.3-2.4-1.6-.8-.4-1.8-.6-3-.7C15.7 0 15.3 0 12 0z"/>
                  <path d="M12 5.8A6.2 6.2 0 1 0 18.2 12 6.21 6.21 0 0 0 12 5.8zm0 10.2A4 4 0 1 1 16 12a4 4 0 0 1-4 4z"/>
                  <circle cx="18.4" cy="5.6" r="1.44"/>
                </svg>
                تابعنا على إنستغرام
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
    }

export default OrderForm;