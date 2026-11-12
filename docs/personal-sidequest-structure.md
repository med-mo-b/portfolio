# Personal sidequests: a smaller set of project cards

Status: approved and implemented locally. The Work page shows eight project cards, and the Home Automation and Private Photo Library timeline events open Personal Homelab. The sections below keep the earlier options and reasoning as history.

## What a reader needs (history)

The Work section should show what I worked on and why it mattered. Four homeserver cards repeated part of the same story. Personal Homelab already mentioned the photo library, home automation, network separation, and backup.

Local Agent has a different focus: using Hermes through a phone PWA, working with questions and documents, remote programming, provider choice, and usage costs. It also connects directly to the AI work elsewhere on the site.

## Options (history, before approval)

| Option | Result | Trade-off |
| --- | --- | --- |
| Keep everything separate | 10 project cards; four concern the homeserver | Each service is easy to find, but the homelab introduction repeats its neighbours. |
| Put all homeserver work in Personal Homelab | 7 project cards | Less repetition, but the assistant becomes harder to find inside a much broader project. |
| Keep Local Agent separate; combine the other homeserver work | 8 project cards | Two clearer stories: personal AI, and running services for daily use. Photos and automation lose standalone project dialogs. |

## Decision (approved)

The third option was approved. **Local Agent** stays separate as the personal AI story. **Portfolio Website** stays separate too, because it is not a homeserver project. The other homeserver work lives in Personal Homelab.

Personal Homelab carries readable paragraphs about the reasons for running these services: managing a photo library without a recurring cloud-storage subscription, bringing home controls into one app, and learning to maintain the services underneath. Network segmentation and encrypted off-site backup are part of that maintenance story.

The homelab card keeps its existing montage image. The image must not imply that a public demo shows the owner's devices, photos, configuration, or service versions, and the owner's own photos stay out of the portfolio.

## Implemented change (this worktree)

- Personal Homelab folds in the photo library and home automation content in its own text, in English and German. Its image stays the existing montage at `/images/personal-homelab.png`.
- The standalone Home Automation and Private Photo Library project objects were removed from `src/data/projects.ts`. Their tech tags for Immich and Home Assistant moved into the homelab card.
- All seven Personal timeline milestones keep their IDs, dates, titles, descriptions, and tags in `src/data/timeline.ts`. The Home Automation and Private Photo Library events now link to `homelab-cm3588`.
- `src/site.ts` lists eight projects in its visible order.
- `tests/personal-projects.test.ts` covers the eight cards, the seven milestones, the redirected links, the removed standalone cards, and the privacy and Local Agent rules.

This needed no nested-project feature.

## Kept limits

Exact dates stay as written. The photo library was in use by January 2025, with no exact first-installation date. Home Assistant moved into the setup for the new home in September 2026, after experiments around 2025. The backup entry stays a milestone, not a proven restore. The network description stays at its public level. Local Agent keeps its text and image unchanged, including the note about what may be sent to external model providers.
