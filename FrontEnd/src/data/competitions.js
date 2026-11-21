/* ---------- Penyimpanan (localStorage browser) ----------
   Saat backend siap, ganti fungsi-fungsi di bawah dengan pemanggilan API. */
const COMP_KEY = "pyventure-competitions";
const SOLVED_KEY = "pyventure-competition-solved";

function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* abaikan */
  }
}

const HOUR = 3600 * 1000;

/* ---------- Data contoh (ganti dengan kompetisi timmu) ---------- */
const STANDINGS = [
  { name: "Hibrizi", pts: 4890 },
  { name: "Ruben", pts: 4120 },
  { name: "Indah", pts: 3980 },
  { name: "Lionel Ashley", pts: 3720 },
  { name: "Nazhwa Sava", pts: 3640 },
  { name: "Barra Al", pts: 3410 },
  { name: "Dewi Sartika", pts: 3120 },
  { name: "Kevin Mahesa", pts: 2760 },
  { name: "Salsa Putri", pts: 2340 },
  { name: "Gilang Ramadhan", pts: 1880 },
  { name: "Tania Wijaya", pts: 1450 },
  { name: "Yoga Pratama", pts: 600 },
]; // harus urut dari poin tertinggi

/* samples  = contoh yang ditampilkan ke peserta (dipakai tombol "Jalankan Kode")
   testCases = test case tersembunyi (dipakai bersama samples saat "Submit Jawaban Final") */
const PROBLEMS = [
  {
    id: "p1",
    title: "Urutkan Suhu",
    points: 1000,
    description:
      "Kamu diberi n bacaan suhu. Urutkan dari yang terendah ke tertinggi, lalu cetak hasilnya sebagai list Python.",
    inputFormat: "Baris pertama: bilangan bulat n.\nBaris kedua: n bilangan bulat dipisahkan spasi.",
    outputFormat: "Satu baris berisi list yang sudah terurut, misalnya [1, 2, 3].",
    starter: "n = int(input())\nsuhu = list(map(int, input().split()))\n# tulis solusi kamu di bawah\n",
    samples: [
      { input: "6\n5 3 7 1 2 6\n", output: "[1, 2, 3, 5, 6, 7]" },
      { input: "3\n-4 10 0\n", output: "[-4, 0, 10]" },
    ],
    testCases: [
      { input: "1\n9\n", output: "[9]" },
      { input: "5\n2 2 1 1 3\n", output: "[1, 1, 2, 2, 3]" },
      { input: "4\n100 -100 50 -50\n", output: "[-100, -50, 50, 100]" },
    ],
  },
  {
    id: "p2",
    title: "Hitung Suhu Ekstrem",
    points: 1000,
    description:
      "Hitung berapa bacaan yang suhunya di bawah -25 derajat. Suhu tepat -25 tidak dihitung.",
    inputFormat: "Baris pertama: bilangan bulat n.\nBaris kedua: n bilangan bulat dipisahkan spasi.",
    outputFormat: "Satu bilangan bulat: jumlah bacaan ekstrem.",
    starter: "n = int(input())\nsuhu = list(map(int, input().split()))\n# tulis solusi kamu di bawah\n",
    samples: [
      { input: "5\n-30 -10 -26 0 -25\n", output: "2" },
      { input: "3\n1 2 3\n", output: "0" },
    ],
    testCases: [
      { input: "4\n-100 -26 -24 -50\n", output: "3" },
      { input: "1\n-25\n", output: "0" },
      { input: "6\n-26 -27 -28 -29 -30 -31\n", output: "6" },
    ],
  },
  {
    id: "p3",
    title: "Palindrom",
    points: 1000,
    description:
      "Periksa apakah sebuah kata atau kalimat adalah palindrom. Abaikan perbedaan huruf besar dan kecil. Spasi tetap dihitung.",
    inputFormat: "Satu baris teks.",
    outputFormat: "Cetak YA jika palindrom, selain itu cetak TIDAK.",
    starter: "teks = input()\n# tulis solusi kamu di bawah\n",
    samples: [
      { input: "Katak\n", output: "YA" },
      { input: "Python\n", output: "TIDAK" },
    ],
    testCases: [
      { input: "A\n", output: "YA" },
      { input: "Kasur ini rusak\n", output: "YA" },
      { input: "ab\n", output: "TIDAK" },
      { input: "Level\n", output: "YA" },
    ],
  },
  {
    id: "p4",
    title: "Faktorial",
    points: 1000,
    description: "Hitung n! (faktorial dari n) untuk 0 ≤ n ≤ 20.",
    inputFormat: "Satu bilangan bulat n.",
    outputFormat: "Satu bilangan bulat: hasil n!.",
    starter: "n = int(input())\n# tulis solusi kamu di bawah\n",
    samples: [
      { input: "5\n", output: "120" },
      { input: "0\n", output: "1" },
    ],
    testCases: [
      { input: "1\n", output: "1" },
      { input: "10\n", output: "3628800" },
      { input: "20\n", output: "2432902008176640000" },
    ],
  },
  {
    id: "p5",
    title: "FizzBuzz",
    points: 1000,
    description:
      "Cetak angka 1 sampai n, satu per baris. Untuk kelipatan 3 cetak Fizz, kelipatan 5 cetak Buzz, dan kelipatan keduanya cetak FizzBuzz.",
    inputFormat: "Satu bilangan bulat n.",
    outputFormat: "n baris sesuai aturan di atas.",
    starter: "n = int(input())\n# tulis solusi kamu di bawah\n",
    samples: [
      { input: "5\n", output: "1\n2\nFizz\n4\nBuzz" },
      { input: "3\n", output: "1\n2\nFizz" },
    ],
    testCases: [
      { input: "1\n", output: "1" },
      { input: "7\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7" },
      {
        input: "15\n",
        output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
      },
    ],
  },
];

