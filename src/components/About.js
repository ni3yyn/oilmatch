import React from 'react';
import { Helmet } from 'react-helmet';
import '../Page.css';

const About = () => {
  return (
    <div className="page-container">
      <Helmet>
        <title>معلومات عنا - متجر الزيوت الطبيعية</title>
        <meta name="description" content="تعرف على متجرنا للزيوت الطبيعية ورسالتنا في تقديم أجود أنواع الزيوت العلاجية والعطرية" />
        <meta name="keywords" content="زيوت طبيعية, زيت عطري, علاج بالزيوت, متجر زيوت, زيت زيتون" />
      </Helmet>

      <h1>عن متجرنا للزيوت الطبيعية</h1>
      
      <div className="content-section">
        <h2>رسالتنا ورؤيتنا</h2>
        <p>
          مرحبًا بكم في متجر الزيوت الطبيعية، حيث نقدم لكم أجود أنواع الزيوت العلاجية والعطرية منذ عام 2025. نؤمن بقوة الطبيعة في تعزيز الصحة والرفاهية.
        </p>
        <p>
          نحرص على توفير زيوت نقية 100% خالية من الإضافات الكيميائية، مع شهادات جودة معتمدة لكل منتج نبيعه.
        </p>
      </div>

      <div className="content-section">
        <h2>لماذا تختارنا؟</h2>
        <ul className="features-list">
          <li>زيوت عضوية مستخلصة طبيعية</li>
          <li>أسعار تنافسية مع خصومات للكميات</li>     
          <li>فريق دعم فني متخصص للإجابة على استفساراتكم</li>
          
        </ul>
      </div>

      <div className="contact-info">
        <h2>تواصل معنا</h2>
        <p>البريد الإلكتروني: ni3yyn@gmail.com</p>
        <p>هاتف: +213792837483</p>
        <p>العنوان: تيبازة، الجزائر</p>
      </div>
    </div>
  );
};

export default About;