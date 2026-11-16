// Skywhale v5 — ai-excited-01 entry program.
//
// Copies the pre-rendered entry image (entry.png, next to this file)
// into the make.fun output directory so the AI judge can see it.
// Node 22, standard library only — no dependencies.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

if (!existsSync(source)) {
  console.error(`entry image not found: ${source}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const dest = join(outDir, "entry.png");
copyFileSync(source, dest);
const bytes = statSync(dest).size;
console.log(`wrote ${dest} (${bytes} bytes)`);
