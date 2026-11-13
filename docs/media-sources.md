# Media sources and provenance

This file records where the personal-project card images come from, what
reuse rights apply, and what was checked for local review. It covers the
four files `public/images/home-automation.png`,
`public/images/local-assistant.png`, `public/images/private-photo-library.png`,
and `public/images/personal-homelab.png`, plus their sources under
`public/previews/`.

Two cards use public demo captures. One card, `local-assistant.png`, uses a
capture of the portfolio owner's own Open WebUI instance. That capture was
made with the owner's authorization, and it was redacted before capture (see
below). The homelab montage combines the public demo captures with that
redacted personal capture. Not every screenshot is a public demo, and not
all publication rights are cleared; see "Review status" and "License and
reuse uncertainty".

## Review status

The owner authorized publication of this revision. That approval does not
establish third-party reuse permission. Home Assistant logo terms and the
reuse terms of the public demo photographs remain unresolved. The former Open
WebUI documentation screenshot was removed from this repository together
with its documentation-image reuse question. The current Open WebUI imagery
is the owner-authorized personal capture described below. Application UI
and branding terms still need review. Product names and logos in all four cards are used to identify
the products in question; the projects' trademark terms still apply, and no
permission from the projects is claimed. Do not treat a public download or
software license as permission to reuse every image. Keep these caveats
until the applicable terms are checked or the affected assets are replaced.

## General provenance

- Two source captures come from official public sources: the Home Assistant and
  Immich public demo instances. One capture shows the portfolio owner's own
  Open WebUI instance and was made by the assistant with the owner’s authorization.
- The public demo captures touch no private server, tenant, session, browser
  profile, chat, document, photo library, home dashboard, or network console.
  No private service address was looked up.
- The personal Open WebUI capture was redacted before capture: the sidebar,
  the chat history, the account details, and unknown text and images were
  hidden first, and only then was the screenshot taken. The redaction is not
  a reversible blur applied afterwards. No raw unredacted capture exists in
  this repository, and the instance address is not recorded in any
  repository file.
- The shown application content comes from the projects' public demos or,
  for Open WebUI, from an empty new-chat screen in the owner's instance: a dark chat surface
  with the default input area only. No image shows private owner data.
- Composites crop and resize the redacted or public screenshots, then add
  backgrounds, product logos, and provenance labels. No image model
  generated any image.
- Each image passed an on-screen inspection before acceptance. The checks
  covered faces, personal names, e-mail addresses, phone numbers,
  hostnames, private IP addresses, real identifiers, and personal
  application data. The personal capture was additionally checked for
  history entries, account details, and other unknown text.
- Capture date of the public demos and the owner-authorized personal
  screenshot: 2026-11-12.

## Per-image sources

