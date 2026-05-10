/**
 * Returns a debounced version of `fn` that delays invoking it
 * until after `delay` ms have elapsed since the last call.
 *
 * Usage:
 *   const search = debounce((q) => fetchResults(q), 300);
 *   <input onChange={(e) => search(e.target.value)} />
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * React hook version — returns a stable debounced callback.
 * The ref trick ensures the latest `fn` is always called
 * without resetting the timer on every render.
 *
 * Usage:
 *   const handleSearch = useDebouncedCallback((q) => {
 *     get(`/api/employees/search?query=${q}`).then(setResults);
 *   }, 300);
 */
import { useRef, useCallback, useEffect } from "react";

export function useDebouncedCallback(fn, delay = 300) {
  const fnRef    = useRef(fn);
  const timerRef = useRef(null);

  useEffect(() => { fnRef.current = fn; });

  return useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fnRef.current(...args), delay);
  }, [delay]);
}
