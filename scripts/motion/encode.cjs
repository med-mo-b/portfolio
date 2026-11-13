// Shared local-only media tools. No private browser profiles or remote model calls.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const WIDTH = 1188, HEIGHT = 744, FPS = 25, FRAMES = 100;

// duration defaults to the historic four seconds; existing two-argument callers keep
// exactly the old behaviour. gifEvery samples every nth frame into the GIF (the default
// 2 keeps the old 80 ms delay) and gifColours the GIF palette size (default 192); duration
// must make the GIF frame count a whole number.
async function encodeFrames(dir, outputBase, duration = 4, gifEvery = 2, gifColours = 192) {
  const frameCount = FPS * duration;
  const files = fs.readdirSync(dir).filter(name => /^frame_\d{6}\.jpg$/.test(name)).sort();
  assert.equal(files.length, frameCount, `Each loop needs exactly ${frameCount} frames.`);
  assert.equal(frameCount % gifEvery, 0, 'The GIF must sample a whole number of frames.');
  const first = await sharp(path.join(dir, files[0])).metadata();
  assert.equal(first.width, WIDTH);
  assert.equal(first.height, HEIGHT);
  fs.mkdirSync(path.dirname(outputBase), { recursive: true });
  fs.writeFileSync(path.join(dir, 'frames.txt'), files.map((name, i) => `${name} ${i / FPS}`).join('\n'));
  const executable = path.join(os.tmpdir(), 'portfolio-motion-encoder');
  const source = path.join(__dirname, 'encode.swift');
  if (!fs.existsSync(executable) || fs.statSync(executable).mtimeMs < fs.statSync(source).mtimeMs) {
    execFileSync('swiftc', [source, '-o', executable], { stdio: 'inherit' });
  }
  execFileSync(executable, [dir, `${outputBase}.mp4`, String(FPS)], { stdio: 'inherit' });
  const gifDelay = (1000 * duration) / (frameCount / gifEvery);
  const frames = [];
  for (let i = 0; i < files.length; i += gifEvery) {
    frames.push(await sharp(path.join(dir, files[i])).resize(792, 496).removeAlpha().raw().toBuffer());
  }
  await sharp(Buffer.concat(frames), { raw: { width: 792, height: 496 * frames.length, channels: 3, pageHeight: 496 } })
    .gif({ loop: 0, delay: Array(frames.length).fill(gifDelay), colours: gifColours, effort: 4, dither: 0.1 })
    .toFile(`${outputBase}.gif`);
  fs.copyFileSync(path.join(dir, files[0]), `${outputBase}.jpg`);
  const gif = await sharp(`${outputBase}.gif`, { animated: true }).metadata();
  assert.ok(gif.pages > 1, 'The GIF must contain motion.');
  assert.equal(gif.delay.reduce((sum, ms) => sum + ms, 0), duration * 1000, `GIF duration must be ${duration} seconds.`);
  assert.equal(gif.loop, 0, 'GIF must loop.');
  return { seconds: duration, width: WIDTH, height: HEIGHT, gifWidth: 792, gifHeight: 496, mp4Bytes: fs.statSync(`${outputBase}.mp4`).size, gifBytes: fs.statSync(`${outputBase}.gif`).size };
}

// Record real browser frames for the given number of seconds (default four), then repeat
// frames as needed at 25 fps.
async function captureFrames(page, dir, actions, duration = 4) {
  fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', event => {
    frames.push({ time: event.metadata.timestamp, data: Buffer.from(event.data, 'base64') });
    cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});
  });
  try {
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: WIDTH, maxHeight: HEIGHT, everyNthFrame: 1 });
    const start = Date.now();
    await sleep(250);
    await actions();
    const remaining = duration * 1000 - (Date.now() - start);
    assert.ok(remaining >= 0, `Actions exceed the ${duration}-second capture window.`);
    await sleep(remaining);
    await cdp.send('Page.stopScreencast');
  } finally {
    await cdp.detach();
  }
  assert.ok(frames.length > 1, 'No real UI motion captured.');
  const firstTime = frames[0].time;
  let index = 0;
  for (let i = 0; i < FPS * duration; i++) {
    while (index + 1 < frames.length && frames[index + 1].time - firstTime <= i / FPS) index++;
    const buffer = await sharp(frames[index].data).resize(WIDTH, HEIGHT).jpeg({ quality: 92 }).toBuffer();
    fs.writeFileSync(path.join(dir, `frame_${String(i).padStart(6, '0')}.jpg`), buffer);
  }
}
module.exports = { encodeFrames, captureFrames, sleep, WIDTH, HEIGHT, FPS, FRAMES };
