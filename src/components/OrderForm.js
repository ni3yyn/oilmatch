import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function OrderForm({ blend }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const orderData = {
      name,
      phone,
      address,
      blend,
      createdAt: Timestamp.now(),
      confirmed: false,
      delivered: false
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('اياه صرات غلطة');
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
        placeholder=""
      />

      <label>عنوان الشحن</label>
      <textarea
        required
        rows="3"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="الولاية، البلدية، الشارع (الحي)، رقم المنزل"
        
      ></textarea>

      <label>تركيبتك الخاصة</label>
      <input type="text" value={blend} readOnly />

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? '⏳ جاري الإرسال...' : '✅ تأكيد الطلب'}
      </button>
    </form>
  ) : (
    <p dir="rtl" className="animate-fade-slide animate-delay-2" style={{ color: 'green', fontWeight: 'bold' }}>
      ✅ تم إرسال الطلب! سنقوم بالتواصل معك قريباً.
    </p>
  )}
</div>
  );
}

export default OrderForm;
