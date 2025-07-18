import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Quiz from './components/Quiz';
import Result from './components/Result';
import OrderForm from './components/OrderForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // 🆕 Import this
import bg from './background.jpg'; // if it's inside src/

import './App.css';

function HomePage() {
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

  return (
    <div className="app-wrapper">
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
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminLogin />} />
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
