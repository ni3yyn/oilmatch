import React from 'react';

function Result({ blend }) {
  const descriptions = {
    "Jojoba Oil": "🟡 Deeply hydrates dry scalp and balances sebum.",
    "Pumpkin Seed Oil": "🎃 Regulates oiliness and supports hair density.",
    "Sweet Almond Oil": "🌸 Soothes sensitive skin and adds shine.",
    "Rosemary Oil": "🌿 Stimulates blood circulation in the crown area.",
    "Peppermint Oil": "❄️ Boosts temples' hair follicles and refreshes the scalp.",
    "Castor Oil": "💧 Strengthens all-over thinning and prevents breakage.",
    "Black Seed Oil": "🖤 Legendary regrowth booster with anti-inflammatory power.",
    "Argan Oil": "✨ Adds volume, thickness, and silky texture.",
    "Tea Tree Oil": "🌱 Fights dandruff and unclogs hair follicles.",
  };

  const blendArray = blend.split(',').map(o => o.trim());

  return (
    <div className="animate-fade-slide animate-delay-2" style={{ marginTop: '30px' }}>
      <h3>Your Personalized Oil Blend</h3>
      <p className="animate-fade-slide animate-delay-2" style={{ fontStyle: 'italic', color: '#555', marginBottom: '10px' }}>
        Based on your answers, we’ve crafted this powerful blend:
      </p>

      <ul className="animate-fade-slide animate-delay-2" style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {blendArray.map((oil, index) => (
          <li className="animate-fade-slide animate-delay-2" key={index} style={{ marginBottom: '8px', fontSize: '15px' }}>
            <strong>{oil}</strong>: {descriptions[oil] || "—"}
          </li>
        ))}
      </ul>

      <p className="animate-fade-slide animate-delay-2" style={{ marginTop: '20px', color: '#444' }}>
        This blend will be freshly prepared and sent directly to your address once you complete the order below.
      </p>
    </div>
  );
}

export default Result;
