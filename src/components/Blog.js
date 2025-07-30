import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../Blog.css';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const articlesQuery = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
      const articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to Date object if it exists
        createdAt: doc.data().createdAt?.toDate()
      }));
      
      setArticles(articlesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Essential Oil Blog
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
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Essential Oil Blog</h1>
        <p className="blog-subtitle">Discover the latest insights and tips about essential oils and wellness</p>
      </motion.div>
      
      <div className="blog-posts">
        <AnimatePresence>
          {articles.length > 0 ? (
            articles.map((article) => (
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
                    <span className="post-date">
                      {article.createdAt?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <Link 
  to={`/blog/${article.id}`} 
  className="read-more-btn"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Read More
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
              <p>No articles found yet. Check back soon for new content!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Blog;