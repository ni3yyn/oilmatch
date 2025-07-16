import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function OrderForm({ blend }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const orderData = {
      name,
      email,
      address,
      blend,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('❌ Failed to submit order. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="animate-fade-slide animate-delay-3" style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '10px' }}>Order Your Custom Oil</h3>

      {!submitted ? (
        <form className="order-form" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Shipping Address</label>
          <textarea
            required
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></textarea>

          <label>Your Custom Blend</label>
          <input type="text" value={blend} readOnly />

          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Sending...' : '✅ Place Order'}
          </button>
        </form>
      ) : (
        <p className="animate-fade-slide animate-delay-2" style={{ color: 'green', fontWeight: 'bold' }}>
          ✅ Order submitted! We’ll contact you soon.
        </p>
      )}
    </div>
  );
}

export default OrderForm;
