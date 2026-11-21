export default {
  id: 4,
  title: "Fungsi & Modul",
  desc: "Membuat fungsi dan memakai modul.",

  materi: [
    {
      title: "Membuat Fungsi",
      desc: "Fungsi dibuat dengan def. Gunakan return untuk mengembalikan hasil.",
      code: "def kuadrat(x):\n    return x * x\n\nprint(kuadrat(4))",
    },
  ],

  quiz: [
    {
      id: "4-1",
      title: "Fungsi Kuadrat",
      difficulty: "Easy Challenge",
      description: "Buat fungsi kuadrat(x) yang mengembalikan x pangkat dua. Baca satu bilangan, lalu cetak hasil kuadratnya.",
      inputFormat: "Satu bilangan bulat.",
      outputFormat: "Satu bilangan bulat: hasil kuadrat.",
      starter: "def kuadrat(x):\n    # tulis kode kamu di sini\n    pass\n\nn = int(input())\nprint(kuadrat(n))\n",
      hints: ["Ganti pass dengan return x * x."],
      points: 100,
      badge: "Function Smith",
      testCases: [
        { input: "3\n", output: "9" },
        { input: "-4\n", output: "16" },
        { input: "0\n", output: "0" },
      ],
    },
  ],
};