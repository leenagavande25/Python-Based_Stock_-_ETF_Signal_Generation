import { useState, useEffect, useCallback } from 'react';
import { fetchSignals, fetchLatestSignals, generateSignals } from '../services/signalService';

export function useSignals(params = {}) {
  const [signals, setSignals]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSignals(params);
      setSignals(Array.isArray(data) ? data : data.signals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  return { signals, loading, error, refetch: load };
}

export function useLatestSignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestSignals();
      setSignals(Array.isArray(data) ? data : data.signals || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { signals, loading, error, refetch: load };
}

export function useGenerateSignals() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [result, setResult]   = useState(null);

  const generate = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateSignals(payload);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, result };
}
