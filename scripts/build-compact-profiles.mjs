import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../icon/png/", import.meta.url));
const sourceSize = 1024;
const compactSize = 820;
const left = 102;
const top = 65;
const radius = compactSize / 2;
const variants = readdirSync(directory).filter(name => /^mc-profile-.*-1024\.png$/.test(name));

function pixels(file) {
  return execFileSync("ffmpeg", [
    "-v", "error", "-i", directory + file, "-frames:v", "1",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1",
  ], { maxBuffer: 8 * 1024 * 1024 });
}

for (const source of variants) {
  const image = pixels(source);
  if (image.length !== sourceSize ** 2 * 3) throw new Error(`Unexpected dimensions: ${source}`);

  // Check all visible art against the compact crop and a centered circular avatar mask.
  const background = image.subarray(0, 3);
  let farthest = 0;
  for (let y = 0; y < sourceSize; y++) {
    for (let x = 0; x < sourceSize; x++) {
      const offset = (y * sourceSize + x) * 3;
      const difference = background.reduce((total, channel, index) => total + Math.abs(channel - image[offset + index]), 0);
      if (difference > 12) {
        farthest = Math.max(farthest, Math.hypot(x - left + 0.5 - radius, y - top + 0.5 - radius));
      }
    }
  }
  if (farthest > radius - 24 || farthest === 0) throw new Error(`Artwork reaches the circular crop edge: ${source}`);

  const output = source.replace("-1024.png", "-compact-820.png");
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", directory + source, "-frames:v", "1",
    "-vf", `crop=${compactSize}:${compactSize}:${left}:${top}:exact=1`,
    "-threads", "1", directory + output,
  ]);
  const exported = pixels(output);
  if (exported.length !== compactSize ** 2 * 3) throw new Error(`Unexpected output dimensions: ${output}`);
  for (let row = 0; row < compactSize; row++) {
    const from = ((row + top) * sourceSize + left) * 3;
    const offset = row * compactSize * 3;
    const length = compactSize * 3;
    if (!image.subarray(from, from + length).equals(exported.subarray(offset, offset + length))) {
      throw new Error(`Pixel mismatch: ${output}`);
    }
  }
  console.log(`${output}: unchanged artwork, ${Math.floor(radius - farthest)} px circular clearance`);
}
