// components/Navbar.tsx
import Link from 'next/link';
import Image from 'next/image';
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
                    <Link href="/reports">
                        <Image 
                            src="/logo.png" 
                            alt="MarvelQuant Logo" 
                            width={45} 
                            height={45}
                            style={{ objectFit: 'contain' }}
                            className="logo-only"
                        />
                    </Link>
                </div>
                <div className="links">
                    <Link href="/reports" className={router.pathname === '/reports' ? 'active' : ''}>
                        <span className="nav-icon">📊</span>
                        <span>Reports</span>
                    </Link>
                    <Link href="/tasks" className={router.pathname.startsWith('/tasks') ? 'active' : ''}>
                        <span className="nav-icon">✓</span>
                        <span>Tasks</span>
                    </Link>
                    <Link href="/prompts" className={router.pathname.startsWith('/prompts') ? 'active' : ''}>
                        <span className="nav-icon">🤖</span>
                        <span>AI Prompts</span>
                    </Link>
                    <Link href="/requests" className={router.pathname.startsWith('/requests') ? 'active' : ''}>
                        <span className="nav-icon">📋</span>
                        <span>Requests</span>
                    </Link>
                    <Link href="/files" className={router.pathname.startsWith('/files') ? 'active' : ''}>
                        <span className="nav-icon">📁</span>
                        <span>Files</span>
                    </Link>
                </div>
                <div className="user-actions">
                    <Link href="/reports/new" className="new-report-btn">
                        <span className="btn-icon">+</span>
                        <span>New Report</span>
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="btn-icon">⏻</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            <style jsx>{`
        .navbar {
          background: linear-gradient(135deg, rgba(10, 25, 41, 0.95) 0%, rgba(15, 41, 66, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(0, 212, 255, 0.3);
          padding: 12px 0;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 212, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }
        .brand {
          flex-shrink: 0;
        }
        .brand a {
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          padding: 5px;
          border-radius: 8px;
        }
        .brand a:hover {
          background: rgba(0, 212, 255, 0.1);
          transform: scale(1.05);
        }
        .logo-only {
          filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3));
          transition: all 0.3s ease;
        }
        .logo-only:hover {
          filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6));
        }
        .links {
          display: flex;
          gap: 8px;
          flex: 1;
          justify-content: center;
        }
        .links a {
          color: #cbd5e1;
          text-decoration: none;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.3s ease;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid transparent;
          background: rgba(15, 41, 66, 0.4);
          letter-spacing: 0.3px;
        }
        .nav-icon {
          font-size: 16px;
          transition: transform 0.3s ease;
        }
        .links a:hover {
          background: rgba(0, 212, 255, 0.15);
          color: #00d4ff;
          border-color: rgba(0, 212, 255, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.2);
        }
        .links a:hover .nav-icon {
          transform: scale(1.2);
        }
        .links a.active {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
          color: #00d4ff;
          border: 1px solid rgba(0, 212, 255, 0.5);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .user-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        .new-report-btn {
          background: linear-gradient(135deg, #00d4ff 0%, #06b6d4 100%);
          border: 1px solid rgba(0, 212, 255, 0.5);
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          color: #0a1929;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
        }
        .new-report-btn:hover {
          background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
          box-shadow: 0 6px 20px rgba(0, 212, 255, 0.6);
          transform: translateY(-2px);
        }
        .btn-icon {
          font-size: 18px;
          font-weight: bold;
          line-height: 1;
        }
        .logout-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          color: #f87171;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.5px;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.6);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          transform: translateY(-2px);
          color: #ef4444;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .links a span:last-child {
            display: none;
          }
          .links a {
            padding: 10px;
          }
          .nav-icon {
            font-size: 20px;
          }
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 0 20px;
            gap: 15px;
          }
          .new-report-btn span:last-child,
          .logout-btn span:last-child {
            display: none;
          }
          .new-report-btn,
          .logout-btn {
            padding: 10px 14px;
          }
        }
      `}</style>
        </nav>
    );
}
