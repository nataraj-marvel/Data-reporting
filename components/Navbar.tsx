// components/Navbar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in (simple check for now, can be improved)
        // We can check if the API returns 401, but for now let's just assume
        // if we are not on login/register pages, we might be logged in.
        // Better: check for a cookie or local storage if we stored anything.
        // Since we use httpOnly cookies, we can't check directly.
        // But we can check if the route is not public.
        const publicRoutes = ['/login', '/public-register', '/'];
        setIsLoggedIn(!publicRoutes.includes(router.pathname));
    }, [router.pathname]);

    const handleLogout = async () => {
        try {
            // Call logout API if it exists, or just redirect to login
            // For now, just redirect
            router.push('/login');
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    if (!isLoggedIn) return null;

    return (
        <nav className="navbar">
            <div className="container">
                <div className="brand">
                    <Link href="/reports">Nautilus Reporting</Link>
                </div>
                <div className="links">
                    <Link href="/reports" className={router.pathname === '/reports' ? 'active' : ''}>
                        Reports
                    </Link>
                    <Link href="/tasks" className={router.pathname.startsWith('/tasks') ? 'active' : ''}>
                        Tasks
                    </Link>
                    <Link href="/reports/new" className={router.pathname === '/reports/new' ? 'active' : ''}>
                        + New Report
                    </Link>
                </div>
                <div className="user-actions">
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </div>
            <style jsx>{`
        .navbar {
          background: white;
          border-bottom: 1px solid #eaeaea;
          padding: 15px 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand a {
          font-weight: 700;
          font-size: 1.2rem;
          color: #333;
          text-decoration: none;
        }
        .links {
          display: flex;
          gap: 20px;
        }
        .links a {
          color: #666;
          text-decoration: none;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .links a:hover {
          background: #f5f5f5;
          color: #333;
        }
        .links a.active {
          background: #e3f2fd;
          color: #0066ff;
        }
        .logout-btn {
          background: transparent;
          border: 1px solid #ddd;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: #666;
          font-size: 0.9rem;
        }
        .logout-btn:hover {
          background: #f5f5f5;
          color: #333;
        }
      `}</style>
        </nav>
    );
}
