import { useMemo } from 'react';
import { useTrades } from '../context/TradeContext';
import { Trophy, Medal, Target, Flame, Crown } from 'lucide-react';
import styles from './Achievements.module.css';

export default function Achievements() {
    const { trades } = useTrades();

    const unlocked = useMemo(() => {
        if (!trades || !trades.length) return [];

        const list = [];
        const wins = trades.filter(t => t.status === 'WIN');
        const winRate = (wins.length / trades.length) * 100;

        // 1. Rookie: First Trade
        if (trades.length >= 1) {
            list.push({
                id: 'rookie',
                title: 'Rookie',
                desc: 'Logged your first trade',
                icon: <Medal size={20} color="#CD7F32" /> // Bronze
            });
        }

        // 2. Hat Trick: 3 Consecutive Wins (Check recent 3)
        // trades are usually sorted desc by date in context, so check [0], [1], [2]
        if (trades.length >= 3 && trades[0].status === 'WIN' && trades[1].status === 'WIN' && trades[2].status === 'WIN') {
            list.push({
                id: 'streak',
                title: 'On Fire',
                desc: '3 Consecutive Wins',
                icon: <Flame size={20} color="#ef4444" />
            });
        }

        // 3. Whale: Big Win (> $500)
        if (trades.some(t => Number(t.pnl) >= 500)) {
            list.push({
                id: 'whale',
                title: 'Whale',
                desc: 'Single trade profit > $500',
                icon: <Crown size={20} color="#f59e0b" /> // Gold
            });
        }

        // 4. Sniper: High Win Rate
        if (trades.length >= 5 && winRate >= 60) {
            list.push({
                id: 'sniper',
                title: 'Sniper',
                desc: 'Win Rate > 60% (5+ trades)',
                icon: <Target size={20} color="#10b981" />
            });
        }

        // 5. Veteran: 10+ Trades
        if (trades.length >= 10) {
            list.push({
                id: 'veteran',
                title: 'Veteran',
                desc: 'Logged 10+ trades',
                icon: <Trophy size={20} color="#94a3b8" /> // Silver
            });
        }

        return list;
    }, [trades]);

    if (unlocked.length === 0) return null;

    return (
        <div className={styles.achievementsCard}>
            <div className={styles.header}>
                <h3><Trophy size={18} className={styles.headerIcon} /> Achievements</h3>
                <span className={styles.count}>{unlocked.length} Unlocked</span>
            </div>
            <div className={styles.grid}>
                {unlocked.map(item => (
                    <div key={item.id} className={styles.badgeItem} title={item.desc}>
                        <div className={styles.iconCircle}>{item.icon}</div>
                        <span className={styles.badgeTitle}>{item.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
