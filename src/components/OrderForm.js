import React, { useState, useRef } from 'react';
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

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const wilayaRef = useRef(null);
  const deliveryTypeRef = useRef(null);
  const addressRef = useRef(null);
  const quantityRef = useRef(null);

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
      { name: 'wilaya', value: wilaya, ref: wilayaRef },
      { name: 'deliveryType', value: deliveryType, ref: deliveryTypeRef },
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

    const cartItem = blend
      ? { name: blend, price: productPrice, quantity }
      : { name: productName, quantity };

    const orderData = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      wilaya,
      deliveryType,
      cart: [cartItem],
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

  return (
    <motion.div className="order-form-wrapper">
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ccc' }}>قم بطلب تركيبتك الخاصة الآن</h2>

      <AnimatePresence>
        {!submitted ? (
          <motion.form className="order-form" onSubmit={handleSubmit}>
            
            {/* Inputs with shake & red border if error */}
            <motion.input
              ref={nameRef}
              type="text"
              placeholder="اسمك"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-input ${errorFields.includes('name') ? 'error' : ''}`}
              animate={errorFields.includes('name') ? shakeAnimation : {}}
            />

            <motion.input
              ref={phoneRef}
              type="tel"
              placeholder="رقم هاتفك"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`form-input ${errorFields.includes('phone') ? 'error' : ''}`}
              animate={errorFields.includes('phone') ? shakeAnimation : {}}
            />

            <motion.select
              ref={wilayaRef}
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className={`form-input ${errorFields.includes('wilaya') ? 'error' : ''}`}
              animate={errorFields.includes('wilaya') ? shakeAnimation : {}}
            >
              <option value="">حدد ولايتك</option>
              {wilayas.map((w, idx) => <option key={idx} value={w}>{w}</option>)}
            </motion.select>

            <motion.select
              ref={deliveryTypeRef}
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
              className={`form-input ${errorFields.includes('deliveryType') ? 'error' : ''}`}
              animate={errorFields.includes('deliveryType') ? shakeAnimation : {}}
            >
              <option value="">حدد نوع التوصيل</option>
              <option value="home">إلى منزلك</option>
              <option value="office">إلى مكتب التوصيل</option>
            </motion.select>

            <motion.textarea
              ref={addressRef}
              placeholder="عنوانك الكامل"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`form-input ${errorFields.includes('address') ? 'error' : ''}`}
              animate={errorFields.includes('address') ? shakeAnimation : {}}
            />

            <motion.input
              ref={quantityRef}
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className={`form-input ${errorFields.includes('quantity') ? 'error' : ''}`}
              animate={errorFields.includes('quantity') ? shakeAnimation : {}}
            />

            {/* Blend Container */}
            {/* Blend Container */}
{blend && (
  <motion.div >
    <p className='blendname' style={{
    
    padding: '10px',
    borderRadius: '50px',
    background: 'rgba(255, 255, 255, 0.3)',
    color: '#ccc',            // ✅ Text color applied
    fontWeight: '500',
    textAlign: 'center'
  }}>{blend}</p>
  </motion.div>
)}

{/* Price Container */}
{blend && (
  <motion.div style={{
    marginTop: '15px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.4)',
    color: '#ccc',            // ✅ Text color applied
    textAlign: 'right'
  }}>
    <p>السعر: {productPrice} × {quantity} = {productTotal} دج</p>
    <p>التوصيل: {deliveryFee} دج</p>
    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ccc' }}>
      المجموع الكلي: {finalTotal} دج
    </p>
  </motion.div>
)}

            {error && <p className="error-text">{error}</p>}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="submit-btn"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              <AnimatePresence>
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="loader"
                  />
                ) : (
                  <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    إرسال الطلب
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>
        ) : (
          <motion.p key="success" className="success-message"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: 'spring' }}>
            ✅ تم إرسال الطلب بنجاح! سنتواصل معك قريبًا.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default OrderForm;
