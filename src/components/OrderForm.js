import React, { useState } from 'react';

function OrderForm({ blend }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="animate-fade-slide animate-delay-3" style={{ marginTop: '30px' }}>
      <h3 style={{ marginBottom: '10px' }}>Order Your Custom Oil</h3>

      {!submitted ? (
        <form className="order-form"
          action="https://formspree.io/f/YOUR_FORM_ID"
          method="POST"
          onSubmit={() => setSubmitted(true)}
        >
          <label>Name</label>
          <input type="text" name="name" required />

          <label>Email</label>
          <input type="email" name="email" required />

          <label>Shipping Address</label>
          <textarea name="address" required rows="3"></textarea>

          <label>Your Custom Blend</label>
          <input type="text" name="blend" value={blend} readOnly />

          <button type="submit">✅ Place Order</button>
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