| Image | Subject | Source | Method | Label |
|---|---|---|---|---|
| `home-automation.png` | Home Assistant dashboard | `https://demo.home-assistant.io/` (official public demo, `#/lovelace` dashboard) | Live capture: fresh browser context, viewport 1022x640 CSS at 2x scale, en-US locale. Full-frame resize to 1188x744. | "Public demo UI" |
| `local-assistant.png` | Open WebUI chat interface (owner's own instance, dark theme) | Owner-authorized capture of the owner's own Open WebUI instance; the instance address is not recorded in this repository | Assistant captured the owner-authorized instance after the owner signed in. The sidebar, chat history, account details, and unknown text/images were hidden before capture. Stored as `sources/open-webui-personal-redacted.png` (1398x876). Used unchanged except resize to 1188x744. | "Personal instance · history hidden" |
| `private-photo-library.png` | Immich photo timeline | `https://demo.immich.app/` (official public demo, entered through the page's own "Login as demo user" button) | Live capture: fresh browser context, viewport 1300x814 CSS at 2x scale, en-US locale. Cropped (1112, 200, 1328x832) into `sources/immich-demo-timeline-2x.png`, then resized to 1188x744. The crop excludes photos with visible faces and the sidebar with its user name. | "Public demo UI" |
| `personal-homelab.png` | Montage of two public demo captures plus the redacted personal Open WebUI capture | Home Assistant and Immich sources as above; Open WebUI as `local-assistant.png` | Composed from three portrait strips (crop and resize only): the Home Assistant capture (0, 0, 516x788), the Immich capture (0, 0, 498x760, kept as `sources/immich-demo-sidebar-2x.png`), and the redacted personal capture, center-cropped on the input area (scale 0.45: the full 1398x876 source height shown letterboxed on the source background `#161616`, visible source region 800x876 centered on the input box). The first two strips keep their in-image product branding; the Open WebUI redaction removed in-image branding, so that strip carries an official Open WebUI logo badge. | "Public demos + redacted personal screenshot" |

## Personal Homelab gap report

The Personal Homelab card needs a network-product screenshot with zero
operational details. Findings on 2026-11-12:

- AdGuard Home (the homelab's network-filtering product) has no live public
  demo instance. The official UI animation linked from the project README
  (`https://cdn.adtidy.org/public/Adguard/Common/adguard_home.gif`) shows a
  private IP address, client IP addresses, and an exact version number.
  The publication rules exclude that content, so the animation is
  unusable.
- Other network-product demo sites (for example vendor demo controllers)
  stayed unused. The approved direction asks for a meaningful product
  match. No safe, relevant network screenshot was selected for this preview.

The card therefore uses the recommended
fallback: a montage of the two safe public demo screenshots and the
redacted personal Open WebUI capture, labelled
"Public demos + redacted personal screenshot". It represents the homelab's
everyday self-hosted services without any operational detail. A future
replacement would need an official public product screenshot with no
addresses, client identifiers, or version numbers.

## Logos

| File | Source |
|---|---|
| `logos/logo-home-assistant.svg` | Official brand asset: `https://github.com/home-assistant/assets`, `logo/home-assistant-logo.zip`, file `home-assistant-logomark-color-on-light.svg` |
| `logos/logo-immich-inline-light.svg` | Official brand asset: `https://github.com/immich-app/immich`, `design/immich-logo-inline-light.svg` |
| `logos/logo-open-webui.png` | Official asset: `https://github.com/open-webui/open-webui`, `backend/open_webui/static/logo.png`. Used on the `local-assistant.png` label and on the homelab montage's Open WebUI strip badge. |

Product names and logos are trademarks of their projects. This portfolio
uses them only to identify the products in question. This portfolio is not
affiliated with, endorsed by, or sponsored by these projects.

## License and reuse uncertainty

- Home Assistant: the demo screenshot comes from software licensed under
  Apache-2.0 (home-assistant/frontend). The brand asset repo carries no
  explicit license file. Brand guidelines govern logo use.
- Immich: the demo screenshot comes from AGPL-3.0 software. The logo comes
  from the same AGPL-3.0 repository.
- Open WebUI: the current Open WebUI imagery is a capture of the portfolio
  owner's own instance, made with the owner's authorization. It replaces
  the third-party documentation screenshot. That authorization does not
  establish permission to reuse the project's interface or branding.
  Applicable project terms still need review before publication.
- No separate permission to redistribute the public demo captures was
  obtained. The public demo photographs may have rights separate from the
  application software. Their source and reuse terms also need review
  before publication.

## How to regenerate

1. Capture the two public demo screenshots with a clean browser profile:
   - Home Assistant: open `https://demo.home-assistant.io/`, viewport
     1022x640 CSS, device scale factor 2, locale en-US, save as
     `sources/home-assistant-demo-2x.png`.
   - Immich: open `https://demo.immich.app/`, use the page's "Login as
     demo user" button, viewport 1300x814 CSS, device scale factor 2,
     locale en-US.
2. Cut the crops listed in the per-image table above into the source
   files under `sources/` (render each crop region at 1:1 scale in a
   browser and screenshot it; do not rely on `sips --cropOffset`, which
   center-crops and ignores the offset).
3. The personal Open WebUI capture cannot be re-created from a public
   source. If it must be replaced, the owner captures a fresh screenshot of
   their own instance, with the sidebar, chat history, account details, and
   unknown text/images hidden before capture (dark theme), and stores only
   that redacted file as `sources/open-webui-personal-redacted.png`
   (1398x876). Never store an unredacted capture or the instance address in
   this repository.
4. Open each `compose-*.html` in this directory in a browser at a
   1188x744 viewport and screenshot the `#frame` element into the matching
   path under `public/images/`.
5. Re-inspect the results on screen against the checks listed under
   "General provenance" before publishing. The personal capture must show
   no history entries, account details, or other unknown text.

## Motion release candidate: anonymised personal Home Assistant

The owner approved these visuals and their integration into the portfolio.
Deployment remains pending. The original project image files remain unchanged.
Cards and dialogs use matching first-frame clip posters as their static fallbacks.
Visible clips play automatically, except for reduced-motion or data-saving
preferences and explicit pauses.

The owner requested the actual dark interface, not the earlier schematic.
After reviewing blur, the owner suggested a different apartment in the same
visual style. The replacement plan is sharp because its geometry is fictional.

At the owner's request, a read-only SSH inspection accessed the container's
static floorplan assets. Only colours and drawing styles informed the new SVG.
No original wall positions, room labels, dimensions, or device data were copied.
The new single-level apartment does not describe the owner's property.

The current 16-second study uses the actual Home Assistant frontend and the
owner's original custom dashboard components, not recreated device controls.
The original shutter icons, shutter-control sheet, and cleaner/media/kitchen
panel run unchanged. A read-only copy of the current dashboard configuration
provides their structure. Its entity identifiers become demo aliases. The
floorplan image and icon positions use the fictional apartment.

A fresh, isolated browser uses fake credentials and a simulated WebSocket
backend. All states and attributes are generated locally. Only static frontend
assets use read-only HTTP GET. The browser blocks HTTP writes, real REST APIs,
authentication endpoints, foreign origins, and original floorplan images.
WebSocket frames never reach a real server. No original account, device state,
or sensor reading is copied into the recording. A privacy gate checks rendered
text, card configuration, image sources, and state identifiers before capture.

Actual clicks toggle a bulb, operate the native shutter sheet, start and dock
the cleaner, and inspect the kitchen and media tabs. The native kitchen panel
shows illustrative values, not invented appliance-control capabilities. The
opening and closing frames match. No server files, settings, preferences, or
real devices were changed. The existing browser was not used for the recording.

- Fictional drawing: `public/motion/sources/home-assistant-fictional-floorplan.svg`.
- Entry point: `scripts/motion/home-assistant.cjs`.
- Native recorder: `scripts/motion/native-home-assistant.mjs`.
- Simulated backend: `scripts/motion/native-ha-backend.mjs`.
- Outputs: `public/motion/homelab-cm3588.{mp4,gif,jpg}`.
- Reproduction requires private, authorised configuration inputs and read-only
  frontend asset access. See `scripts/motion/README.md`. Do not commit private
  inputs or credentials. The runtime does not use the earlier redacted PNG
  or the retired SVG device animation.

The research and patent motion studies keep a fixed camera. They add travelling
highlights to existing diagram connections, signals, or logo strokes. The Thoraxmonitor
study expands and contracts the original illustrated lung pixels inside the torso.
The respiratory study uses the lower Monte Carlo dropout figure. For each time
step, the subnetworks run together. Their outputs combine at the existing
Prediction marker, which represents the median. Only then does one prediction
point appear on the original predicted-flow curve. The measured-flow curve
remains a reference. Printed curves, uncertainty bands, values, and inactive
neurons remain unchanged. The animation explains this sequence with illustrative
samples. These studies add no measured data, clinical results, generated model
response, or patent-mechanism claim. Their on-image labels identify them as illustrative. Existing image,
interface, and logo reuse uncertainties remain; the owner's approval of a local
study does not establish third-party reuse rights.

### Research-image reuse status

`public/motion/sources/tedias-ahead.jpg` is a build input copied from the public
Fraunhofer DARIAN project page linked by the portfolio. It supplies the original
architecture diagram for the derived animation and poster. Public availability
does not establish redistribution or adaptation permission. The applicable
image-reuse terms remain unverified. The owner's approval does not remove
this third-party rights uncertainty.
