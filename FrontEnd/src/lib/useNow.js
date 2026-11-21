import { useEffect, useState } from "react";

/* Mengembalikan waktu sekarang (ms) dan diperbarui setiap detik */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

/* ms -> "HH:MM:SS". Mengembalikan null kalau waktu sudah habis. */
export function formatRemaining(ms) {
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  const p = (n) => String(n).padStart(2, "0");
  return p(Math.floor(total / 3600)) + ":" + p(Math.floor((total % 3600) / 60)) + ":" + p(total % 60);
}