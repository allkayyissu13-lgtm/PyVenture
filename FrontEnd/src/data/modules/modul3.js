export default {
  id: 3,
  title: "Struktur Data",
  desc: "List, tuple, dictionary, dan set.",

  materi: [
    {
      title: "List",
      desc: "List menyimpan banyak nilai dalam satu variabel dan bisa diubah isinya.",
      code: "angka = [3, 1, 2]\nangka.append(5)\nprint(sorted(angka))\nprint(sum(angka))",
    },
  ],

  quiz: [
    {
      id: "3-1",
      title: "Jumlah Elemen List",
      difficulty: "Easy Challenge",
      description: "Baca n bilangan bulat, lalu cetak jumlah semuanya.",
      inputFormat: "Baris pertama: n.\nBaris kedua: n bilangan bulat dipisahkan spasi.",
      outputFormat: "Satu bilangan bulat: jumlah semua elemen.",
      starter: "n = int(input())\nangka = list(map(int, input().split()))\n# tulis kode kamu di bawah\n",
      hints: ["Fungsi sum() menjumlahkan semua elemen list."],
      points: 100,
      badge: "Data Wrangler",
      testCases: [
        { input: "3\n1 2 3\n", output: "6" },
        { input: "1\n5\n", output: "5" },
        { input: "4\n-1 -2 -3 -4\n", output: "-10" },
      ],
    },
  ],
};