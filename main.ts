// Skywhale v3 — writes the entry image to the make.fun output directory.
// Node 22, standard library only. No dependencies, no network.
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const dest = join(outDir, "entry.png");

if (!existsSync(src)) {
  throw new Error(`entry image missing: ${src}`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, dest);

const bytes = statSync(dest).size;
if (bytes > 1_048_576) {
  throw new Error(`entry image too large: ${bytes} bytes (limit 1 MiB)`);
}
console.log(`wrote ${dest} (${bytes} bytes)`);
