import React, { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم إرسال الرسالة بنجاح!");
  };

  return (
    <div className="page-container glassy">
      <h1>اتصل بنا</h1>
      <form onSubmit={handleSubmit} className="contact-form">
        <input type="text" name="name" placeholder="الاسم" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} required />
        <textarea name="message" placeholder="رسالتك" value={formData.message} onChange={handleChange} required></textarea>
        <button type="submit">إرسال</button>
      </form>
    </div>
  );
}

export default Contact;
