/* Progres disimpan di localStorage browser siswa.
   Saat backend siap, ganti isi fungsi-fungsi ini dengan pemanggilan API. */
const KEY = "pyventure-progress";

// true = semua modul terbuka (berguna saat menguji)
const UNLOCK_ALL = false;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* abaikan */
  }
}

export const getSolvedIds = (moduleId) => read()[moduleId] || [];

export const getSolvedCount = (mod) =>
  getSolvedIds(mod.id).filter((id) => mod.quiz.some((q) => q.id === id)).length;

export function markSolved(moduleId, questId) {
  const data = read();
  const list = data[moduleId] || [];
  if (!list.includes(questId)) {
    data[moduleId] = [...list, questId];
    write(data);
  }
}

export const getProgress = (mod) =>
  mod.quiz.length ? Math.round((getSolvedCount(mod) / mod.quiz.length) * 100) : 0;

// Modul pertama selalu terbuka. Modul berikutnya terbuka setelah semua soal modul sebelumnya selesai.
export function isUnlocked(modules, index) {
  if (UNLOCK_ALL || index === 0) return true;
  const prev = modules[index - 1];
  return getSolvedCount(prev) >= prev.quiz.length;
}