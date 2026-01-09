import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, LineChart, Calculator, BarChart2 } from 'lucide-react';
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
            </nav>

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}
