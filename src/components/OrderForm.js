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

{deliveryType && wilaya && (
  <p>
    سعر التوصيل:{" "}
    {deliveryFee === null || deliveryFee === "التوصيل للمكتب غير متوفر حاليا"
      ? "التوصيل للمكتب غير متوفر في ولايتك"
      : `${deliveryFee} دج`}
  </p>
)}

          {finalTotal && (
            <p><strong>المجموع الكلي: {finalTotal} دج</strong></p>
          )}

          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

          <button
  type="submit"
  disabled={
    loading ||
    (deliveryType === 'office' &&
      (deliveryFees[wilaya]?.office === null ||
       deliveryFees[wilaya]?.office === 'غير متوفر'))
  }
>
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
