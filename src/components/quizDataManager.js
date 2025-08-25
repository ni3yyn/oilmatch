// utils/quizDataManager.js
export const quizDataManager = {
  storeQuizData: (userData, resultData) => {
    try {
      localStorage.setItem('quizUserData', JSON.stringify(userData));
      localStorage.setItem('quizResultData', JSON.stringify(resultData));
      return true;
    } catch (error) {
      console.error('Error storing quiz data:', error);
      return false;
    }
  },

  getQuizData: () => {
    try {
      const userData = localStorage.getItem('quizUserData');
      const resultData = localStorage.getItem('quizResultData');
      
      return {
        userData: userData ? JSON.parse(userData) : null,
        resultData: resultData ? JSON.parse(resultData) : null
      };
    } catch (error) {
      console.error('Error retrieving quiz data:', error);
      return { userData: null, resultData: null };
    }
  },

  clearQuizData: () => {
    try {
      localStorage.removeItem('quizUserData');
      localStorage.removeItem('quizResultData');
    } catch (error) {
      console.error('Error clearing quiz data:', error);
    }
  }
};