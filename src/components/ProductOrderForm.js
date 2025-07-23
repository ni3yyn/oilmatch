import React, { useState, useRef } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';

function ProductOrderForm({ productName, productPrice }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [quantity, setQuantity] = useState(1);
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

  // Example delivery fees table
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


  const productTotal = productPrice * quantity;

  const getDeliveryFee = () => {
    const fees = deliveryFees[wilaya] || deliveryFees.default;
    return deliveryType === 'home' ? fees.home : deliveryType === 'office' ? fees.office : 0;
  };

  const deliveryFee = getDeliveryFee();
  const finalTotal = deliveryFee !== null ? productTotal + deliveryFee : null;

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

    const orderData = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      wilaya,
      deliveryType,
      cart: [{
        name: productName,
        price: productPrice,
        quantity
      }],
      total: finalTotal,
      delivered: false,
      confirmed: false,
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
    <motion.div className="order-form-wrapper" style={{ marginTop: '30px' }}>
      {!submitted ? (
        <motion.form className="order-form" onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}> املأ بياناتك من هنا </h2>

          {/* الاسم */}
          <motion.input
            ref={nameRef}
            type="text"
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ border: errorFields.includes('name') ? '1px solid red' : '' }}
            animate={errorFields.includes('name') ? shakeAnimation : {}}
          />

          {/* الهاتف */}
          <motion.input
            ref={phoneRef}
            type="tel"
            placeholder="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ border: errorFields.includes('phone') ? '1px solid red' : '' }}
            animate={errorFields.includes('phone') ? shakeAnimation : {}}
          />

          {/* الولاية */}
          <motion.select
            ref={wilayaRef}
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
            style={{ border: errorFields.includes('wilaya') ? '1px solid red' : '' }}
            animate={errorFields.includes('wilaya') ? shakeAnimation : {}}
          >
            <option value="">اختر الولاية</option>
            {wilayas.map((w, idx) => (
              <option key={idx} value={w}>{w}</option>
            ))}
          </motion.select>

          {/* نوع التوصيل */}
          <motion.select
            ref={deliveryTypeRef}
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value)}
            style={{ border: errorFields.includes('deliveryType') ? '1px solid red' : '' }}
            animate={errorFields.includes('deliveryType') ? shakeAnimation : {}}
          >
            <option value="">اختر نوع التوصيل</option>
            <option value="home">إلى المنزل</option>
            <option value="office">إلى مكتب البريد</option>
          </motion.select>

          {/* العنوان */}
          <motion.textarea
            ref={addressRef}
            placeholder="عنوان الشحن"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ border: errorFields.includes('address') ? '1px solid red' : '' }}
            animate={errorFields.includes('address') ? shakeAnimation : {}}
          />

          {/* الكمية */}
          <motion.input
            ref={quantityRef}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            style={{ border: errorFields.includes('quantity') ? '1px solid red' : '' }}
            animate={errorFields.includes('quantity') ? shakeAnimation : {}}
          />

          {/* ✅ حاوية الأسعار */}
          <AnimatePresence>
            {(deliveryType && wilaya) && (
              <motion.div
                
                style={{
                  marginTop: '15px',
                padding: '10px',
                borderRadius: '50px',
                background: 'rgba(255, 255, 255, 0.3)',
                opacity: '1',
                textAlign: 'right'
                }}
              >
                <p>سعر المنتج: {productPrice} × {quantity} = <strong>{productTotal} دج</strong></p>
                <p>سعر التوصيل: <strong>{deliveryFee} دج</strong></p>
                {finalTotal && (
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ccc' }}>
                    المجموع الكلي: {finalTotal} دج
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

          <motion.button
  type="submit"
  disabled={loading}
  whileHover={{ scale: loading ? 1 : 1.05 }}
  whileTap={{ scale: loading ? 1 : 0.95 }}
  style={{
    marginTop: '20px',
    width: '100%',
    height: '50px',
    backdropFilter: 'blur(14px)',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#ccc',
    textAlign: 'center',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.4)',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: "'Tajawal', sans-serif",
    borderRadius: '50px',
    cursor: loading ? 'default' : 'none',
    transition: 'all 0.25s ease',
    boxShadow: `
      0 4px 8px rgba(0, 0, 0, 0.08),
      inset 0 0 0 rgba(255,255,255,0)
    `,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <AnimatePresence>
    {loading ? (
      <motion.div
        key="loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, rotate: 360 }}
        exit={{ opacity: 0 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: 'linear'
        }}
        style={{
          width: '24px',
          height: '24px',
          border: '3px solid rgba(255,255,255,0.6)',
          borderTopColor: 'transparent',
          borderRadius: '50%'
        }}
      />
    ) : (
      <motion.span
        key="text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        ✅ إرسال الطلب
      </motion.span>
    )}
  </AnimatePresence>
</motion.button>

        </motion.form>
      ) : (
        <motion.p
          key="success"
          style={{ color: 'green', fontWeight: 'bold', textAlign: 'center', marginTop: '20px' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          ✅ تم إرسال الطلب بنجاح! سنتواصل معك قريبًا.
        </motion.p>
      )}
    </motion.div>
  );
}

export default ProductOrderForm;
