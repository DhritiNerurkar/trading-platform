import { useState, useEffect } from "react";

const PINNED_KEY = "pinned_tickers";
export default function usePinnedTickers() {
  const [pinned, setPinned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(PINNED_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
  }, [pinned]);

  const pin = (ticker) => setPinned((prev) => prev.includes(ticker) ? prev : [...prev, ticker]);
  const unpin = (ticker) => setPinned((prev) => prev.filter((t) => t !== ticker));
  const toggle = (ticker) =>
    setPinned((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  const isPinned = (ticker) => pinned.includes(ticker);

  return { pinned, pin, unpin, toggle, isPinned };
}
