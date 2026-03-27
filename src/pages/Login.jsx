
import { useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, LogIn, User, Play } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
    const { user } = useTrades();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (!supabase) {
            alert('Supabase configuration missing.');
            setLoading(false);
            return;
        }

        try {
            if (activeTab === 'signup') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setMessage('Success! Check your email to confirm account.');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setLoading(true);
        setMessage('');

        if (!supabase) {
            alert('Supabase configuration missing.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'demo@tradejournal.app',
                password: 'demo123',
            });
            if (error) throw error;
        } catch (error) {
            setMessage('Demo account error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.brandHeader}>
                    <div className={styles.logoIcon}>⚡</div>
                    <h1>TradeJournal</h1>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'signin' ? styles.activeTab : ''}`}
                        onClick={() => { setActiveTab('signin'); setMessage(''); }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'signup' ? styles.activeTab : ''}`}
                        onClick={() => { setActiveTab('signup'); setMessage(''); }}
                    >
                        Create Account
                    </button>
                </div>

                <div className={styles.cardContent}>
                    <h2>{activeTab === 'signin' ? 'Welcome Back' : 'Get Started'}</h2>
                    <p className={styles.subtitle}>
                        {activeTab === 'signin'
                            ? 'Enter your credentials to access your journal.'
                            : 'Create a new account to start tracking trades.'}
                    </p>

                    {message && (
                        <div className={`${styles.alert} ${message.includes('Success') ? styles.success : styles.error}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className={styles.form}>
                        {activeTab === 'signup' && (
                            <div className={styles.inputGroup}>
                                <label>Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <User size={18} className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? <div className={styles.spinner}></div> : (activeTab === 'signin' ? 'Sign In' : 'Create Account')}
                            {!loading && <ChevronRight size={18} />}
                        </button>
                    </form>

                    <div className={styles.divider}>or</div>

                    <button 
                        className={styles.demoBtn} 
                        onClick={handleDemoLogin}
                        disabled={loading}
                    >
                        <Play size={18} />
                        Try Demo Account
                    </button>
                </div>
            </div>
        </div>
    );
}
