import { useState, useCallback } from 'react';
import { runBacktest, fetchBacktestResult, fetchBacktestHistory } from '../services/backtestService';

export function useBacktest() {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError]     = useState(null);

  const run = useCallback(async (payload) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const job = await runBacktest(payload);
      // If backend returns result immediately
      if (job.status === 'completed' || job.equity_curve) {
        setResult(job);
        setLoading(false);
        return;
      }
      // Otherwise poll for result
      const id = job.job_id || job.id;
      setPolling(true);
      const interval = setInterval(async () => {
        try {
          const res = await fetchBacktestResult(id);
          if (res.status === 'completed') {
            setResult(res);
            setLoading(false);
            setPolling(false);
            clearInterval(interval);
          } else if (res.status === 'failed') {
            setError('Backtest failed on server.');
            setLoading(false);
            setPolling(false);
            clearInterval(interval);
          }
        } catch (e) {
          setError(e.message);
          setLoading(false);
          setPolling(false);
          clearInterval(interval);
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  return { run, result, loading, polling, error };
}

export function useBacktestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const d = await fetchBacktestHistory();
      setHistory(Array.isArray(d) ? d : d.history || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useState(() => { load(); }, []);

  return { history, loading, error, refetch: load };
}
