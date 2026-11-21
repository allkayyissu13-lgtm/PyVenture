export default {
  id: 2,
  title: "Struktur Kontrol",
  desc: "Percabangan if dan perulangan for/while.",

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
  ],

  quiz: [
    {
      id: "2-1",
      title: "Genap atau Ganjil",
      difficulty: "Easy Challenge",
      description: "Baca sebuah bilangan bulat. Cetak GENAP jika genap, selain itu cetak GANJIL.",
      inputFormat: "Satu bilangan bulat.",
      outputFormat: "GENAP atau GANJIL.",
      starter: "n = int(input())\n# tulis kode kamu di bawah\n",
      hints: ["Operator % memberi sisa bagi. Bilangan genap bersisa 0 jika dibagi 2."],
      points: 50,
      badge: "Control Flow",
      testCases: [
        { input: "4\n", output: "GENAP" },
        { input: "7\n", output: "GANJIL" },
        { input: "0\n", output: "GENAP" },
        { input: "-3\n", output: "GANJIL" },
      ],
    },
    {
      id: "2-2",
      title: "Hitung Mundur",
      difficulty: "Easy Challenge",
      description: "Baca bilangan n, lalu cetak n sampai 1 secara menurun, satu angka per baris.",
      inputFormat: "Satu bilangan bulat n (n ≥ 1).",
      outputFormat: "n baris: n, n-1, ..., 1.",
      starter: "n = int(input())\n# tulis kode kamu di bawah\n",
      hints: ["range(n, 0, -1) menghasilkan n sampai 1."],
      points: 50,
      badge: "Control Flow",
      testCases: [
        { input: "3\n", output: "3\n2\n1" },
        { input: "1\n", output: "1" },
        { input: "5\n", output: "5\n4\n3\n2\n1" },
      ],
    },
  ],
};