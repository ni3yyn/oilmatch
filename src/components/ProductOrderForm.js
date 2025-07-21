// src/components/ProductOrderForm.js
import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import '../Store.css';

function ProductOrderForm({ productName, productPrice }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const totalPrice = productPrice * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) return alert('يرجى ملء جميع الحقول');

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        name,
        phone,
        address,
        note,
        status: 'pending',
        delivered: false,
        cart: [
          {
            name: productName,
            quantity,
            price: productPrice,
          },
        ],
        total: totalPrice,
        createdAt: new Date(),
      });
      alert('تم إرسال الطلب بنجاح!');
      setName('');
      setPhone('');
      setAddress('');
      setNote('');
      setQuantity(1);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('فشل في إرسال الطلب');
    }
    setSubmitting(false);
  };

  return (
    <form className="orderr" onSubmit={handleSubmit}>
      <h3>طلب المنتج</h3>
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

          <label>عنوان الشحن</label>
          <textarea
            required
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="الولاية، البلدية، الشارع، رقم المنزل"
          ></textarea>

          <label>الكمية</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
          />
      
      <p>الإجمالي: <strong>{totalPrice} دج</strong></p>
      <button type="submit" disabled={submitting}>
        {submitting ? '...يتم الإرسال' : 'إرسال الطلب'}
      </button>
    </form>
  );
}

export default ProductOrderForm;
