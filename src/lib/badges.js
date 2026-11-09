import { CATEGORIES } from "./people.js";

// Animal Mindset Badges: each animal stands for a learning habit.
// progress(state) returns [current, goal]; a badge is earned when current >= goal.

export const BADGES = [
  { id: "lion", animal: "Lion", title: "Brave Lion", mindset: "Courage", color: "#F5B700",
    how: "Ask a question out loud with your voice.", progress: (s) => [s.stats.voiceQuestions, 1] },
  { id: "eagle", animal: "Eagle", title: "Eagle Eye", mindset: "Vision", color: "#0F766E",
    how: `Explore all ${CATEGORIES.length} halls of teachers.`, progress: (s) => [s.stats.hallsSeen.length, CATEGORIES.length] },
  { id: "cheetah", animal: "Cheetah", title: "Focused Cheetah", mindset: "Focus", color: "#E08A00",
    how: "Finish 2 lessons in one day.", progress: (s) => [Math.max(0, ...Object.values(s.progress.lessonsByDay || {})), 2] },
  { id: "owl", animal: "Owl", title: "Wise Owl", mindset: "Wisdom", color: "#8B5CF6",
    how: "Get 10 knowledge-check questions right on the first try.", progress: (s) => [s.progress.quiz?.right || 0, 10] },
  { id: "elephant", animal: "Elephant", title: "Elephant Memory", mindset: "Memory", color: "#64748B",
    how: "Explain a lesson back to your teacher in your own words.", progress: (s) => [s.stats.explains, 1] },
  { id: "ant", animal: "Ant", title: "Steady Ant", mindset: "Consistency", color: "#DC2626",
    how: "Hit your daily goal 5 times.", progress: (s) => [s.stats.goalsHit, 5] },
  { id: "dolphin", animal: "Dolphin", title: "Creative Dolphin", mindset: "Creativity", color: "#0EA5E9",
    how: "Draw something in your journal.", progress: (s) => [(s.journal || []).filter((e) => e.type === "drawing").length, 1] },
  { id: "chimp", animal: "Chimp", title: "Champ Chimp", mindset: "Playful learning", color: "#FF8A3D",
    how: "Finish your first story lesson.", progress: (s) => [s.progress.lessonsDone.length, 1] },
  { id: "fox", animal: "Fox", title: "Curious Fox", mindset: "Curiosity", color: "#F97316",
    how: "Ask a “why” question.", progress: (s) => [s.stats.whyQuestions, 1] },
  { id: "tortoise", animal: "Tortoise", title: "Patient Tortoise", mindset: "Patience", color: "#1FB57A",
    how: "Reach a 3-day streak.", progress: (s) => [s.progress.streak, 3] },
  { id: "octopus", animal: "Octopus", title: "Many-Minded Octopus", mindset: "Range", color: "#DB2777",
    how: "Learn from teachers in 3 different fields.", progress: (s) => [s.stats.fields.length, 3] },
  { id: "beaver", animal: "Beaver", title: "Busy Beaver", mindset: "Hard work", color: "#A16207",
    how: "Study for 60 minutes in total.", progress: (s) => [Math.floor(s.stats.minutesTotal), 60] },
  { id: "bee", animal: "Bee", title: "Busy Bee", mindset: "Momentum", color: "#EAB308",
    how: "Earn 500 XP.", progress: (s) => [s.progress.xp, 500] },
];

export const BADGE = Object.fromEntries(BADGES.map((b) => [b.id, b]));

export function qualified(state) {
  return BADGES.filter((b) => {
    const [cur, goal] = b.progress(state);
    return cur >= goal;
  }).map((b) => b.id);
}
