import React, { useState } from 'react';

const App = () => {
  const [quizData, setQuizData] = useState(null);

  const handleQuizComplete = (data) => {
    setQuizData(data);
  };

  
  return (
    
    <div className="App">
      {!quizData ? (
        <Quiz onQuizComplete={handleQuizComplete} />
      ) : (
        <>
          <Result blend={quizData.blend} />
          <OrderForm blend={quizData.blend} />
        </>
      )}
    </div>
  );
};

export default App;
