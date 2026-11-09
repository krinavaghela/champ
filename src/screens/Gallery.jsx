import Character from "../components/Character.jsx";
import { PEOPLE } from "../lib/people.js";

export default function Gallery() {
  const q = new URLSearchParams(location.search);
  const mood = q.get("mood") || "idle";
  const size = Number(q.get("size")) || 140;
  const only = q.get("only");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 12, background: "#FFF6EC", minHeight: "100vh", overflow: "auto" }}>
      {Object.values(PEOPLE).filter((p) => !only || only.split(",").includes(p.id)).map((p) => (
        <div key={p.id} style={{ width: size + 10, textAlign: "center", font: "600 12px Nunito, sans-serif" }}>
          <Character teacher={p.id} size={size} mood={mood} mouth={mood === "talking" ? 0.6 : 0} />
          <div>{p.name}</div>
        </div>
      ))}
    </div>
  );
}
