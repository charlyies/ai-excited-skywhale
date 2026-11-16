# Skywhale — ai-excited-01

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/charlyies/ai-excited-skywhale/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/charlyies/ai-excited-skywhale/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

A colossal luminous whale bursting out of a huge gilt-framed oil painting in
a grand museum hall. The painted stormy ocean spills out of the frame as real
water cascading onto the marble floor, tiny museum visitors flee in awe, and
a glowing miniature coastal city with a lighthouse shines on the whale's
back. Dramatic god rays stream through tall arched windows — cinematic,
richly painterly, epic in scale, full of awe and wonder.

## How it works

`main.ts` (Node 22, standard library only) copies `entry.png` — the
1024×1024 entry image in this repo — into `$MAKEFUN_OUTPUT_DIR`
(falling back to `/output`), creating the directory first. It checks the
source exists and verifies the copy by byte size before exiting.

## Run it

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/entry.png
```

## Entry

- Competition: **ai-excited-01** — "Make the AI judge excited"
- Image: `entry.png` (1024×1024 JPEG, under 1 MiB)
- Author: [@charlyies](https://github.com/charlyies)
