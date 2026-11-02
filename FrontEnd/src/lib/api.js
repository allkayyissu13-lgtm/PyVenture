// src/lib/api.js — jembatan React <-> backend Go (auth.go)

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const SESSION_KEY = "pyventure_session";

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Tidak bisa terhubung ke server. Pastikan backend Go sudah berjalan.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Terjadi kesalahan pada server.");
    err.status = res.status; // mis. 403 = email belum diverifikasi
    throw err;
  }
  return data;
}

// remember = true  -> localStorage   (tetap login setelah browser ditutup)
// remember = false -> sessionStorage (hilang saat tab ditutup)
function saveSession(data, remember) {
  clearSession();
  const store = remember ? localStorage : sessionStorage;
  store.setItem(SESSION_KEY, JSON.stringify({ token: data.token, user: data.user }));
}

// Register TIDAK langsung login: backend mengirim kode 6 digit ke email,
// lalu user harus memasukkannya di halaman /verify.
export function register({ username, email, password }) {
  return post("/api/auth/register", { username, email, password });
}

// Kode benar -> backend mengirim { token, user }, jadi user langsung login.
export async function verifyEmail({ email, code }, remember = true) {
  const data = await post("/api/auth/verify", { email, code });
  saveSession(data, remember);
  return data;
}

export function resendCode(email) {
  return post("/api/auth/resend", { email });
}

export async function login({ email, password }, remember = true) {
  const data = await post("/api/auth/login", { email, password });
  saveSession(data, remember);
  return data;
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

// Pakai ini untuk endpoint yang dilindungi auth.Require di backend.
// Kalau server menjawab 401 (token kedaluwarsa/tidak valid), sesi dihapus.
export async function authFetch(path, options = {}) {
  const session = getSession();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${session?.token ?? ""}`,
    },
  });
  if (res.status === 401) clearSession();
  return res;
}

// ---------- Endpoint Learning & Modul (semua butuh login) ----------
// Tiap fungsi mengembalikan JSON dari backend, atau melempar Error
// (pesannya dari backend) kalau gagal.
async function api(path, options) {
  const res = await authFetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Terjadi kesalahan pada server.");
  return data;
}
const withBody = (method, body) => ({ method, body: JSON.stringify(body) });

export const getMap = () => api("/api/map");
export const getProgress = () => api("/api/me/progress");

export const getStage = (slug) => api(`/api/stages/${slug}`);
export const getModule = (slug) => api(`/api/stages/${slug}/module`);
export const saveNote = (sectionId, note) =>
  api(`/api/sections/${sectionId}/note`, withBody("PUT", { note }));
export const completeSection = (sectionId) =>
  api(`/api/sections/${sectionId}/complete`, { method: "POST" });

export const getExercise = (slug) => api(`/api/exercises/${slug}`);
export const getExerciseContext = (slug) => api(`/api/exercises/${slug}/context`);
export const runCode = (slug, code, stdin = "") =>
  api(`/api/exercises/${slug}/run`, withBody("POST", { code, stdin }));
export const submitCode = (slug, code) =>
  api(`/api/exercises/${slug}/submit`, withBody("POST", { code }));
export const nextHint = (slug) =>
  api(`/api/exercises/${slug}/hints/next`, { method: "POST" });