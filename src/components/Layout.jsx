import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LineChart, Calculator, BarChart2, UserCircle } from 'lucide-react';
import { useTrades } from '../context/TradeContext';
import { supabase } from '../supabaseClient';
import styles from './Layout.module.css';

export default function Layout() {
    const { user } = useTrades();
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

                {user && (
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <UserCircle size={20} />
                        <span>Profile</span>
                    </NavLink>
                )}

                {user ? (
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className={styles.navItem}
                        style={{ marginTop: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                        <span>Logout</span>
                    </button>
                ) : (
                    <NavLink
                        to="/login"
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        style={{ marginTop: 'auto' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" /></svg>
                        <span>Login</span>
                    </NavLink>
                )}

            </nav>

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}
