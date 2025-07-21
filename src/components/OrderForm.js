// src/components/OrderForm.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function OrderForm({ productName, blend }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wilaya, setWilaya] = useState('');
  const [deliveryType, setDeliveryType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    "الجزائر": { home: 500, office: 300 },
    "وهران": { home: 550, office: 350 },
    "سطيف": { home: 500, office: 300 },
    // Add more specific cases if needed
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
    setLoading(true);
    setError('');

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

  return (
    <div className="animate-fade-slide animate-delay-3" style={{ marginTop: '30px' }}>
      {!submitted ? (
        <form className="order-form" onSubmit={handleSubmit}>
          <label>الاسم</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>رقم الهاتف</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            pattern="[0-9+() -]{6,}"
          />

          <label>الولاية</label>
          <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} required>
            <option value="">اختر الولاية</option>
            {wilayas.map((w, idx) => (
              <option key={idx} value={w}>{w}</option>
            ))}
          </select>

          <label>نوع التوصيل</label>
          <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} required>
            <option value="">اختر نوع التوصيل</option>
            <option value="home">إلى المنزل</option>
            <option value="office">إلى مكتب البريد</option>
          </select>

          <label>عنوان الشحن</label>
          <textarea
            required
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="البلدية، الشارع، رقم المنزل"
          ></textarea>

          <label>الكمية</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
          />

          {blend ? (
            <>
              <label>التركيبة المختارة</label>
              <input type="text" value={blend} readOnly />
              <p>سعر المنتج: 2500 دج × {quantity} = {productTotal} دج</p>
            </>
          ) : (
            <>
              <label>المنتج المطلوب</label>
              <input type="text" value={productName} readOnly />
            </>
          )}

          {deliveryFee > 0 && (
            <p>سعر التوصيل: {deliveryFee} دج</p>
          )}

          {finalTotal && (
            <p><strong>المجموع الكلي: {finalTotal} دج</strong></p>
          )}

          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? '⏳ جاري الإرسال...' : '✅ تأكيد الطلب'}
          </button>
        </form>
      ) : (
        <p dir="rtl" className="animate-fade-slide" style={{ color: 'green', fontWeight: 'bold' }}>
          ✅ تم إرسال الطلب بنجاح! سنتواصل معك قريبًا.
        </p>
      )}
    </div>
  );
}

export default OrderForm;
