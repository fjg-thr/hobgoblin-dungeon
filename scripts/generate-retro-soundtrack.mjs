import { writeFile } from "node:fs/promises";

const sampleRate = 22050;
const bpm = 132;
const beatSeconds = 60 / bpm;
const bars = 16;
const beatsPerBar = 4;
const totalBeats = bars * beatsPerBar;
const totalSeconds = totalBeats * beatSeconds;
const sampleCount = Math.floor(totalSeconds * sampleRate);
const output = new Float32Array(sampleCount);

const melody = [
  "D5", null, "F5", "G5", "A5", null, "G5", "F5",
  "D5", "F5", "A5", null, "C6", "A5", "G5", null,
  "C5", null, "E5", "G5", "Bb5", null, "A5", "G5",
  "F5", "G5", "A5", null, "D6", "C6", "A5", null
];
const bass = ["D2", "D2", "C2", "C2", "Bb1", "Bb1", "A1", "A1"];
const arp = ["D4", "F4", "A4", "C5", "F4", "A4", "C5", "A4"];

const noteSemitones = {
  C: -9,
  "C#": -8,
  Db: -8,
  D: -7,
  "D#": -6,
  Eb: -6,
  E: -5,
  F: -4,
  "F#": -3,
  Gb: -3,
  G: -2,
  "G#": -1,
  Ab: -1,
  A: 0,
  "A#": 1,
  Bb: 1,
  B: 2
};

function frequency(note) {
  const match = /^([A-G][#b]?)(-?\d)$/.exec(note);
  if (!match) {
    throw new Error(`Bad note: ${note}`);
  }
  const [, name, octaveText] = match;
  const octave = Number(octaveText);
  const semitone = noteSemitones[name] + (octave - 4) * 12;
  return 440 * 2 ** (semitone / 12);
}

function envelope(localT, duration, attack = 0.012, release = 0.055) {
  if (localT < 0 || localT >= duration) {
    return 0;
  }
  const attackGain = Math.min(1, localT / attack);
  const releaseGain = Math.min(1, (duration - localT) / release);
  return Math.max(0, Math.min(attackGain, releaseGain));
}

function square(phase, duty = 0.5) {
  return phase % 1 < duty ? 1 : -1;
}

function triangle(phase) {
  return 1 - 4 * Math.abs(Math.round(phase - 0.25) - (phase - 0.25));
}

function addNote({ note, startBeat, lengthBeats, volume, wave = "square", duty = 0.5, detune = 0 }) {
  if (!note) {
    return;
  }
  const freq = frequency(note) * 2 ** (detune / 1200);
  const start = Math.floor(startBeat * beatSeconds * sampleRate);
  const duration = lengthBeats * beatSeconds;
  const end = Math.min(sampleCount, start + Math.floor(duration * sampleRate));
  for (let i = start; i < end; i += 1) {
    const t = (i - start) / sampleRate;
    const phase = freq * t;
    const sample = wave === "triangle" ? triangle(phase) : square(phase, duty);
    output[i] += sample * volume * envelope(t, duration);
  }
}

function addNoiseHit(startBeat, lengthBeats, volume, tone = 0.18) {
  let seed = Math.floor(startBeat * 9973) + 17;
  const start = Math.floor(startBeat * beatSeconds * sampleRate);
  const duration = lengthBeats * beatSeconds;
  const end = Math.min(sampleCount, start + Math.floor(duration * sampleRate));
  let last = 0;
  for (let i = start; i < end; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const noise = ((seed / 0xffffffff) * 2 - 1) * (1 - tone) + last * tone;
    last = noise;
    const t = (i - start) / sampleRate;
    output[i] += noise * volume * envelope(t, duration, 0.002, duration * 0.72);
  }
}

for (let beat = 0; beat < totalBeats; beat += 0.5) {
  const melodyNote = melody[Math.floor(beat / 0.5) % melody.length];
  addNote({
    note: melodyNote,
    startBeat: beat,
    lengthBeats: melodyNote ? 0.42 : 0,
    volume: 0.12,
    wave: "square",
    duty: 0.38
  });
}

for (let beat = 0; beat < totalBeats; beat += 1) {
  addNote({
    note: bass[Math.floor(beat / 2) % bass.length],
    startBeat: beat,
    lengthBeats: 0.72,
    volume: 0.16,
    wave: "square",
    duty: 0.52
  });
}

for (let beat = 0; beat < totalBeats; beat += 0.25) {
  addNote({
    note: arp[Math.floor(beat / 0.25) % arp.length],
    startBeat: beat,
    lengthBeats: 0.16,
    volume: 0.055,
    wave: "triangle"
  });
}

for (let beat = 0; beat < totalBeats; beat += 1) {
  addNoiseHit(beat, 0.09, beat % 4 === 0 ? 0.16 : 0.065, 0.08);
}

for (let beat = 1; beat < totalBeats; beat += 2) {
  addNoiseHit(beat, 0.18, 0.075, 0.46);
}

for (let i = 0; i < sampleCount; i += 1) {
  const t = i / sampleRate;
  const barPosition = (t / beatSeconds) % beatsPerBar;
  const pulse = barPosition < 0.15 ? 0.96 : 1;
  const loopFade = Math.min(1, i / (sampleRate * 0.04), (sampleCount - i) / (sampleRate * 0.08));
  output[i] = Math.max(-0.92, Math.min(0.92, output[i] * pulse * loopFade));
}

const bytesPerSample = 2;
const dataSize = sampleCount * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
buffer.writeUInt16LE(bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

for (let i = 0; i < sampleCount; i += 1) {
  const quantized = Math.round(output[i] * 48) / 48;
  buffer.writeInt16LE(Math.round(quantized * 32767), 44 + i * bytesPerSample);
}

await writeFile("public/assets/audio/retro_dungeon_theme.wav", buffer);
