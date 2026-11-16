// Skywhale v8 — ai-excited-01 entry program.
//
// Copies the entry image (entry.png, next to this script) into the
// directory make.fun asks for, so the judge can see it. Node 22,
// standard library only, no dependencies.

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");

if (!existsSync(source)) {
  console.error(`entry image not found: ${source}`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });

const dest = join(outDir, "entry.png");
copyFileSync(source, dest);

// Confirm the copy landed intact: same size as the source.
const srcBytes = statSync(source).size;
const dstBytes = statSync(dest).size;
if (srcBytes !== dstBytes) {
  console.error(`copy mismatch: source ${srcBytes} bytes, dest ${dstBytes} bytes`);
  process.exit(1);
}

console.log(`wrote ${dest} (${dstBytes} bytes)`);
