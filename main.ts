// Skywhale v9 — ai-excited-01 entry program.
// Copies entry.png (sitting next to this script) into the make.fun
// output directory so the AI judge can see it. Node 22 stdlib only.
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
const dest = join(outDir, "entry.png");

const { size } = statSync(src);
if (size === 0) throw new Error(`entry.png is empty: ${src}`);
mkdirSync(outDir, { recursive: true });
copyFileSync(src, dest);
console.log(`wrote ${dest} (${size} bytes)`);
