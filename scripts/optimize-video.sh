#!/usr/bin/env bash
# High-quality web encode for hero showreel (muted, faststart).
# Usage: ./scripts/optimize-video.sh [input.mp4]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IN="${1:-$ROOT/public/video.mp4}"
OUT="$ROOT/public/video.mp4"
TMP="$ROOT/public/video.hq.tmp.mp4"

if [[ ! -f "$IN" ]]; then
  echo "Missing input: $IN"
  exit 1
fi

# Keep a backup if we're overwriting the only copy mid-run
if [[ "$IN" == "$OUT" ]]; then
  cp -f "$IN" "$ROOT/public/video.source.bak.mp4"
  IN="$ROOT/public/video.source.bak.mp4"
fi

ffmpeg -y -i "$IN" \
  -an \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -profile:v high \
  -level 4.1 \
  -pix_fmt yuv420p \
  -vf "scale='min(1920,iw)':-2:flags=lanczos" \
  -movflags +faststart \
  "$TMP"

mv -f "$TMP" "$OUT"
ffprobe -v error -show_entries format=size,bit_rate,duration -of default=noprint_wrappers=1 "$OUT"
echo "Wrote $OUT"
