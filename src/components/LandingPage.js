// components/LandingPage.js
import React from 'react';
import '../LandingPage.css'; // style it as needed
import logo from '../assets/logo.png';


function LandingPage({ onChooseMatcher, onChooseStore }) {
  return (
    <div className="landing-container">
      <img src={logo} alt="Logo" className="logo" />
      <h1 className="label">مرحبا بك في متجرنا للزيوت الطبيعية</h1>
      <p className="lanbel">كيفاش حاب تخير الزيت؟</p>

      <div className="landing-buttons">
        <button onClick={onChooseMatcher} >
          حاب الذكاء الاصطناعي يخيرلي
        </button>
        <button onClick={onChooseStore} >
          أنا نخير وش حبيت
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
