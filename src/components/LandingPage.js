import React from 'react';
import { motion } from 'framer-motion';
import Particles from 'react-tsparticles';
import logo from '../assets/logo.png';
import '../LandingPage.css';

function LandingPage({ onChooseMatcher, onChooseStore }) {
  return (
    <div className="landing-container">
      {/* ✅ خلفية متحركة */}
      <Particles
        options={{
          background: { color: { value: "transparent" } },
          particles: {
            color: { value: "#ccc" },
            move: { enable: true, speed: 1 },
            size: { value: 3 },
            opacity: { value: 0.2 },
          },
        }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* ✅ اللوجو مع تأثير الميل */}
      <motion.img
        src={logo}
        alt="Logo"
        className="logo"
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ duration: 0.5 }}
      />

      {/* ✅ العنوان */}
      <motion.h1
        className="label"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        مرحبا بك في متجرنا للزيوت الطبيعية
      </motion.h1>

      {/* ✅ النص الفرعي */}
      <motion.p
        className="lanbel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        كيفاش حاب تخير الزيت؟
      </motion.p>

      {/* ✅ الأزرار مع تتابع ظهور */}
      <motion.div
        className="landing-buttons"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
        }}
      >
        <motion.button
          variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255,255,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onChooseMatcher}
        >
          حاب الذكاء الاصطناعي يخيرلي
        </motion.button>
        <motion.button
          variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255,255,255,0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onChooseStore}
        >
          أنا نخير وش حبيت
        </motion.button>
      </motion.div>
    </div>
  );
}

export default LandingPage;
