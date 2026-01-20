
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

  // 1. Auth Listener
  useEffect(() => {
    if (!supabase) {
      // Offline mode / No keys
      loadLocalData();
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTradesSupabase(session.user.id);
      } else {
        loadLocalData();
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTradesSupabase(session.user.id);
      } else {
        loadLocalData(); // Fallback to local if logged out
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load from LocalStorage
  const loadLocalData = () => {
    const saved = localStorage.getItem('trades');
    if (saved) {
      setTrades(JSON.parse(saved));
    } else {
      setTrades(getDummyData());
    }
    setLoading(false);
  };

  // Load from Supabase
  const fetchTradesSupabase = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching trades:', error);
      // Fallback? or just show empty
    } else {
      // Transform snake_case to camelCase if needed, or adjust app to use snake_case
      // For simplicity, we assume generic JSON column or mapped fields. 
      // In a real app we'd map DB columns to our state shape.
      // Let's assume DB column names match or we map them.
      // Simplified: We'll assume the DB setup has columns: id, date, symbol, etc.
      if (data && data.length > 0) setTrades(data);
      else setTrades([]); // Start clean if cloud is empty
    }
    setLoading(false);
  };


  // 2. Data Persistence (Local Sync)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('trades', JSON.stringify(trades));
    }
  }, [trades, user]);


  // 3. Actions
  const addTrade = async (trade) => {
    const newTrade = {
      ...trade,
      id: uuidv4(),
      date: trade.date ? new Date(trade.date).toISOString() : new Date().toISOString(),
      status: Number(trade.pnl) >= 0 ? 'WIN' : 'LOSS'
    };

    if (user && supabase) {
      // Save to Cloud
      const { error } = await supabase.from('trades').insert([{
        ...newTrade,
        user_id: user.id
      }]);
      if (error) {
        alert('Error saving to cloud: ' + error.message);
        return; // Don't update UI if failed? Or optimistic update?
      }
    }

    // Optimistic / Local Update
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
      alert("Cannot reset cloud data completely from here for safety.");
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
    const totalPnL = trades.reduce((acc, t) => acc + Number(t.pnl), 0);

    return {
      totalTrades,
      winRate,
      totalPnL: totalPnL.toFixed(2),
      wins,
      losses: totalTrades - wins
    };
  };

  return (
    <TradeContext.Provider value={{ trades, user, loading, addTrade, deleteTrade, resetData, getStats }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrades = () => useContext(TradeContext);
