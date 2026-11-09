import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" keeps asset paths relative so the built app also runs when hosted inside a page.
export default defineConfig({ base: "./", plugins: [react()] });
