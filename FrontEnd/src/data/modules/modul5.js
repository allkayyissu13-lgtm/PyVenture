export default {
  id: 5,
  title: "OOP",
  desc: "Class, object, dan method.",

  materi: [
    {
      title: "Class & Object",
      desc: "Class adalah cetakan, object adalah hasil cetakannya. Method adalah fungsi di dalam class.",
      code: "class Persegi:\n    def __init__(self, sisi):\n        self.sisi = sisi\n\n    def luas(self):\n        return self.sisi * self.sisi\n\nprint(Persegi(4).luas())",
    },
  ],

  quiz: [
    {
      id: "5-1",
      title: "Luas Persegi Panjang",
      difficulty: "Medium Challenge",
      description: "Buat class PersegiPanjang dengan method luas(). Baca panjang dan lebar, lalu cetak luasnya.",
      inputFormat: "Dua baris: panjang, lalu lebar (bilangan bulat).",
      outputFormat: "Satu bilangan bulat: luas.",
      starter:
        "class PersegiPanjang:\n    def __init__(self, panjang, lebar):\n        self.panjang = panjang\n        self.lebar = lebar\n\n    def luas(self):\n        # tulis kode kamu di sini\n        pass\n\np = int(input())\nl = int(input())\nprint(PersegiPanjang(p, l).luas())\n",
      hints: ["Luas = panjang × lebar. Gunakan self untuk mengakses atribut."],
      points: 150,
      badge: "Object Architect",
      testCases: [
        { input: "3\n4\n", output: "12" },
        { input: "5\n5\n", output: "25" },
        { input: "0\n9\n", output: "0" },
      ],
    },
  ],
};