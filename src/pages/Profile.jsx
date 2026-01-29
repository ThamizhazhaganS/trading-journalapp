import { useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';
import { supabase } from '../supabaseClient';
import {
    User, Mail, Save, UserCircle, Settings,
    Download, DollarSign, ShieldAlert,
    Sun, Moon, Eye, EyeOff
} from 'lucide-react';
import styles from './Profile.module.css';

export default function Profile() {
    const {
        user, trades, theme, toggleTheme, privacyMode, togglePrivacyMode
    } = useTrades();
    const [fullName, setFullName] = useState('');
    const [initialCapital, setInitialCapital] = useState('10000');
    const [currency, setCurrency] = useState('USD');
    const [tradingRules, setTradingRules] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setInitialCapital(user.user_metadata?.initial_capital || '10000');
            setCurrency(user.user_metadata?.currency || 'USD');
            setTradingRules(user.user_metadata?.trading_rules || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    initial_capital: initialCapital,
                    currency: currency,
                    trading_rules: tradingRules
                }
            });

            if (error) throw error;
            setMessage('Profile & Settings updated successfully! ✅');
        } catch (error) {
            setMessage('Error updating profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadData = () => {
        if (!trades || trades.length === 0) {
            alert('No trades to download.');
            return;
        }

        const headers = ["Date", "Symbol", "Type", "Entry", "Exit", "Qty", "PnL", "Strategy", "Notes"];
        const rows = trades.map(t => [
            t.date,
            t.symbol,
            t.type,
            t.entryPrice,
            t.exitPrice,
            t.quantity,
            t.pnl,
            t.strategy || '',
            `"${t.notes?.replace(/"/g, '""') || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(",")].concat(rows.map(r => r.join(","))).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `trade_journal_data_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <UserCircle size={32} />
                <h1>My Profile & Settings</h1>
            </div>

            <div className={styles.profileGrid}>
                {/* Left Column: Identity & Appearance */}
                <div className={styles.leftCol}>
                    <div className={styles.profileCard}>
                        <div className={styles.cardHeader}>
                            <User size={20} />
                            <h3>Identity</h3>
                        </div>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarCircle}>
                                {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <span className={styles.emailTag}>{user?.email}</span>
                        </div>

                        <div className={styles.formStack}>
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <User size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email (Read-only)</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={18} className={styles.inputIcon} />
                                    <input type="email" value={user?.email || ''} disabled />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.profileCard} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <Settings size={20} />
                            <h3>Appearance & Privacy</h3>
                        </div>
                        <div className={styles.preferenceStack}>
                            <div className={styles.preferenceItem}>
                                <div className={styles.prefInfo}>
                                    <span className={styles.prefTitle}>Theme Mode</span>
                                    <span className={styles.prefDesc}>Switch between Dark and Light mode</span>
                                </div>
                                <button onClick={toggleTheme} className={styles.toggleBtn}>
                                    {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                    <span className={styles.toggleLabel}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
                                </button>
                            </div>
                            <div className={styles.preferenceItem}>
                                <div className={styles.prefInfo}>
                                    <span className={styles.prefTitle}>Privacy Mode</span>
                                    <span className={styles.prefDesc}>Hide sensitive P&L data for screenshots</span>
                                </div>
                                <button onClick={togglePrivacyMode} className={`${styles.toggleBtn} ${privacyMode ? styles.activeToggle : ''}`}>
                                    {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                                    <span className={styles.toggleLabel}>{privacyMode ? 'Hidden' : 'Visible'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Trading Settings */}
                <div className={styles.profileCard}>
                    <div className={styles.cardHeader}>
                        <DollarSign size={20} />
                        <h3>Account Settings</h3>
                    </div>
                    <div className={styles.formStack}>
                        <div className={styles.rowGroup}>
                            <div className={styles.inputGroup}>
                                <label>Initial Capital</label>
                                <div className={styles.inputWrapper}>
                                    <DollarSign size={16} className={styles.inputIcon} />
                                    <input
                                        type="number"
                                        value={initialCapital}
                                        onChange={(e) => setInitialCapital(e.target.value)}
                                        placeholder="10000"
                                    />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className={styles.selectInput}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Trading Rules (Your Mantra)</label>
                            <div className={styles.inputWrapper}>
                                <ShieldAlert size={16} className={styles.textAreaIcon} />
                                <textarea
                                    value={tradingRules}
                                    onChange={(e) => setTradingRules(e.target.value)}
                                    placeholder="1. Wait for candle close&#10;2. Max 2% risk per trade&#10;3. No FOMO"
                                    rows="4"
                                    className={styles.textArea}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Message */}
            {message && (
                <div style={{
                    marginTop: '1.5rem',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: message.includes('Error') ? '#ef4444' : '#10b981',
                    maxWidth: '1000px',
                    margin: '1.5rem auto'
                }}>
                    {message}
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actionRow}>
                <button onClick={handleUpdateProfile} className={styles.saveBtn} disabled={loading}>
                    {loading ? 'Saving Changes...' : 'Save All Settings'}
                    {!loading && <Save size={18} />}
                </button>

                <button onClick={handleDownloadData} className={styles.downloadBtn}>
                    Download Data (CSV)
                    <Download size={18} />
                </button>
            </div>
        </div>
    );
}
