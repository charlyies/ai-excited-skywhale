// Skywhale v2 — make.fun ai-excited-01
// A colossal luminous whale bursts out of its gilt-framed painting
// in a museum, water flooding the floor as visitors flee, a tiny
// glowing city with a lighthouse riding on its back.
// This program simply copies the finished image to the output dir.
// Deterministic: the same input bytes produce the same output bytes
// on every run — no generation, no randomness, no network.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
copyFileSync(join(here, "entry.png"), join(outDir, "entry.png"));
