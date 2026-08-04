import { build } from "esbuild";
import { mkdirSync, copyFileSync, existsSync, rmSync } from "fs";

const outDir = "dist";

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(`${outDir}/assets`, { recursive: true });

await build({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: `${outDir}/assets/index.js`,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".js": "jsx" },
});

copyFileSync("public/index.html", `${outDir}/index.html`);

console.log("✓ Build completata:", `${outDir}/assets/index.js`);
