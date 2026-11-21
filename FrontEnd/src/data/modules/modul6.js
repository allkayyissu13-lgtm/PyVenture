export default {
  id: 6,
  title: "Proyek Akhir",
  desc: "Gabungkan semua materi dalam satu tantangan.",

  materi: [
    {
      title: "Merangkum Semua Materi",
      desc: "Proyek akhir memakai input, perulangan, list, dan format keluaran sekaligus.",
      code: 'nilai = [80, 90, 100]\nrata = sum(nilai) / len(nilai)\nprint(f"{rata:.2f}")',
    },
  ],

  quiz: [
    {
      id: "6-1",
      title: "Rata-rata Nilai",
      difficulty: "Medium Challenge",
      description: "Baca n nilai, lalu cetak rata-ratanya dengan dua angka di belakang koma.",
      inputFormat: "Baris pertama: n.\nBaris kedua: n bilangan bulat dipisahkan spasi.",
      outputFormat: "Satu bilangan dengan 2 desimal, misalnya 2.00.",
      starter: "n = int(input())\nnilai = list(map(int, input().split()))\n# tulis kode kamu di bawah\n",
      hints: ['Gunakan f"{x:.2f}" untuk membulatkan ke dua desimal.'],
      points: 200,
      badge: "Grandmaster",
      testCases: [
        { input: "3\n1 2 3\n", output: "2.00" },
        { input: "2\n5 6\n", output: "5.50" },
        { input: "1\n7\n", output: "7.00" },
      ],
    },
  ],
};