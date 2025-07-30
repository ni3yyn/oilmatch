import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams(); // This extracts HKSmXtBI434hyrvtrQu5 from the URL
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const docRef = doc(db, 'articles', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setArticle({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate()
          });
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!article) {
    return (
      <div className="error-message">
        Article not found
        <Link to="/blog">Back to Blog</Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="article-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <article className="article-content">
        {article.image && (
          <img 
            src={article.image} 
            alt={article.title}
            className="article-image"
          />
        )}
        <h1>{article.title}</h1>
        <div className="article-meta">
          <span className="date">
            {article.createdAt?.toLocaleDateString()}
          </span>
        </div>
        <div className="article-body">
          {article.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
      <Link to="/blog" className="back-button">← Back to Blog</Link>
    </motion.div>
  );
};

export default ArticleDetail;