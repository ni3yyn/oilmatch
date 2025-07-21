import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../AdminLogin.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>🔐 دخول المشرف</h2>

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">🚀 دخول</button>

        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
}

export default AdminLogin;
