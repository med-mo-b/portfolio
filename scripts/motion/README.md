# Project motion clips

Eight silent loops: five last four seconds. The Monte Carlo loop lasts six seconds and shows twelve smaller time steps. The Home Assistant interaction lasts
16 seconds. The portfolio browsing loop lasts 12 seconds. It explores only
a small part of the page instead of scrolling through the full site. Matching first-frame posters provide static fallbacks. Original project image files remain unchanged.
The owner approved integration. Deployment remains a separate approval.

- `public/previews/project-motion.html`: local review gallery, MP4 previews,
  GIF downloads, and reduced-motion support.
- `public/motion/`: eight MP4s, eight GIFs, posters, and source manifests.
- Real UI recording: the local portfolio and the actual Home Assistant frontend.
  Home Assistant loads the owner's original native/custom components for the
  floorplan icons, shutter sheet, and cleaner/media/kitchen panel. A fictional
  apartment replaces the floorplan. Controls are repositioned for its rooms.
  Every device state is synthetic. A separate browser context uses fake
  credentials and a simulated WebSocket backend. No real device commands,
  original room geometry, or live values enter the recording.
- Illustrative motion: highlights move along existing diagram connections,
  respiration traces, cables, antennas, and EPO logo strokes. Original lung
  pixels expand and contract inside the illustrated torso. In the lower
  respiratory figure, the subnetworks run together for each time step. Their
  median is the existing Prediction marker, then one point on the predicted-flow
  curve. The measured-flow curve remains a reference.
  The camera stays fixed. Local Agent uses typing over the redacted source image.
  No model request, reply, measurement, or clinical result is invented.

## Website behavior

The eight project cards and their dialogs use `src/lib/project-media.ts`.
Muted loops start when their media boxes enter the viewport. No MP4 bytes load
before visibility. Offscreen clips, background tabs, and cards behind a dialog
stop and release their media resources. An explicit pause survives a language
re-render. Each card and dialog uses the corresponding clip's first-frame JPEG
as its poster and fallback. Posters and clips show the full frame without cropping.
Original project image files and project facts remain unchanged.

Reduced-motion and data-saving users receive the matching static poster by
default and can select **Play clip**. If the browser blocks automatic playback,
the visitor can retry with the play control. Unsupported formats and media
loading errors also keep the matching poster visible.

The website uses MP4s, not GIFs. The largest clip is the portfolio recording
(about 9.3 MB). Viewport gating avoids loading it before the visitor reaches it.
The standalone review gallery retains its own play/pause controls and downloads.

## Release checks

Run `bun test`, `bun scripts/content-check.mjs`, and
`./node_modules/.bin/tsc --noEmit`. Check a fresh production build, not a folder
with stale copied assets. `node scripts/media-browser-check.mjs` checks playback
cleanup and rejected-play fallbacks with the installed `playwright-cli`.
It starts its own local server and isolated browser session.

## Re-create

Use the existing Bun/Sharp installation and macOS Swift/AVFoundation. No
image-generation service, new package, or ffmpeg installation is needed.

1. Run `node scripts/motion/static.cjs` for the five static-image studies.
2. Set `PLAYWRIGHT_PATH` to an installed Playwright package. Keep the local
   portfolio preview running. Set `PORTFOLIO_URL` if needed. Run
   `node scripts/motion/ui.cjs portfolio-website` or `local-assistant`.
   For Home Assistant, also set `HA_ORIGIN` and `HA_PRIVATE_DIR` outside the
   repository. The private directory contains authorised read-only copies of
   `dashboard-original-parsed.json` and `resources-original.json`. Do not add
   these inputs to the repository. Run `node scripts/motion/ui.cjs homelab-cm3588`
   or `node scripts/motion/home-assistant.cjs`. Only static frontend assets use
   HTTP GET. WebSockets stay inside the simulated backend. HTTP writes, actual
   REST APIs, authentication endpoints, and real floorplan images are blocked.
   No real credentials, original browser profile, or real sensor values are used.
3. Apply the current scientific overlays: `node scripts/motion/flow.cjs`,
   `node scripts/motion/breathing.cjs --only thoraxmonitor`, and
   `node scripts/motion/monte-carlo.cjs`. The latter replaces the old upper-figure
   respiratory study with the requested lower Monte Carlo figure. It leaves
   measured curves, uncertainty bands, printed values, and inactive neurons intact.
   Its illustrative samples explain the parallel ensemble and median prediction,
   not new study results.
   `breathing.cjs --only respiratory-flow-reconstruction` delegates to this renderer.
4. Run `bun scripts/motion/manifest.ts` to check the GIFs and update the gallery.

The MP4s are 1188×744 at 25 fps. GIFs are 792×496, loop indefinitely, and
have the duration stated in each manifest entry. The portfolio capture starts
at the hero, scrolls into Journey, opens a real project dialog, pauses to inspect
it, continues briefly, and returns to the hero. The initial timeline selection
is restored before the loop repeats. Its GIF uses fewer frames than the MP4.
The website uses the pre-rendered MP4s and matching JPEG posters. The source
generators run locally and are not part of the deployed website runtime.

Existing interface, image, and logo reuse caveats still apply. See
`docs/media-sources.md`. New motion does not establish new reuse rights.
