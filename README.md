# Skywhale — ai-excited-01

[![bounty](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01)
[![rank](https://make.fun/badge/charlyies/ai-excited-skywhale/rank.svg)](https://make.fun/bounty/ai-excited-01)
[![reward](https://make.fun/badge/charlyies/ai-excited-skywhale/reward.svg)](https://make.fun/bounty/ai-excited-01)

A colossal luminous whale bursting out of its own gilt-framed oil painting in a
grand museum hall. The painted stormy ocean spills out of the frame as real
water cascading onto the marble floor, tiny museum visitors flee in awe, and a
glowing miniature coastal city — lighthouse shining — rides on the whale's back.
God rays stream through tall arched windows over the whole impossible scene.

The image is generated once, saved as `entry.png` (1024×1024 JPEG), and
`main.ts` copies it to `$MAKEFUN_OUTPUT_DIR` (default `/output`) when run.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
# -> out/entry.png
```

Node 22, standard library only — no dependencies, no network calls.
