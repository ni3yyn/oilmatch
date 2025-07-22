import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import Quiz from './components/Quiz';
import Result from './components/Result';
import OrderForm from './components/OrderForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { FaHome } from 'react-icons/fa';
import LandingPage from './components/LandingPage';
import Store from './components/Store';

 
import './App.css';

function App() {
  const [view, setView] = useState('landing'); // 'matcher', 'store'
  const [quizData, setQuizData] = useState(null);
  const resultRef = useRef(null);

  const handleQuizComplete = (data) => {
    setQuizData(data);
  };

  useEffect(() => {
    if (quizData && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [quizData]);

  const renderMainContent = () => {
    if (view === 'matcher') {
      return (
        <div className="app-container">
          
          <button onClick={() => setView('landing')} className="back-button">
  <FaHome />
</button>


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
      return <Store onGoHome={() => setView('landing')} />;
    }
    
    

    return (
      <LandingPage
        onChooseMatcher={() => setView('matcher')}
        onChooseStore={() => setView('store')}
      />
    );
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<div className="app-wrapper">{renderMainContent()}</div>}
        />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/store" element={<Store />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
