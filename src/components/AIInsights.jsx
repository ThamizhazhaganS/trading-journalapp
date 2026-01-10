import { useMemo } from 'react';
import { useTrades } from '../context/TradeContext';
import { Sparkles, Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './AIInsights.module.css';

export default function AIInsights() {
    const { trades } = useTrades();

    const insights = useMemo(() => {
        if (!trades || !Array.isArray(trades) || !trades.length) return [];

        const results = [];

        // 1. Long vs Short Analysis
        const longs = trades.filter(t => t.type === 'LONG');
        const shorts = trades.filter(t => t.type === 'SHORT');

        const longWinRate = longs.length ? (longs.filter(t => t.status === 'WIN').length / longs.length) * 100 : 0;
        const shortWinRate = shorts.length ? (shorts.filter(t => t.status === 'WIN').length / shorts.length) * 100 : 0;

        if (Math.abs(longWinRate - shortWinRate) > 20) {
            const betterSide = longWinRate > shortWinRate ? 'Long' : 'Short';
            const diff = Math.abs(longWinRate - shortWinRate).toFixed(0);
            results.push({
                icon: <TrendingUp size={18} className={styles.iconSuccess} />,
                title: "Directional Bias Detected",
                desc: `You perform ${diff}% better on ${betterSide} trades. Consider focusing on ${betterSide} setups.`
            });
        }

        // 2. Emotional Analysis (Basic Keyword Search)
        const tiltKeywords = ['revenge', 'angry', 'fomo', 'frustrated', 'greedy', 'fearful'];
        const emotionalTrades = trades.filter(t => t.notes && tiltKeywords.some(k => t.notes.toLowerCase().includes(k) || t.emotion?.toLowerCase().includes(k)));
        const emotionalLosses = emotionalTrades.filter(t => t.status === 'LOSS').length;

        if (emotionalTrades.length > 0 && (emotionalLosses / emotionalTrades.length) > 0.6) {
            results.push({
                icon: <Brain size={18} className={styles.iconWarning} />,
                title: "Emotional Leakage",
                desc: `High failure rate detected when trading under emotional stress (FOMO, Anger). Take a break after losses.`
            });
        }

        // 3. Best Asset Class
        const assetPerformance = {};
        trades.forEach(t => {
            if (!t.assetClass) return;
            if (!assetPerformance[t.assetClass]) assetPerformance[t.assetClass] = { pnl: 0, count: 0 };
            assetPerformance[t.assetClass].pnl += Number(t.pnl);
            assetPerformance[t.assetClass].count++;
        });

        // Find best performing asset with at least 2 trades
        const bestAsset = Object.keys(assetPerformance)
            .filter(a => assetPerformance[a].count > 1)
            .sort((a, b) => assetPerformance[b].pnl - assetPerformance[a].pnl)[0];

        if (bestAsset && assetPerformance[bestAsset].pnl > 0) {
            results.push({
                icon: <Sparkles size={18} className={styles.iconHighlight} />,
                title: "Star Performer",
                desc: `Your most profitable asset class is ${bestAsset} (+$${assetPerformance[bestAsset].pnl.toFixed(0)}). Stick to what pays!`
            });
        }

        // Fallback if no specific insights
        if (results.length === 0) {
            results.push({
                icon: <Sparkles size={18} className={styles.iconHighlight} />,
                title: "Gathering Data",
                desc: "Keep logging trades! AI needs more data to generate personalized winning strategies."
            });
        }

        return results.slice(0, 3); // Return top 3 insights
    }, [trades]);

    return (
        <div className={styles.aiCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerTitle}>
                    <Brain className={styles.mainIcon} size={20} />
                    <h3>AI Analyst</h3>
                </div>
                <span className={styles.badge}>BETA</span>
            </div>

            <div className={styles.insightsList}>
                {insights.map((insight, idx) => (
                    <div key={idx} className={styles.insightRow}>
                        <div className={styles.insightIconWrapper}>
                            {insight.icon}
                        </div>
                        <div className={styles.insightContent}>
                            <h4>{insight.title}</h4>
                            <p>{insight.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
