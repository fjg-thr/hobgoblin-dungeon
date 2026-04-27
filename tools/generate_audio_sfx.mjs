import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const sampleRate = 44100;
const outputDir = join(process.cwd(), "public/assets/audio");

mkdirSync(outputDir, { recursive: true });

const clamp = (value, min = -1, max = 1) => Math.max(min, Math.min(max, value));
const sine = (frequency, time) => Math.sin(Math.PI * 2 * frequency * time);
const triangle = (frequency, time) => (2 / Math.PI) * Math.asin(sine(frequency, time));

let seed = 0x5eed;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
};

function envelope(time, duration, attack = 0.008, release = 0.08) {
  const attackGain = Math.min(1, time / attack);
  const releaseGain = Math.min(1, (duration - time) / release);
  return Math.max(0, Math.min(attackGain, releaseGain));
}

function writeWav(name, duration, render) {
  const sampleCount = Math.floor(sampleRate * duration);
  const data = Buffer.alloc(sampleCount * 2);

  for (let i = 0; i < sampleCount; i += 1) {
    const time = i / sampleRate;
    const value = clamp(render(time, duration, i) * 0.9);
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);

  writeFileSync(join(outputDir, `${name}.wav`), Buffer.concat([header, data]));
}

writeWav("staff_shot", 0.18, (time, duration) => {
  const sweep = 420 + 920 * (1 - time / duration);
  const body = triangle(sweep, time) * envelope(time, duration, 0.004, 0.12);
  const sparkle = sine(1440 + 180 * Math.sin(time * 60), time) * envelope(time, duration, 0.002, 0.05);
  return body * 0.4 + sparkle * 0.16;
});

writeWav("projectile_hit", 0.16, (time, duration) => {
  const crack = (random() * 2 - 1) * envelope(time, duration, 0.001, 0.05);
  const thump = sine(110 - time * 120, time) * envelope(time, duration, 0.002, 0.12);
  return crack * 0.22 + thump * 0.42;
});

writeWav("enemy_hit", 0.17, (time, duration) => {
  const bite = triangle(180 - time * 190, time) * envelope(time, duration, 0.003, 0.12);
  const grit = (random() * 2 - 1) * envelope(time, duration, 0.001, 0.055);
  return bite * 0.42 + grit * 0.14;
});

writeWav("enemy_down", 0.36, (time, duration) => {
  const drop = triangle(170 - time * 260, time) * envelope(time, duration, 0.006, 0.24);
  const dust = (random() * 2 - 1) * envelope(time, duration, 0.02, 0.18);
  return drop * 0.46 + dust * 0.08;
});

writeWav("player_hurt", 0.28, (time, duration) => {
  const pulse = sine(130 + 35 * Math.sin(time * 30), time) * envelope(time, duration, 0.002, 0.2);
  const scrape = (random() * 2 - 1) * envelope(time, duration, 0.001, 0.09);
  return pulse * 0.5 + scrape * 0.12;
});

writeWav("pickup", 0.22, (time, duration) => {
  const lift = sine(560 + time * 880, time) * envelope(time, duration, 0.006, 0.12);
  const bell = sine(1120 + time * 440, time) * envelope(time, duration, 0.006, 0.16);
  return lift * 0.26 + bell * 0.18;
});

writeWav("powerup", 0.46, (time, duration) => {
  const arpeggio = [460, 620, 820, 1080][Math.min(3, Math.floor((time / duration) * 4))];
  const tone = sine(arpeggio, time) * envelope(time, duration, 0.008, 0.18);
  const shimmer = sine(arpeggio * 2.02, time) * envelope(time, duration, 0.01, 0.22);
  return tone * 0.3 + shimmer * 0.16;
});

writeWav("heart_pickup", 0.34, (time, duration) => {
  const tone = sine(520 + time * 640, time) * envelope(time, duration, 0.01, 0.2);
  const warm = sine(260 + time * 260, time) * envelope(time, duration, 0.01, 0.24);
  return tone * 0.28 + warm * 0.22;
});

writeWav("ammo_pickup", 0.2, (time, duration) => {
  const wood = triangle(240 + time * 520, time) * envelope(time, duration, 0.003, 0.09);
  const click = (random() * 2 - 1) * envelope(time, duration, 0.001, 0.025);
  return wood * 0.34 + click * 0.12;
});

writeWav("game_over", 0.78, (time, duration) => {
  const fall = triangle(220 - time * 170, time) * envelope(time, duration, 0.02, 0.42);
  const low = sine(64 - time * 24, time) * envelope(time, duration, 0.02, 0.48);
  return fall * 0.28 + low * 0.5;
});

writeWav("start", 0.42, (time, duration) => {
  const toneA = sine(220 + time * 180, time) * envelope(time, duration, 0.01, 0.2);
  const toneB = sine(330 + time * 260, time) * envelope(time, duration, 0.01, 0.22);
  return toneA * 0.22 + toneB * 0.24;
});

writeWav("ui_toggle", 0.11, (time, duration) => {
  const click = triangle(760 - time * 1100, time) * envelope(time, duration, 0.001, 0.055);
  return click * 0.34;
});

writeWav("blast", 0.58, (time, duration) => {
  const boom = sine(96 - time * 90, time) * envelope(time, duration, 0.004, 0.36);
  const rune = sine(680 + time * 620, time) * envelope(time, duration, 0.008, 0.24);
  const grit = (random() * 2 - 1) * envelope(time, duration, 0.001, 0.18);
  return boom * 0.62 + rune * 0.12 + grit * 0.1;
});

writeWav("dungeon_ambience", 12, (time, duration) => {
  const loopFade = Math.sin((Math.PI * time) / duration) ** 0.35;
  const drone = sine(55, time) * 0.38 + sine(82.5, time) * 0.22 + sine(110, time) * 0.12;
  const pulse = Math.sin(Math.PI * 2 * (time / 3)) > 0.92 ? sine(146.83, time) * 0.12 : 0;
  const air = (random() * 2 - 1) * 0.018;
  return (drone + pulse + air) * loopFade * 0.42;
});

console.log(`Generated sound effects in ${outputDir}`);
