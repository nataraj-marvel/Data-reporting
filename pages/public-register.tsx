// pages/public-register.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

/**
 * Public user registration page – no authentication required.
 * Uses the `/api/users/public-create` endpoint to create a new user.
 */
export default function PublicRegister() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('programmer'); // optional, defaults to programmer
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await fetch('/api/users/public-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    full_name: fullName,
                    email,
                    role,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('User created successfully! Redirecting to login…');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setError(data.error || 'Failed to create user');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Register – Nautilus Reporting</title>
                <meta
                    name="description"
                    content="Create a new account for the Nautilus Reporting system without needing to log in first."
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="container">
                <div className="card">
                    <h1>Register New Account</h1>
                    <form onSubmit={handleSubmit} className="form">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="role-select"
                        >
                            <option value="programmer">Programmer</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Creating…' : 'Create Account'}
                        </button>
                    </form>
                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}
                </div>
            </div>
            <style jsx>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f0f4ff, #e0eaff);
          display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .container { width: 100%; max-width: 420px; padding: 20px; }
        .card { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px);
          border-radius: 12px; padding: 30px; box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          text-align: center; }
        h1 { margin-bottom: 24px; font-weight: 600; color: #222; }
        .form { display: flex; flex-direction: column; gap: 14px; }
        input, select { width: 100%; padding: 12px 16px; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; transition: border-color 0.2s; }
        input:focus, select:focus { outline: none; border-color: #0066ff; }
        .submit-btn { background: #0066ff; color: #fff; border: none; border-radius: 8px; padding: 12px 0; font-weight: 600; cursor: pointer; transition: background 0.2s, transform 0.1s; }
        .submit-btn:hover { background: #0052cc; }
        .submit-btn:active { transform: scale(0.98); }
        .error { color: #e53935; margin-top: 12px; }
        .success { color: #43a047; margin-top: 12px; }
      `}</style>
        </>
    );
}
