# Personal projects: approved privacy-safe portfolio update

## Goal

Show the problems these personal projects solve. Do not publish a deployment inventory or instructions for finding the services.

This document records the approved scope and its implementation. Milestone months come from the owner or surviving metadata. Missing dates remain unknown.

## Confirmed scope

- Local Assistant is Moritz's locally running Hermes agent. It is not a separate, unknown project.
- The owner confirmed that Local Assistant is exposed through Open WebUI, installed as a PWA on their phone. It provides mobile access to their personal assistant and supports remote server troubleshooting. Do not publish the access route, service address, permissions, or tool configuration.
- Hetzner is used only for encrypted backup. It is not an application-hosting project.
- The read-only server inspection confirmed the presence of the requested self-hosted applications. No server configuration changed.

## Publication rules

Apply these rules to text, links, screenshots, videos, HTML source, filenames, metadata, and exported assets:

- Do not include service addresses, domains, IP addresses, ports, or QR codes that resolve to services.
- Do not include exact versions, container names, personal instance names, host aliases, or deployment paths.
- Do not show access routes, network topology, tunnel configuration, authentication settings, or administration screens.
- Do not show backup destinations, account identifiers, schedules, retention settings, encryption configuration, or recovery material.
- Do not expose private chats, photographs, device identities, room names, presence, or household routines.
- Do not add public links to the live applications.
- Use generic product names and problem-focused descriptions. Do not map products to their actual hosts.
- Use clearly labelled illustrations or isolated synthetic demos. Check every frame before publication.

The previously collected inventory is reduced to a high-level summary. It must not become a public deployment map.

## Recommended entries

### 1. Local Assistant

**Proposed ID:** `local-assistant` · **Category:** sidequest initially

**Short copy:** “A personal AI assistant that grows with how I use it. I can ask questions, work with my documents, and program or debug remotely from my phone.”

**Expanded copy:** “I run a personal Hermes assistant with an Open WebUI progressive web app on my phone. It helps me ask questions, interact with personal documents, and program or troubleshoot when I am away. OpenRouter lets me choose between model providers rather than depend on one vendor.”

**Tags:** AI Agents, Hermes, Open WebUI, OpenRouter, Self-Hosting

**Owner-confirmed milestone:** November 2026.

The owner describes an assistant that learns from interactions and gains capabilities over time. Do not invent its memory mechanism, training method, measured improvement, or autonomy. Do not infer unrestricted access, automatic remediation, or approval-free changes.

**Privacy boundary:** Local hosting and local document storage do not mean that inference stays local. OpenRouter and the selected model providers may receive prompts, tool results, or document excerpts. The owner expects that document excerpts leave the system, but did not confirm the exact behavior. The actual data flow was not inspected. Do not publish “everything stays on my system,” “offline,” or “no third-party access” as verified claims.

**Media:** An editorial illustration labelled “Illustrative · not a live screen.” A later demo can use an isolated synthetic task without service addresses or personal data.

### 2. Home Automation

**Proposed ID:** `home-automation` · **Category:** sidequest

**Short copy:** “One app instead of many. Home Assistant connects everyday devices so I can automate across products and integrations.”

**Owner-confirmed purpose:** Combine lighting, power, cleaning, media, and household functions instead of switching between vendor apps. Keep the public description at this broad level. Do not publish a device inventory, antenna models, routines, security systems, presence, or the home layout.

**Tags:** Home Automation, Home Assistant, Cross-Platform Integration

**Owner-confirmed milestone:** September 2026 for the new home. Earlier experiments occurred approximately in 2025. The earlier month is unknown, so do not insert a fabricated month into the timeline.

The owner confirmed that “agent tracking” means cost and token usage tracking. It does not mean location or occupancy tracking. Mention usage visibility without publishing account identifiers, actual spending, model traffic, or dashboard endpoints.

**Media:** An illustrative cover. Do not capture the live home dashboard.

### 3. Private Photo Library

**Proposed ID:** `private-photo-library` · **Category:** sidequest

**Short copy:** “My own photo library with Immich, without a recurring cloud storage subscription.”

**Owner-confirmed purpose:** Own and control personal photo storage rather than depend on a subscription plan. Do not claim unlimited capacity, zero operating costs, or no software limitations.

**Evidence-supported milestone:** January 2025. Surviving database history, account-creation timestamps, library ingestion timestamps, and storage metadata agree on activity that month. This supports “Photo library in use by January 2025.” It does not prove there was no earlier installation, import, or deleted history. Do not publish exact timestamps or use photo capture dates as deployment dates.

**Tags:** Immich, Self-Hosting, Photo Management

Do not claim hardware acceleration, recognition quality, or backup coverage without evidence.

**Media:** An illustrative cover. Any later demo needs a separate synthetic library with non-personal licensed images.

### 4. Personal Homelab — refresh the existing entry

**Keep existing ID:** `homelab-cm3588` · **Category:** sidequest

**Proposed public title:** “Personal Homelab”

