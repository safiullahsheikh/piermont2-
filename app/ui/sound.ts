// Opt-in gallery room tone, synthesised: brown noise through a low-pass, breathing slowly.
// No audio files to download; nothing plays until the visitor asks for it.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function build() {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const len = ctx.sampleRate * 4;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const noise = Object.assign(ctx.createBufferSource(), { buffer: buf, loop: true });
  const lp = Object.assign(ctx.createBiquadFilter(), { type: "lowpass" as BiquadFilterType });
  lp.frequency.value = 420;
  const breath = ctx.createOscillator();
  const depth = ctx.createGain();
  breath.frequency.value = 0.07;
  depth.gain.value = 120;
  breath.connect(depth).connect(lp.frequency);
  noise.connect(lp).connect(master);
  // A faint mains hum from the gallery lights.
  const hum = Object.assign(ctx.createOscillator(), { type: "sine" as OscillatorType });
  hum.frequency.value = 55;
  const humGain = ctx.createGain();
  humGain.gain.value = 0.012;
  hum.connect(humGain).connect(master);
  noise.start(); breath.start(); hum.start();
}

export function setSound(on: boolean) {
  if (on && !ctx) build();
  if (!ctx || !master) return;
  if (on) ctx.resume();
  master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.6);
}
