
import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';

const TradeContext = createContext();

const getDummyData = () => {
  const today = new Date();
  const getDate = (daysAgo, hours = 10, minutes = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    { id: '1', symbol: 'BTC/USD', type: 'LONG', entryPrice: 42000, exitPrice: 43500, quantity: 0.5, date: getDate(6), notes: 'Breakout retest', strategy: 'Breakout', emotion: 'Confident', assetClass: 'Crypto', marketTrend: 'Uptrend', status: 'WIN', pnl: 750 },
    { id: '2', symbol: 'ETH/USD', type: 'SHORT', entryPrice: 2400, exitPrice: 2450, quantity: 5, date: getDate(5, 9, 15), notes: 'Resistance rejection failed', strategy: 'Reversal', emotion: 'Fearful', assetClass: 'Crypto', marketTrend: 'Ranging', status: 'LOSS', pnl: -250 },
    { id: '3', symbol: 'EUR/USD', type: 'LONG', entryPrice: 1.0850, exitPrice: 1.0890, quantity: 10000, date: getDate(4, 11, 0), notes: 'News event scalp', strategy: 'Scalp', emotion: 'FOMO', assetClass: 'Forex', marketTrend: 'Uptrend', status: 'WIN', pnl: 40 },
    { id: '4', symbol: 'XAU/USD', type: 'LONG', entryPrice: 2150.50, exitPrice: 2165.00, quantity: 10, date: getDate(3, 10, 0), notes: 'Safe haven play', strategy: 'Trend Following', emotion: 'Neutral', assetClass: 'Commodities', marketTrend: 'uptrend', status: 'WIN', pnl: 145 },
    { id: '5', symbol: 'SENSEX', type: 'SHORT', entryPrice: 73500, exitPrice: 73200, quantity: 1, date: getDate(2, 9, 30), notes: 'Gap fill trade', strategy: 'Reversal', emotion: 'Greedy', assetClass: 'Indices', marketTrend: 'Downtrend', status: 'WIN', pnl: 300 },
  ];
};

export function TradeProvider({ children }) {
  const [user, setUser] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [privacyMode, setPrivacyMode] = useState(() => localStorage.getItem('privacyMode') === 'true');

  // Global Asset Sync (Market -> Calculator)
  const [activeAsset, setActiveAsset] = useState({
    symbol: 'BINANCE:BTCUSDT',
    price: 45000,
    type: 'CRYPTO',
    lastUpdated: Date.now()
  });

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Privacy Sync
  useEffect(() => {
    localStorage.setItem('privacyMode', privacyMode);
  }, [privacyMode]);

  // Auth Listener
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!supabase) {
        if (isMounted) {
          loadLocalData();
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            setTheme(session.user.user_metadata?.theme || 'dark');
            setPrivacyMode(session.user.user_metadata?.privacyMode || false);
            await fetchTradesSupabase(session.user.id);
          } else {
            loadLocalData();
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (isMounted) {
          loadLocalData();
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTheme(session.user.user_metadata?.theme || 'dark');
          setPrivacyMode(session.user.user_metadata?.privacyMode || false);
          fetchTradesSupabase(session.user.id);
        } else {
          loadLocalData();
        }
      }
    }) || { data: { subscription: { unsubscribe: () => { } } } };

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (user && supabase) {
      await supabase.auth.updateUser({ data: { theme: newTheme } });
    }
  };

  const togglePrivacyMode = async () => {
    const newMode = !privacyMode;
    setPrivacyMode(newMode);
    if (user && supabase) {
      await supabase.auth.updateUser({ data: { privacyMode: newMode } });
    }
  };

  const loadLocalData = () => {
    try {
      const saved = localStorage.getItem('trades');
      if (saved) {
        setTrades(JSON.parse(saved));
      } else {
        setTrades(getDummyData());
      }
    } catch (e) {
      console.error("Local data parse error:", e);
      setTrades(getDummyData());
    }
  };

  const fetchTradesSupabase = async (userId) => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
    } else {
      setTrades(data || []);
    }
  };

  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem('trades', JSON.stringify(trades));
      } catch (e) {
        console.error("Local storage save error:", e);
      }
    }
  }, [trades, user]);

  const addTrade = async (trade) => {
    const newTrade = {
      ...trade,
      id: uuidv4(),
      date: trade.date ? new Date(trade.date).toISOString() : new Date().toISOString(),
      status: Number(trade.pnl) >= 0 ? 'WIN' : 'LOSS'
    };

    if (user && supabase) {
      const { error } = await supabase.from('trades').insert([{
        ...newTrade,
        user_id: user.id
      }]);
      if (error) {
        alert('Error saving to cloud: ' + error.message);
        return;
      }
    }
    setTrades(prev => [newTrade, ...prev]);
  };

  const deleteTrade = async (id) => {
    if (user && supabase) {
      await supabase.from('trades').delete().eq('id', id);
    }
    setTrades(prev => prev.filter(t => t.id !== id));
  };

  const resetData = () => {
    if (user) {
      alert("Delete cloud trades individualy or via profile for safety.");
      return;
    }
    const freshData = getDummyData();
    setTrades(freshData);
    localStorage.setItem('trades', JSON.stringify(freshData));
  };

  const getStats = () => {
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === 'WIN').length;
    const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
    const totalPnL = trades.reduce((acc, t) => acc + Number(t.pnl || 0), 0);

    return {
      totalTrades,
      winRate,
      totalPnL: totalPnL.toFixed(2),
      wins,
      losses: totalTrades - wins
    };
  };

  return (
    <TradeContext.Provider value={{
      trades, user, loading, addTrade, deleteTrade, resetData, getStats,
      theme, toggleTheme, privacyMode, togglePrivacyMode,
      activeAsset, setActiveAsset
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrades = () => useContext(TradeContext);