**Short copy:** “A hands-on environment for learning self-hosting, storage, and network tools.”

**Tags:** Self-Hosting, Storage, Docker

Mention AdGuard or Open WebUI as generic learning topics if useful. Do not publish a complete service list, host mapping, access setup, or capacity details.

Remove stale current-service claims. Do not describe services as publicly protected or inaccessible based only on a container inspection.

**Media:** An editorial illustration, not an administration screenshot or infrastructure diagram.

### 5. Encrypted Backup — a supporting sidequest

**Proposed ID:** `encrypted-backup` · **Category:** sidequest, or a short homelab highlight

**Recommended short copy:** “Encrypted off-site backup for personal data.”

The owner confirmed Hetzner as the provider. The public copy does not need to name it. Do not present this as cloud application hosting.

**Owner-confirmed milestone:** October 2026.

**Owner-confirmed purpose:** Support a 3-2-1 backup strategy and protect the confidentiality of off-site copies through encryption. The complete copy count, media separation, key handling, and restore process were not inspected. Do not claim a verified 3-2-1 implementation or successful restores.

Encryption protects confidentiality when it is correctly implemented and the keys remain protected. Avoid the absolute claim that “nobody can read it.”

**Media:** An abstract illustration. Never show backup software configuration, destinations, logs, keys, or account details.

### 6. Network Segmentation — homelab highlight

**Proposed short copy:** “I use network segmentation to separate connected devices, self-hosted services, and everyday computing.”

The owner confirms UniFi gateways and multiple VLANs. Public copy should explain the purpose, not the implementation. Do not publish topology, VLAN identifiers, subnet ranges, equipment placement, policies, or management details. Segmentation alone is not proof of complete isolation or security.

Keep this as a homelab highlight unless a separate story justifies another card. The owner confirmed September 2026 as the milestone month. A read-only browser check reached the authenticated UniFi console and confirmed a network-management interface. It did not validate segmentation policies, isolation, or firewall behavior. No console details or identifiers belong in public artifacts.

## Timeline proposal

Keep existing milestone dates unless the owner corrects them. The following months come from the owner, not container timestamps.

| Milestone | Proposed project link | Date and evidence |
|---|---|---|
| Local Assistant | `local-assistant` | November 2026 — owner confirmed |
| Home Automation for the new home | `home-automation` | September 2026 — owner confirmed |
| Earlier home automation experiments | Same project, supporting prose | Approximately 2025 — month unknown, no separate dated event |
| Private Photo Library | `private-photo-library` | January 2025 — earliest surviving deployment and use metadata; describe as “in use by” |
| Encrypted Backup | `encrypted-backup`, if separate | October 2026 — owner confirmed |
| Network segmentation | Homelab highlight | September 2026 — owner confirmed |

Use the existing Personal branch. Do not infer project start dates from container creation, restart, or observation times. A surviving database's earliest insertion date can establish activity by a date, not necessarily first deployment.

## Media audit

- The existing portfolio screenshot shows the previous layout and calls the previous employer current. It is visibly stale.
- A new Playwright capture is saved as `public/images/portfolio-current.png`. It shows only the current public portfolio design.
- The old portfolio video predates the redesign. Its full content was not reviewed.
- The project renderer currently ignores the `video` field. A new video needs shared playback support before it can appear.
- Four new conceptual covers are saved as `public/images/local-assistant.png`, `public/images/home-automation.png`, `public/images/private-photo-library.png`, and `public/images/personal-homelab.png`. All four were visually checked. Each is labelled “Illustrative · not a live screen.” Their source is `public/previews/self-hosted-services.html`. No live applications were captured.
- GPT image generation is unavailable in this session. Browser screenshots are the available fallback.

Screenshots are sufficient for the initial proposal. Do not record live personal applications merely to fill a media slot.

## Implemented

- Added three sidequests with complete English and German text: Local Assistant, Home Automation, and Private Photo Library.
- Refreshed Personal Homelab and Portfolio Website, including their media.
- Added five Personal timeline milestones with the confirmed months and project links. Backup and network segmentation link to Personal Homelab.
- Kept earlier home automation experiments as approximate supporting prose, without inventing a month.
- Added all new projects to the visible order. Removed the hardcoded project count.
- Removed the obsolete portfolio video reference. No video playback feature was added because screenshots satisfy the approved media scope.
- Updated the content check to allow personal milestones after the current professional role.
- Added regression checks for dates, translations, IDs, links, media paths, and operational-detail exclusion.

## Validation and limits

The content check, 15 tests, TypeScript check, and production build pass. Browser checks covered all five updated project dialogs at desktop and mobile widths, seven Personal milestones, image loading, links, ordering, and horizontal overflow. No page errors occurred.

Personal project entries have no live-service links, addresses, ports, exact versions, or infrastructure identifiers. The conceptual covers contain no real application data. The source and built personal entries were checked for operational details.

Server inspection remained read-only. Project and timeline changes are local and are not pushed or published. Application security, backup restore success, network isolation, and exact external-model data handling were not tested.
