'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Dashboard', icon: '◉' },
        { href: '/evidence', label: 'Evidence', icon: '◫' },
        { href: '/evidence/upload', label: 'Upload', icon: '↑' },
    ];

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <span style={{ fontStyle: 'italic', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.05em' }}>CE</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link
                        href="/settings"
                        className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}
                    >
                        <span className="nav-icon">⚙</span>
                        <span>Settings</span>
                    </Link>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
