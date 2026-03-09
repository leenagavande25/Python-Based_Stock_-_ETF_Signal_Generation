import { useState, useEffect, useCallback } from 'react';
import {
  fetchQuote,
  fetchHistory,
  fetchMarketOverview,
  fetchWatchlist,
  searchTickers,
} from '../services/marketDataService';

export function useMarketOverview() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchMarketOverview()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

export function useQuote(ticker) {
  const [quote, setQuote]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true); setError(null);
    fetchQuote(ticker)
      .then(setQuote)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticker]);

  return { quote, loading, error };
}

export function useHistory(ticker, period = '1mo', interval = '1d') {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true); setError(null);
    fetchHistory(ticker, period, interval)
      .then((d) => setHistory(Array.isArray(d) ? d : d.history || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticker, period, interval]);

  return { history, loading, error };
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    fetchWatchlist()
      .then((d) => setWatchlist(Array.isArray(d) ? d : d.watchlist || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { watchlist, loading, error };
}

export function useTickerSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (!q) { setResults([]); return; }
    setLoading(true);
    try {
      const d = await searchTickers(q);
      setResults(Array.isArray(d) ? d : d.results || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  return { results, loading, search };
}
