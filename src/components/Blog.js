import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import '../Blog.css';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const articlesQuery = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setArticles(articlesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container" dir="rtl">
        <Helmet>
          <title>المدونة - متجر الزيوت الطبيعية</title>
          <meta name="description" content="أحدث المقالات والنصائح حول الزيوت الطبيعية واستخداماتها العلاجية" />
        </Helmet>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          مدونة الزيوت الطبيعية
        </motion.h1>
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="page-container" dir="rtl">
      <Helmet>
        <title>المدونة - متجر الزيوت الطبيعية</title>
        <meta name="description" content="أحدث المقالات والنصائح حول الزيوت الطبيعية واستخداماتها العلاجية" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>مدونة الزيوت الطبيعية</h1>
        <p className="blog-subtitle">اكتشف أحدث المقالات والنصائح حول استخدامات الزيوت الطبيعية للصحة والجمال</p>
        
        <motion.div 
          className="search-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="text"
            placeholder="ابحث في المقالات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </motion.div>
      </motion.div>
      
      <div className="blog-posts">
        <AnimatePresence>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <motion.article
                key={article.id}
                className="blog-post glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                layout
              >
                {article.image && (
                  <motion.div 
                    className="post-image-container"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={article.image} 
                      alt={article.title} 
                      className="post-image"
                      loading="lazy"
                    />
                  </motion.div>
                )}
                <div className="post-content">
                  <motion.h2 
                    className="post-title"
                    whileHover={{ color: '#4CAF50' }}
                    transition={{ duration: 0.2 }}
                  >
                    {article.title}
                  </motion.h2>
                  
                  <motion.div 
                    className="post-excerpt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {article.content.length > 150 ? 
                      `${article.content.substring(0, 150)}...` : 
                      article.content}
                  </motion.div>
                  
                  <div className="post-footer">
                    <div className="post-date">
                      <span>
                        {article.createdAt?.toLocaleDateString('ar-DZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <FaCalendarAlt className="date-icon" />
                    </div>
                    <Link 
                      to={`/blog/${article.id}`} 
                      className="read-more-btn"
                    >
                      اقرأ المزيد
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p>لا توجد مقالات متاحة حالياً. يرجى المحاولة لاحقاً!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Blog;