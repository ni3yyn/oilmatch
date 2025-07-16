import React from 'react';

function Result({ blend }) {
  return (
    <div className="fade-in delay-1" style={{ backgroundColor: '#e3f7e6', padding: '15px', marginTop: '20px', borderRadius: '10px' }}>
      <h3>Your Recommended Blend</h3>
      <p style={{ fontWeight: 'bold' }}>{blend}</p>
      <p style={{ fontSize: '14px', color: '#444' }}>
        This blend is tailored to your scalp, hair pattern, and goals.
      </p>
    </div>
  );
}

export default Result;
