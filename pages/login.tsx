import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/reports');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Image 
              src="/logo.png" 
              alt="MarvelQuant Logo" 
              width={80} 
              height={80}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            MarvelQuant
          </h1>
          <p style={{ 
            margin: 0, 
            color: '#94a3b8', 
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontWeight: '600'
          }}>
            Reporting System
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: 'rgba(0, 212, 255, 0.05)', 
          borderRadius: '8px', 
          border: '1px solid rgba(0, 212, 255, 0.2)',
          textAlign: 'center' 
        }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Default Credentials</p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#e3f2fd' }}><strong style={{ color: '#00d4ff' }}>Username:</strong> admin</p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#e3f2fd' }}><strong style={{ color: '#00d4ff' }}>Password:</strong> admin123</p>
          <p style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
            (Change password after first login)
          </p>
        </div>
      </div>
    </div>
  );
}