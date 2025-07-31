import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Quiz from './components/Quiz';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Result from './components/Result';
import OrderForm from './components/OrderForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Store from './components/Store';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import OilGuide from './components/OilGuide';
import Blog from './components/Blog';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import ArticleDetail from './components/ArticleDetail';
import FloatingNav from './components/FloatingNav';
import { FaHome } from 'react-icons/fa';
import './App.css';

function App() {
  const [view, setView] = useState('landing');
  const [quizData, setQuizData] = useState(null);
  const resultRef = useRef(null);
  const location = useLocation();

  const handleQuizComplete = (data) => {
    setQuizData(data);
  };

  useEffect(() => {
    if (quizData && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [quizData]);

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  const renderMainContent = () => {
    if (view === 'matcher') {
      return (
        <div className="app-container">
          <Link to="/" className="back-button">
      <FaHome />
    </Link>
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6010052879824695" crossOrigin="anonymous"></script>
          {!quizData ? (
            <div className="fade-in">
              <Quiz onQuizComplete={handleQuizComplete} />
            </div>
          ) : (
            <div ref={resultRef} className="fade-in">
              <Result blend={quizData.blend} />
              <OrderForm blend={quizData.blend} />
            </div>
          )}
        </div>
      );
    }

    if (view === 'store') {
      return <Store />;
    }

    return (
      <LandingPage
        onChooseMatcher={() => setView('matcher')}
        onChooseStore={() => setView('store')}
      />
    );
  };

  return (
    <>
      {/* Only show FloatingNav if not on admin route */}
      {!isAdminRoute && <FloatingNav />}
      
      <Routes>
        <Route path="/" element={<div className="app-wrapper">{renderMainContent()}</div>} />
        <Route path="/quiz" element={
          <div className="app-container">
            {!quizData ? (
              <div className="fade-in">
                <Quiz onQuizComplete={handleQuizComplete} />
              </div>
            ) : (
              <div ref={resultRef} className="fade-in">
                <Result blend={quizData.blend} />
                <OrderForm blend={quizData.blend} />
              </div>
            )}
          </div>
        } />
        <Route path="/store" element={<Store />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/oil-guide" element={<OilGuide />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<ArticleDetail />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

// Wrap the App component with Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
      <Analytics />
      <SpeedInsights />
      <Footer />
    </Router>
  );
}