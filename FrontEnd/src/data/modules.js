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
        code: 'print("Halo, PyVenture!")',
      },
      {
        title: "Nama Materi",
        desc: "Variabel menyimpan nilai. Tipe data yang umum dipakai: int, float, str, dan bool.",
        code: 'nama = "Frost"\numur = 17\nsuhu = -12.5\nprint(nama, umur, suhu)',
      },
      {
        title: "Nama Materi",
        desc: "Operator aritmatika dan perbandingan dipakai untuk menghitung dan membandingkan nilai.",
        code: "a = 7\nb = 3\nprint(a + b, a // b, a % b)\nprint(a > b)",
      },
      {
        title: "Nama Materi",
        desc: "Gunakan input() untuk membaca masukan dan print() untuk menampilkan hasil.",
        code: 'nama = input("Nama: ")\nprint("Halo,", nama)',
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
        code: 'suhu = -30\nif suhu < -25:\n    print("Ekstrem")\nelse:\n    print("Normal")',
      },
      {
        title: "Perulangan for",
        desc: "for mengulang kode untuk setiap elemen dalam urutan, misalnya hasil range().",
        code: 'for i in range(3):\n    print("Langkah", i)',
      },
      {
        title: "Perulangan while",
        desc: "while mengulang kode selama kondisinya masih benar.",
        code: "n = 3\nwhile n > 0:\n    print(n)\n    n -= 1",
      },
      {
        title: "Break & Continue",
        desc: "break menghentikan perulangan, continue melompat ke putaran berikutnya.",
        code: "for i in range(10):\n    if i == 5:\n        break\n    if i % 2 == 0:\n        continue\n    print(i)",
      },
    ],
    quiz: ["Cek Bilangan Genap", "Hitung Mundur", "Jumlah 1 sampai N", "Filter Suhu", "Tebak Angka"],
  },
  { id: 3, title: "Struktur Data", desc: "Deskripsi Modul", solved: 0, locked: true, materi: [], quiz: placeholderQuiz },
  { id: 4, title: "Fungsi & Modul", desc: "Deskripsi Modul", solved: 0, locked: true, materi: [], quiz: placeholderQuiz },
  { id: 5, title: "OOP", desc: "Deskripsi Modul", solved: 0, locked: true, materi: [], quiz: placeholderQuiz },
];

export const getProgress = (m) => Math.round((m.solved / m.quiz.length) * 100);