import { useTrades } from '../context/TradeContext';
import AIInsights from '../components/AIInsights';
import Achievements from '../components/Achievements';
import EconomicCalendar from '../components/EconomicCalendar';
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart as PieIcon, RotateCcw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import styles from './Dashboard.module.css';

export default function Dashboard() {
    const { getStats, trades, resetData, user, privacyMode } = useTrades();
    const stats = getStats();

    const currency = user?.user_metadata?.currency || 'USD';

    // Mask sensitive numbers for Privacy Mode
    const maskValue = (value, unit = '') => {
        if (privacyMode) return '****';
        return `${value}${unit}`;
    };

    const formatCurrency = (val) => {
        if (privacyMode) return '****';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(val);
    };

    // Get display name (MetaData or Email fallback)
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader';

    // Calculate Asset Allocation for Portfolio Card
    const assetAllocation = trades.reduce((acc, trade) => {
        const asset = trade.assetClass ? trade.assetClass : 'Other'; // Fallback for missing asset class
        acc[asset] = (acc[asset] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(assetAllocation).map(asset => ({
        name: asset,
        value: assetAllocation[asset]
    }));

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h2>Hello, {displayName} 👋</h2>
                    <span className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <button className={styles.resetBtn} onClick={resetData} title="Reset to default data">
                    <RotateCcw size={16} /> Reset
                </button>
            </header>

            {/* 1. Top Ticker Stats Row */}
            <div className={styles.statsTicker}>
                <div className={styles.tickerCard}>
                    <div className={styles.tickerLabel}>Total P&L</div>
                    <div className={`${styles.tickerValue} ${Number(stats.totalPnL) >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(stats.totalPnL)}
                    </div>
                </div>
                <div className={styles.tickerCard}>
                    <div className={styles.tickerLabel}>Win Rate</div>
                    <div className={styles.tickerValue}>{maskValue(stats.winRate, '%')}</div>
                </div>
                <div className={styles.tickerCard}>
                    <div className={styles.tickerLabel}>Profit Factor</div>
                    <div className={styles.tickerValue}>
                        {privacyMode ? '****' : `${stats.wins}W / ${stats.losses}L`}
                    </div>
                </div>
                <div className={styles.tickerCard}>
                    <div className={styles.tickerLabel}>Total Trades</div>
                    <div className={styles.tickerValue}>{stats.totalTrades}</div>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className={styles.dashboardGrid}>

                {/* Left: Portfolio & Recent Activity (Main) */}
                <div className={styles.mainCol}>
                    <div className={styles.portfolioCard} style={{ height: '400px', marginBottom: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <h3>Asset Allocation</h3>
                        </div>
                        <div className={styles.chartContainer}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#181b21', border: '1px solid #2d313a', borderRadius: '8px' }}
                                            itemStyle={{ color: '#ededed' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={styles.emptyChart}>No data</div>
                            )}
                        </div>
                    </div>

                    <section className={styles.recentSection}>
                        <div className={styles.sectionHeader}>
                            <h3>Recent Activity</h3>
                        </div>
                        <div className={styles.recentList}>
                            {trades.slice(0, 5).map(trade => (
                                <div key={trade.id} className={styles.tradeRow}>
                                    <div className={styles.tradeInfo}>
                                        <div className={styles.rowMain}>
                                            <span className={styles.tradeSymbol}>{trade.symbol}</span>
                                            <span className={`tag ${trade.type === 'LONG' ? 'text-success' : 'text-danger'}`}>{trade.type}</span>
                                        </div>
                                        <div className={styles.rowSub}>
                                            <span>{new Date(trade.date).toLocaleDateString()}</span>
                                            <span className={styles.dot}>•</span>
                                            <span>{trade.strategy || 'No Strategy'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.tradeResult}>
                                        <span className={`${styles.pnl} ${Number(trade.pnl) >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {formatCurrency(trade.pnl)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {trades.length === 0 && <div className={styles.empty}>No recent activity.</div>}
                        </div>
                    </section>
                </div>

                {/* Right: AI & Achievements (Side) */}
                <div className={styles.sideCol}>
                    <AIInsights />
                    <Achievements />
                    <EconomicCalendar />
                </div>

            </div>
        </div>
    );
}

