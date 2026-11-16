// Skywhale v4 — ai-excited-01 entry program.
// Copies the entry image (entry.png, next to this file) into the
// make.fun output directory so the judge can see it.
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");

if (!existsSync(src)) {
  console.error(`entry image not found: ${src}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
const bytes = statSync(dst).size;
console.log(`wrote ${dst} (${bytes} bytes)`);
