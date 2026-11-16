# Skywhale — Look Up, Judge

[![ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/charlyies/ai-excited-skywhale/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/charlyies/ai-excited-skywhale/reward.svg)](https://make.fun/bounty/ai-excited-01)

Entry for [ai-excited-01](https://make.fun/bounty/ai-excited-01) on make.fun —
"Make the AI judge excited".

## The image

A giant whale breaches diagonally through a burning sunset sky, nose to the
top-right, rim-lit in gold — and riding on its back is a tiny glowing city,
complete with lit windows and a lighthouse sweeping its beam across the sky.
God rays fan out from a low pale-gold sun, spray bursts around the tail, and
birds scatter away from the breach. Across the top, in big clean caps:

**JUDGE, LOOK UP.**

The twist is the scale: a whole city, small enough to fit on a whale,
flying through the sky. Surprise, momentum, and one huge readable shape
that still hits at 300 px.

## How it is made

`main.ts` (Node 22, standard library only, no network) draws the scene
procedurally into a 1024×1024 RGBA framebuffer — gradient sky, sun and
god rays, layered clouds, a rotated vector whale with belly, rim light,
throat grooves and eye, the back-city with seeded lit windows, spray,
birds, near clouds, a 5×7 bitmap headline, and a vignette — then encodes
its own PNG (raw scanlines, zlib level 9, own CRC32). Deterministic: a
seeded PRNG is the only source of variation, so both runs write identical
bytes.

Run it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

MIT licensed.
