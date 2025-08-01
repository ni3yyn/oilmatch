import React, { useState } from "react";



function Contact() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    message: "" 
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await fetch("https://formspree.io/f/xzbnbdnp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      } else {
        throw new Error("فشل في إرسال الرسالة، يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container glassy">
      <h1>اتصل بنا</h1>
      
      {submitted ? (
        <div className="success-message">
          <p>تم إرسال رسالتك بنجاح! سنتواصل معك قريبًا.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <input
            type="text"
            name="name"
            placeholder="الاسم"
            value={formData.name}
            onChange={handleChange}
            required
            aria-label="الاسم"
          />
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
            required
            aria-label="البريد الإلكتروني"
          />
          <textarea
            name="message"
            placeholder="رسالتك"
            value={formData.message}
            onChange={handleChange}
            required
            aria-label="رسالتك"
          ></textarea>
          
          {error && <p className="error-message">{error}</p>}
          
          <button type="submit">إرسال</button>
          
          
        </form>
      )}
    </div>
  );
}

export default Contact;