// components/LandingPage.js
import React from 'react';
import '../LandingPage.css'; // style it as needed

function LandingPage({ onChooseMatcher, onChooseStore }) {
  return (
    <div className="landing-container">
      <h1 className="landing-title">🌿 Welcome to OilMatch</h1>
      <p className="landing-subtitle">Choose your experience:</p>

      <div className="landing-buttons">
        <button onClick={onChooseMatcher} className="landing-btn matcher">
          🔍 AI Oil Matcher
        </button>
        <button onClick={onChooseStore} className="landing-btn store">
          🛒 Browse Ready-Made Oils
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
