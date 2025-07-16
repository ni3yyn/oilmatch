import React, { useState } from 'react';

function Quiz({ onQuizComplete }) {
  const [step, setStep] = useState(1);
  const [scalp, setScalp] = useState('');
  const [balding, setBalding] = useState('');
  const [goal, setGoal] = useState('');
  const [error, setError] = useState('');

  const next = () => setStep((prev) => prev + 1);
  const prev = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    if (!scalp || !balding || !goal) {
      setError('Please complete all fields.');
      return;
    }

    let blend = [];

    if (scalp === 'dry') blend.push('Jojoba Oil');
    if (scalp === 'oily') blend.push('Pumpkin Seed Oil');
    if (scalp === 'sensitive') blend.push('Sweet Almond Oil');

    if (balding === 'crown') blend.push('Rosemary Oil');
    if (balding === 'temples') blend.push('Peppermint Oil');
    if (balding === 'diffuse') blend.push('Castor Oil');

    if (goal === 'regrowth') blend.push('Black Seed Oil');
    if (goal === 'thickness') blend.push('Argan Oil');
    if (goal === 'dandruff') blend.push('Tea Tree Oil');

    const finalBlend = blend.join(', ');

    onQuizComplete({
      scalp,
      balding,
      goal,
      blend: finalBlend,
    });
  };

  return (
    <div className="quiz-section">
      <h2 className="stagger-1">Hair Oil Match Quiz</h2>

      {step === 1 && (
        <div>
          <label className="stagger-1">What’s your scalp type?</label>
          <select
            className="stagger-2"
            value={scalp}
            onChange={(e) => setScalp(e.target.value)}
          >
            <option value="">Select</option>
            <option value="dry">Dry</option>
            <option value="oily">Oily</option>
            <option value="sensitive">Sensitive</option>
          </select>
          <button
            className="stagger-3"
            disabled={!scalp}
            onClick={next}
          >
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="stagger-1">Where is your hair thinning?</label>
          <select
            className="stagger-2"
            value={balding}
            onChange={(e) => setBalding(e.target.value)}
          >
            <option value="">Select</option>
            <option value="crown">Crown</option>
            <option value="temples">Temples</option>
            <option value="diffuse">All over (diffuse)</option>
          </select>
          <div className="stagger-3" style={{ marginTop: '20px' }}>
            <button onClick={prev}>← Back</button>
            <button disabled={!balding} onClick={next} style={{ float: 'right' }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="stagger-1">What’s your hair goal?</label>
          <select
            className="stagger-2"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            <option value="">Select</option>
            <option value="regrowth">Regrowth</option>
            <option value="thickness">Thicker Hair</option>
            <option value="dandruff">Remove Dandruff</option>
          </select>
          <div className="stagger-3" style={{ marginTop: '20px' }}>
            <button onClick={prev}>← Back</button>
            <button disabled={!goal} onClick={handleSubmit} style={{ float: 'right' }}>
              Show My Blend →
            </button>
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}

export default Quiz;
