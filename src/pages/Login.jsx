
import { useState, useEffect } from 'react';
import { useTrades } from '../context/TradeContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight, LogIn } from 'lucide-react';
import styles from './Login.module.css';

export default function Login() {
    const { user } = useTrades();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!supabase) {
            alert('Supabase is not configured! Please see README to add API Keys.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            alert(error.message);
        } else {
            setSent(true);
        }
        setLoading(false);
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.iconCircle}>
                    <Lock size={24} />
                </div>
                <h2>Welcome Back</h2>
                <p className={styles.subtitle}>{sent ? 'Check your email for the magic link!' : 'Sign in to sync your trades across devices.'}</p>

                {!sent ? (
                    <form onSubmit={handleLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <Mail size={18} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className={styles.loginBtn} disabled={loading}>
                            {loading ? 'Sending Link...' : 'Sign In with Magic Link'}
                            {!loading && <ChevronRight size={18} />}
                        </button>
                    </form>
                ) : (
                    <div className={styles.sentMessage}>
                        <p>We've sent a magic login link to <strong>{email}</strong>.</p>
                        <button className={styles.btnSecondary} onClick={() => setSent(false)}>Try different email</button>
                    </div>
                )}

                <div className={styles.footer}>
                    <p>Don't have an account? It will be created automatically.</p>
                </div>
            </div>
        </div>
    );
}
