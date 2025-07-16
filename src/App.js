import React, { useState, useEffect, useRef } from 'react';
import Quiz from './components/Quiz';
import Result from './components/Result';
import OrderForm from './components/OrderForm';
import './App.css';

function App() {
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

export default App;
