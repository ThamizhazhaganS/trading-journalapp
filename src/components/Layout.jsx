import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LineChart, Calculator, BarChart2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import styles from './Layout.module.css';

export default function Layout() {
    return (
        <div className={styles.appContainer}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>⚡</span>
                    <h1>TradeJournal</h1>
                </div>
            </header>

            <nav className={styles.bottomNav}>
                {/* Desktop Sidebar Logo */}
                <div className={styles.sidebarHeader}>
                    <span className={styles.logoIcon}>⚡</span>
                    <h1>TradeJournal</h1>
                </div>

                <NavLink
                    to="/"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink
                    to="/journal"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <BookOpen size={20} />
                    <span>Journal</span>
                </NavLink>
                <NavLink
                    to="/analytics"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <LineChart size={20} />
                    <span>Analytics</span>
                </NavLink>
                <NavLink
                    to="/market"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <BarChart2 size={20} />
                    <span>Market</span>
                </NavLink>
                <NavLink
                    to="/calculator"
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                    <Calculator size={20} />
                    <span>Calculator</span>
                </NavLink>

                <div className={styles.divider}></div>

                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        // PrivateRoute will detect no user and redirect to login automatically
                    }}
                    className={styles.navItem}
                    style={{ marginTop: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                    <span>Logout</span>
                </button>
            </nav>

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}
