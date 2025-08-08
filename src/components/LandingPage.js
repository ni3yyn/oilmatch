import React from 'react';
import { motion } from 'framer-motion';
import '../LandingPage.css';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';



function LandingPage({ onChooseMatcher, onChooseStore }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      className="landing-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{
        padding: '2rem',
        maxWidth: '320px', // Optimal reading width
        margin: '0 auto', // Center the container
        textAlign: 'center', // Center all text
        border: '0.5px solid rgba(255, 255, 255, 0.3)',
        
      }}
    >
      {/* Logo with delay */}
      <motion.img 
  src={logo} 
  alt="Logo" 
  className="logo"
  style={{
    width: '250px',
    height: 'auto',
    overflow: 'visible',
    marginBottom: '-10px',
    marginTop: '-30px',
    // Add these for the glow effect
    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
    borderRadius: '50%', // Optional: if your logo is circular
    
  }}
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
/>

      {/* Title */}
      <motion.h1 
        className="label"
        style={{
          fontSize: '2rem', // 32px
          fontWeight: '600',
          lineHeight: '1.3',
          width: '100%',
          marginBottom: '1.5rem', // Space before subtitle
          color: '#b3b7b9' // Darker for better readability
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        مرحبا بك في متجرنا للزيوت الطبيعية
      </motion.h1>

      {/* Subtitle */}
      <motion.p 
        className="lanbel"
        style={{
          fontSize: '1.125rem', // 18px
          lineHeight: '1.6',
          marginBottom: '3rem', // More space before buttons (Fitts's Law)
          color: '#b3b7b9' // Slightly lighter than title
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        كيفاش حاب تخير الزيت؟
      </motion.p>

      {/* Buttons */}
      <motion.div 
        className="landing-buttons"
        style={{
          display: 'flex',
          flexDirection: 'column',
          
          
          margin: '0 auto' // Center buttons
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <motion.button 
          style={{
            padding: '0.9rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '400',
            borderRadius: '50px',
            cursor: 'none',
            width: '100%',
            transition: 'all 0.2s',
            border: '0.5px solid rgba(255, 255, 255, 0.3)'
          }}
          
          onClick={() => navigate('/quiz')}
        >
          حاب الذكاء الاصطناعي يخيرلي
        </motion.button>
        
        <motion.button 
          style={{
            padding: '0.9rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '400',
            borderRadius: '50px',
            cursor: 'none',
            width: '100%',
            transition: 'all 0.2s',
            border: '0.5px solid rgba(255, 255, 255, 0.3)'
          }}
          
          onClick={() => navigate('/store')}
        >
          أنا نخير وش حبيت
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default LandingPage;