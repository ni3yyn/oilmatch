import { motion, AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';
import { FaPlus, FaHome, FaStore, FaQuestionCircle, FaEnvelope, FaBook, FaFileAlt, FaShieldAlt, FaBlog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../FloatingNav.css';

const FloatingNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    closed: {
      opacity: 0,
      y: 50,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  };

  const itemVariants = {
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 200
      }
    }),
    closed: { opacity: 0, x: 20 }
  };

  return (
    <div className="floating-nav-container">
      <motion.button 
        className="nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: isOpen ? 45 : 0,
          backgroundColor: isOpen ? 'rgba(94, 184, 98, 0.8)' : 'rgba(74, 144, 78, 0.7)'
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <FaPlus className="icon" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="nav-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={navVariants}
          >
            {[
              { icon: <FaHome />, text: 'Home', path: '/' },
              { icon: <FaStore />, text: 'Store', path: '/store' },
              { icon: <FaQuestionCircle />, text: 'Oil Matcher', path: '/quiz' },
              { icon: <FaBook />, text: 'Oil Guide', path: '/oil-guide' },
              { icon: <FaQuestionCircle />, text: 'About', path: '/about' },
              { icon: <FaEnvelope />, text: 'Contact', path: '/contact' },
              { icon: <FaFileAlt />, text: 'Privacy', path: '/privacy' },
              { icon: <FaShieldAlt />, text: 'Terms', path: '/terms' },
              { icon: <FaBlog />, text: 'Blog', path: '/blog' }
            ].map((item, i) => (
              <motion.div
                key={item.text}
                custom={i}
                variants={itemVariants}
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={item.path} 
                  className="nav-item"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.text}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingNav;