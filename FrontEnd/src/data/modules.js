const placeholderQuiz = ["Soal 1", "Soal 2", "Soal 3", "Soal 4", "Soal 5"];

/* Data contoh (ganti dengan data dari API kamu).
   solved = jumlah soal yang sudah selesai, total diambil dari panjang quiz. */
export const MODULES = [
  {
    id: 1,
    title: "Python Dasar",
    desc: "Deskripsi Modul",
    solved: 2,
    materi: [
      {
        title: "Pengenalan Python",
        desc: "Python adalah bahasa pemrograman yang mudah dibaca dan dipakai untuk banyak hal, dari web sampai analisis data.",
        code: `print("Halo, PyVenture!")`,
      },
      {
        title: "Variabel & Tipe Data",
        desc: "Variabel menyimpan nilai. Tipe data yang umum dipakai: int, float, str, dan bool.",
        code: `nama = "Frost"
umur = 17
suhu = -12.5
print(nama, umur, suhu)`,
      },
      {
        title: "Operator",
        desc: "Operator aritmatika dan perbandingan dipakai untuk menghitung dan membandingkan nilai.",
        code: `a = 7
b = 3
print(a + b, a // b, a % b)
print(a > b)`,
      },
      {
        title: "Input & Output",
        desc: "Gunakan input() untuk membaca masukan dan print() untuk menampilkan hasil.",
        code: `nama = input("Nama: ")
print("Halo,", nama)`,
      },
    ],
    quiz: ["Hello, PyVenture", "Hitung Luas Persegi", "Konversi Suhu", "Sapa Pengguna", "Kalkulator Mini"],
  },
  {
    id: 2,
    title: "Struktur Kontrol",
    desc: "Deskripsi Modul",
    solved: 1,
    materi: [
      {
        title: "Percabangan if",
        desc: "if, elif, dan else memilih blok kode yang dijalankan berdasarkan sebuah kondisi.",
        code: `suhu = -30
if suhu < -25:
    print("Ekstrem")
else:
    print("Normal")`,
      },
      {
        title: "Perulangan for",
        desc: "for mengulang kode untuk setiap elemen dalam urutan, misalnya hasil range().",
        code: `for i in range(3):
    print("Langkah", i)`,
      },
      {
        title: "Perulangan while",
        desc: "while mengulang kode selama kondisinya masih benar.",
        code: `n = 3
while n > 0:
    print(n)
    n -= 1`,
      },
      {
        title: "Break & Continue",
        desc: "break menghentikan perulangan, continue melompat ke putaran berikutnya.",
        code: `for i in range(10):
    if i == 5:
        break
    if i % 2 == 0:
        continue
    print(i)`,
      },
    ],
    quiz: ["Cek Bilangan Genap", "Hitung Mundur", "Jumlah 1 sampai N", "Filter Suhu", "Tebak Angka"],
  },
  { id: 3, title: "Struktur Data", desc: "Deskripsi Modul", solved: 0, locked: true, materi: [], quiz: placeholderQuiz },
  { id: 4, title: "Fungsi & Modul", desc: "Deskripsi Modul", solved: 0, locked: true, materi: [], quiz: placeholderQuiz },
  { id: 5, title: "OOP", desc: "Deskripsi Modul", solved: 0, locked: true, materi: [], quiz: placeholderQuiz },
];

export const getProgress = (m) => Math.round((m.solved / m.quiz.length) * 100);