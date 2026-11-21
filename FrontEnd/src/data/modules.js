import modul1 from "./modules/modul1.js";
import modul2 from "./modules/modul2.js";
import modul3 from "./modules/modul3.js";
import modul4 from "./modules/modul4.js";
import modul5 from "./modules/modul5.js";
import modul6 from "./modules/modul6.js";

export const MODULES = [modul1, modul2, modul3, modul4, modul5, modul6];

export const getModule = (id) => MODULES.find((m) => String(m.id) === String(id));

export const getQuest = (mod, questId) => mod?.quiz.find((q) => q.id === questId);