import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Gallery from "./screens/Gallery.jsx";
import "./styles.css";

// ?gallery shows every character side by side (handy when tuning the drawings).
const gallery = new URLSearchParams(location.search).has("gallery");
createRoot(document.getElementById("root")).render(gallery ? <Gallery /> : <App />);
