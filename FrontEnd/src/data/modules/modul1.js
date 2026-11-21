export default {
  id: 1,
  title: "Python Dasar",
  desc: "Variabel, tipe data, operator, dan input/output.",

  materi: [
    {
      title: "Pengenalan Python",
      desc: "Python adalah bahasa pemrograman yang mudah dibaca dan dipakai untuk banyak hal, dari web sampai analisis data.",
      code: 'print("Halo, PyVenture!")',
    },
    {
      title: "Variabel & Tipe Data",
      desc: "Variabel menyimpan nilai. Tipe data yang umum dipakai: int, float, str, dan bool.",
      code: 'nama = "Frost"\numur = 17\nsuhu = -12.5\nprint(nama, umur, suhu)',
    },
    {
      title: "Input & Output",
      desc: "Gunakan input() untuk membaca masukan dan print() untuk menampilkan hasil.",
      code: 'nama = input()\nprint("Halo,", nama)',
    },
  ],

  quiz: [
    {
      id: "1-1",
      title: "Jumlah Dua Bilangan",
      difficulty: "Easy Challenge",
      description: "Baca dua bilangan bulat, lalu cetak jumlahnya.",
      inputFormat: "Dua baris, masing-masing satu bilangan bulat.",
      outputFormat: "Satu baris berisi hasil penjumlahan.",
      starter: "a = int(input())\nb = int(input())\n# tulis kode kamu di bawah\n",
      hints: [
        "Gunakan int() untuk mengubah teks menjadi angka.",
        "Cetak hasilnya dengan print().",
      ],
      points: 50,
      badge: "Python Starter",
      testCases: [
        { input: "3\n4\n", output: "7" },
        { input: "10\n-2\n", output: "8" },
        { input: "0\n0\n", output: "0" },
      ],
    },
    {
      id: "1-2",
      title: "Sapa Pengguna",
      difficulty: "Easy Challenge",
      description: "Baca sebuah nama, lalu cetak sapaan dengan format Halo, <nama>!",
      inputFormat: "Satu baris berisi nama.",
      outputFormat: "Satu baris: Halo, <nama>!",
      starter: "nama = input()\n# tulis kode kamu di bawah\n",
      hints: ["Gabungkan teks dengan f-string, misalnya f\"Halo, {nama}!\"."],
      points: 50,
      badge: "Python Starter",
      testCases: [
        { input: "Frost\n", output: "Halo, Frost!" },
        { input: "Budi\n", output: "Halo, Budi!" },
        { input: "Ana Maria\n", output: "Halo, Ana Maria!" },
      ],
    },
  ],
};