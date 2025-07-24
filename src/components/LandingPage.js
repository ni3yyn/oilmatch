import React from 'react';
import { motion } from 'framer-motion';
import '../LandingPage.css';
import logo from '../assets/logo.png';

function LandingPage({ onChooseMatcher, onChooseStore }) {
  return (
    <motion.div 
      className="landing-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Logo with delay */}
      <motion.img 
        src={logo} 
        alt="Logo" 
        className="logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.3, type: "spring" }}
      />

      {/* Title */}
      <motion.h1 
        className="label"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        مرحبا بك في متجرنا للزيوت الطبيعية
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        className="lanbel"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        كيفاش حاب تخير الزيت؟
      </motion.p>

      {/* Buttons */}
      <motion.div 
        className="landing-buttons"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onChooseMatcher}
        >
          حاب الذكاء الاصطناعي يخيرلي
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onChooseStore}
        >
          أنا نخير وش حبيت
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingPage;
