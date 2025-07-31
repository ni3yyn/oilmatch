import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="footer-content">
        <div className="footer-section">
          <h3>روابط سريعة</h3>
          <ul>
            <li><Link to="/">الرئيسية</Link></li>
            <li><Link to="/store">المتجر</Link></li>
            <li><Link to="/quiz">اختبار الزيت المناسب</Link></li>
            <li><Link to="/oil-guide">دليل الزيوت</Link></li>
            <li><Link to="/blog">المدونة</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>روابط مهمة</h3>
          <ul>
            <li><Link to="/about">شكون أنا</Link></li>
            <li><Link to="/contact">تواصل معنا</Link></li>
            <li><Link to="/privacy">سياسة الخصوصية</Link></li>
            <li><Link to="/terms">شروط الإستخدام</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>اتصل بنا</h3>
          <ul className="contact-info">
            <li><FaPhone /> +2130792847564</li>
            <li><FaEnvelope /> ni3yyn@gmail.com</li>
            <li><FaMapMarkerAlt /> تيبازة، الجزائر</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>تابعنا</h3>
          <div className="social-icons">
            <a href="https://facebook.com/ni3yyn" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://instagram.com/xtra.takata" aria-label="Instagram"><FaInstagram /></a>
            
          </div>
          
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Oil Match. All rights reserved.</p>
      </div>
    </motion.footer>
  );
};

export default Footer;