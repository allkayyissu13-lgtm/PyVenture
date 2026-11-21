let worker = null;
let ready = null; // Promise<boolean>
let nextId = 0;
const pending = new Map();

function stop() {
  if (worker) worker.terminate();
  worker = null;
  ready = null;
  pending.forEach((p) => p.done({ stdout: "", error: "Eksekusi dihentikan." }));
  pending.clear();
}

function start() {
  worker = new Worker(import.meta.env.BASE_URL + "pyworker.js");
  ready = new Promise((resolve) => {
    worker.onmessage = (e) => {
      const d = e.data;
      if (d.type === "ready") return resolve(d.ok);
      const p = pending.get(d.id);
      if (p) {
        pending.delete(d.id);
        p.done({ stdout: d.stdout, error: d.error });
      }
    };
    worker.onerror = () => resolve(false);
  });
  worker.postMessage({ type: "init" });
}

// Panggil lebih awal supaya Python sudah siap saat siswa menekan tombol
export function warmUp() {
  if (!worker) start();
  return ready;
}

/* Jalankan kode dengan stdin tertentu. Hasil: { stdout, error, timeout? } */
export async function runPython(code, input = "", timeoutMs = 5000) {
  const ok = await warmUp();
  if (!ok) {
    stop();
    return { stdout: "", error: "Gagal memuat Python. Periksa koneksi internet." };
  }

  return new Promise((resolve) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      stop(); // hentikan perulangan tak berujung
      resolve({ stdout: "", error: null, timeout: true });
    }, timeoutMs);

    pending.set(id, {
      done: (r) => {
        clearTimeout(timer);
        resolve(r);
      },
    });
    worker.postMessage({ id, code, input });
  });
}

// Abaikan spasi di akhir baris dan baris kosong di akhir
const norm = (s) =>
  String(s ?? "")
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();

/* Nilai kode terhadap semua test case.
   status: "ok" | "wrong" | "error" | "timeout" */
export async function judgeAll(code, testCases) {
  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const t = testCases[i];
    const r = await runPython(code, t.input ?? "");
    let status = "ok";
    if (r.timeout) status = "timeout";
    else if (r.error) status = "error";
    else if (norm(r.stdout) !== norm(t.output)) status = "wrong";
    results.push({ name: "Test Case " + (i + 1), status, ok: status === "ok" });
  }
  return results;
}