export const SEED = [
  {
    id: "arctic-sprint",
    name: "Arctic Code Sprint",
    desc: "Selesaikan 5 soal algoritma secepat mungkin sebelum waktu habis.",
    creator: "PyVenture Team",
    privacy: "public",
    /* Sementara dihitung dari saat halaman dimuat (selalu sisa 4 jam 28 menit).
       Ganti dengan tanggal asli, misalnya: new Date("2026-12-31T23:59:00+07:00").getTime() */
    endsAt: Date.now() + 4 * HOUR + 28 * 60000 + 7000,
    prizePool: 5000000,
    rewardNote: "+5.000 XP & Lencana GM",
    rules: [
      "Kompetisi berlangsung selama waktu yang tertera. Jawaban setelah waktu habis tidak dihitung.",
      "Setiap soal bernilai 1.000 poin jika lolos semua test case.",
      "Kode dijalankan dengan Python 3.12. Baca masukan dengan input() dan cetak hasil dengan print().",
      "Kerjakan sendiri. Kecurangan membuat peserta didiskualifikasi.",
    ],
    problems: PROBLEMS,
    standings: STANDINGS,
  },
];

/* ---------- Kompetisi ---------- */
export const getAllCompetitions = () => [...read(COMP_KEY, []), ...SEED];

export const getCompetition = (id) => getAllCompetitions().find((c) => c.id === id);

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/* Kompetisi baru: berlaku 7 hari, belum punya soal, hadiah, dan peserta */
export function addCompetition({ title, subtitle, slug, creator, privacy }) {
  const custom = read(COMP_KEY, []);
  const taken = new Set([...custom, ...SEED].map((c) => c.id));
  const base = slugify(slug || title) || "kompetisi";
  let id = base;
  let n = 2;
  while (taken.has(id)) id = base + "-" + n++;

  const comp = {
    id,
    name: title.trim(),
    desc: subtitle.trim(),
    creator: creator.trim(),
    privacy,
    endsAt: Date.now() + 7 * 24 * HOUR,
    prizePool: null,
    rewardNote: "",
    rules: [],
    problems: [],
    standings: [],
  };
  write(COMP_KEY, [comp, ...custom]);
  return comp;
}

/* ---------- Soal yang sudah diselesaikan ---------- */
export const getSolvedProblems = (compId) => read(SOLVED_KEY, {})[compId] || [];

export function markProblemSolved(compId, problemId) {
  const data = read(SOLVED_KEY, {});
  const list = data[compId] || [];
  if (!list.includes(problemId)) {
    data[compId] = [...list, problemId];
    write(SOLVED_KEY, data);
  }
}

/* ---------- Format ---------- */
export const rankOf = (entries, pts) => entries.filter((e) => e.pts > pts).length + 1;

export const formatRupiah = (n) => (n == null ? "—" : "Rp " + n.toLocaleString("id-ID"));