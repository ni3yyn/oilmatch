import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { initAnalytics, trackPageView, trackEvent } from './analytics'; // Added trackEvent import
import Quiz from './components/Quiz';
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
import ArticleDetail from './components/ArticleDetail';
import FloatingNav from './components/FloatingNav';
import Footer from './components/Footer';
import { FaHome } from 'react-icons/fa';
import { useQuizLogic } from './components/QuizLogic';
import Review from './components/Review';
import MLTraining from './components/mltraining';
import './App.css';

function App() {
  const [view, setView] = useState('landing');
  const [quizData, setQuizData] = useState(null);
  const resultRef = useRef(null);
  const location = useLocation();

  // Initialize analytics and track page views
  useEffect(() => {
    initAnalytics();
    trackPageView(window.location.pathname);
    window.scrollTo(0, 0);
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  const handleQuizComplete = (data) => {
    setQuizData(data);
    trackEvent('Quiz', 'Completed', data.blend);
    
    // Store the orderId in localStorage or state for later use in OrderForm
    localStorage.setItem('quizOrderId', data.orderId);
  };

  useEffect(() => {
    if (quizData && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [quizData]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const renderMainContent = () => {
    if (view === 'matcher') {
      return (
        <div className="app-container">
          <Link to="/" className="back-button">
            <FaHome />
          </Link>
          <script 
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6010052879824695" 
            crossOrigin="anonymous"
          ></script>
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
        onChooseMatcher={() => {
          setView('matcher');
          trackEvent('Navigation', 'Click', 'Matcher Button');
        }}
        onChooseStore={() => {
          setView('store');
          trackEvent('Navigation', 'Click', 'Store Button');
        }}
      />
    );
  };

  return (
    <>
      {!isAdminRoute && <FloatingNav />}
      
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="app-wrapper">
              {renderMainContent()}
              <Analytics />
              <SpeedInsights />
            </div>
          } 
        />
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
            <Analytics />
            <SpeedInsights />
          </div>
        } />
        <Route path="/store" element={<><Store /><Analytics /><SpeedInsights /></>} />
        <Route path="/about" element={<><About /><Analytics /><SpeedInsights /></>} />
        <Route path="/contact" element={<><Contact /><Analytics /><SpeedInsights /></>} />
        <Route path="/privacy" element={<><Privacy /><Analytics /><SpeedInsights /></>} />
        <Route path="/terms" element={<><Terms /><Analytics /><SpeedInsights /></>} />
        <Route path="/oil-guide" element={<><OilGuide /><Analytics /><SpeedInsights /></>} />
        <Route path="/blog" element={<><Blog /><Analytics /><SpeedInsights /></>} />
        <Route path="/blog/:id" element={<><ArticleDetail /><Analytics /><SpeedInsights /></>} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/ml" element={ <> <MLTraining /> <Analytics /> <SpeedInsights /> </> } />
        <Route path="/review/:orderId" element={<Review />} />
        <Route path="/admin/dashboard" element={ <ProtectedRoute> <AdminDashboard /> </ProtectedRoute> } />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
      <Footer />
    </Router>
  );
}