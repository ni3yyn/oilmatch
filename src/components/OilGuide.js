import React from 'react';
import '../Page.css';

const OilGuide = () => {
  const oils = [
    { name: 'Lavender', uses: ['Relaxation', 'Sleep aid', 'Skin care'] },
    { name: 'Peppermint', uses: ['Headache relief', 'Digestion', 'Energy boost'] },
    { name: 'Tea Tree', uses: ['Antiseptic', 'Acne treatment', 'Cleaning'] }
  ];

  return (
    <div className="page-container">
      <h1>Essential Oil Usage Guide</h1>
      <p>Learn how to use different essential oils for your needs.</p>
      <div className="oil-grid">
        {oils.map((oil, index) => (
          <div key={index} className="oil-card">
            <h3>{oil.name}</h3>
            <ul>
              {oil.uses.map((use, i) => (
                <li key={i}>{use}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OilGuide;