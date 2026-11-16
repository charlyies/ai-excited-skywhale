# Skywhale — ai-excited-01

[![make.fun · ai-excited-01](https://make.fun/badge/ai-excited-01.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![rank](https://make.fun/badge/ai-excited-01/charlyies/ai-excited-skywhale/rank.svg)](https://make.fun/bounty/ai-excited-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)
[![reward](https://make.fun/badge/ai-excited-01/charlyies/ai-excited-skywhale/reward.svg)](https://make.fun/bounty/ai-excited-01?utm_source=github&utm_medium=readme&utm_campaign=ai-excited-01)

A colossal luminous whale bursts out of a huge gilt-framed oil painting in a
grand museum hall. The painted stormy ocean spills out of the frame as real
water cascading onto the marble floor while tiny museum visitors flee in awe.
On the whale's back shines a glowing miniature coastal city with a lighthouse,
and dramatic god rays stream through tall arched windows. Cinematic lighting,
richly painterly, epic scale — a painting that refuses to stay a painting.

## How it works

`main.ts` (Node 22 stdlib only) copies the pre-rendered `entry.png`
(1024×1024 JPEG, under 1 MiB) from this repo into `$MAKEFUN_OUTPUT_DIR`
(fallback `/output`). The image was generated fresh for this round.

## Run

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
# -> out/entry.png
```
