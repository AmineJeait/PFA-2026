import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic data-fetching hook.
 *
 * @param {() => Promise<any>} fetchFn  - function that returns a promise (e.g. () => get("/api/employees"))
 * @param {any[]}              deps     - re-run when these change (like useEffect deps)
 * @param {object}             options
 * @param {boolean}            options.skip - set true to skip the initial fetch (e.g. when an id isn't ready yet)
 *
 * @returns {{ data, loading, error, refetch }}
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => get("/api/employees"), []);
 */
export function useApi(fetchFn, deps = [], { skip = false } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError]   = useState(null);

  // keep a stable ref to fetchFn so refetch always calls the latest version
  const fnRef = useRef(fetchFn);
  useEffect(() => { fnRef.current = fetchFn; });

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      setData(result);
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skip) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...deps]);

  return { data, loading, error, refetch: run };
}