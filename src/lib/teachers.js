import { PEOPLE, FEATURED, categoriesOf } from "./people.js";

// Mix a hex colour toward white (amt > 0) or black (amt < 0).
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const out = ch.map((c) => Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt)));
  return "#" + out.map((c) => c.toString(16).padStart(2, "0")).join("");
}

const MALE = ["Daniel", "Google UK English Male", "Alex", "Fred", "Arthur", "Oliver"];
const FEMALE = ["Samantha", "Karen", "Moira", "Google UK English Female", "Amelie", "Serena"];

function build(p) {
  const cat = categoriesOf(p.id)[0];
  return {
    ...p,
    field: p.field || `${cat ? cat.name : "Science"} · ${p.award.split(" · ")[0]}`,
    tagline: p.tagline || p.known,
    hello: p.hello || `Hello, I'm ${p.short}. ${p.known} Ask me anything, and we'll work it out together.`,
    deep: shade(p.color, -0.22),
    soft: shade(p.color, 0.88),
    liquid: [shade(p.color, 0.35), p.color],
    voice: {
      pitch: p.gender === "f" ? 1.08 : p.look.age >= 2 ? 0.86 : 0.96,
      rate: 0.97,
      prefer: p.gender === "f" ? FEMALE : MALE,
    },
  };
}

export const TEACHERS = Object.fromEntries(Object.values(PEOPLE).map((p) => [p.id, build(p)]));
// Hand-tuned voices for the featured four.
TEACHERS.einstein.voice = { pitch: 0.85, rate: 0.95, prefer: ["Daniel", "Google UK English Male", "Alex", "Fred"] };
TEACHERS.turing.voice = { pitch: 1.0, rate: 1.0, prefer: ["Daniel", "Google UK English Male", "Oliver", "Arthur"] };
TEACHERS.tesla.voice = { pitch: 0.95, rate: 1.02, prefer: ["Alex", "Google US English", "Tom", "Aaron"] };

export const TEACHER_LIST = FEATURED.map((id) => TEACHERS[id]);
export const getTeacher = (id) => TEACHERS[id] || TEACHERS.einstein;
