# Elite Fit group classes: design concept chooser

| | |
| --- | --- |
| Version | **v1 rev 12, 5 Nov 2026** |
| What it is | The overview page for the Elite Fit group-class design concepts (`index.html` with `chooser/`). It shows five concepts as cards. Each card opens the concept, or opens it with a demo booking (`?class=boxercise-beginner`). |
| Status | Design concepts and demo bookings only. The pages carry `noindex, nofollow`. Nothing a visitor types leaves the browser. |
| Live page (after the ship) | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/ |
| Built by | Digital Movement |

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v1 | 27 Oct 2026 | First release: six cards, each with Open and Try the booking, staggered reveal, hover and press lift, no motion under reduced motion. |
| rev 2 | 27 Oct 2026 | Real screenshots replace the stock stand-ins (`chooser/thumbs/<id>-m.webp` phone view, `<id>-d.webp` desktop view). A "Best for" line on every card. The share image is a 3 x 2 grid of the screenshots. |
| rev 3 | 28 Oct 2026 | Two cards added at the top: Home v2 and Home v2a (booking-first). Eight cards. |
| rev 4 | 29 Oct 2026 | The Home card is removed at Raoul's request. Seven cards. |
| rev 5 | 29 Oct 2026 | Motion pass (native scroll only; reduced motion, Save-Data and no JS stay static), the first set of concept names, four columns from 1280 px. |
| rev 6 | 29 Oct 2026 | Home v2 becomes the recommended concept: a full-width card with a "Recommended" badge on top, the others under "Other concepts". |
| rev 7 | 29 Oct 2026 | The Home v2 card shows Home v2 itself (new thumbnails with both faces in frame). |
| rev 8 | 29 Oct 2026 | Ensemble (s1-stage) and Ground Floor (v1) leave the overview at Raoul's request. Five concepts remain; both pages and their URLs still work. |
| rev 9 | 29 Oct 2026 | New concept names (Raoul, 29 Oct): Warm, Upfront, Tactile, Loud, Glossy. Titles, descriptors, "Best for" lines and button labels changed. Folders, URLs, data-ids and test ids are unchanged. The layout is unchanged. |
| rev 10 | 29 Oct 2026 | The Recommended card (Warm) carries the Elite Fit terracotta accent (Raoul, 29 Oct): a #E94A2B border round the whole card (3 px from 641 px, 2 px below, no layout change) and a larger filled terracotta "Recommended" pill (white, 20 px Gilroy ExtraBold, 3.73:1, large text). Layout, copy, names, links and thumbnails are unchanged. |
| rev 11 | 29 Oct 2026 | Intro title card on load (Raoul, 29 Oct): the Digital Movement logo, then "Best on desktop screen for full design experience" as a motion graphic, then the selection as-is (3.4 s, skippable). Not on back/forward or when coming back from a concept; `?intro=1` forces it, `?intro=0` turns it off. Two font preloads added. Cards, copy and layout are unchanged. |
| rev 11.1 | 29 Oct 2026 | Visual audit card CH-3: "Try the booking" reacts on hover and keyboard focus (underline 2 px, lifted to 5 px; arrow nudges 4 px; 0.18 s, none under reduced motion) and stays terracotta. CSS only, in `chooser/chooser.css`. |
| rev 12 | 5 Nov 2026 | The Recommended card (Warm) opens Warm v3 (`variants/s3-home-v4/`, v3.0.1) instead of Warm v1.3.1 (`variants/s3-home-v2/`), with both links (Open, Try the booking) and the card's data-id and test ids moved to `s3-home-v4`. New real Warm v3 thumbnails (`chooser/thumbs/s3-home-v4-d.webp` 960 x 600, `-m.webp` 720 x 960, taken the same way as the Warm v1 pair) and new `data-faces` boxes. Warm v1 and Warm v2 stay online at their folder URLs, no longer linked from here. Badge, terracotta border, intro, the other four cards and the layout are unchanged. Backup of rev 11.1: `index.rev11-2026-11-05.html`. |

## What changed in rev 11 (difference table)

| Pattern | Where | Why |
| --- | --- | --- |
| Intro title card, built by JS over the page (fixed, so nothing shifts) | `chooser/intro.js`, `chooser/intro.css`; hook in `index.html` (guard script in the head, one stylesheet link, one deferred script) | Raoul, 29 Oct: a brief intro with the desktop disclaimer and the DM logo before the selection |
| Digital Movement logo as the centrepiece | `chooser/brand/dm-logo-color-negative.svg` (official file, unaltered), 54 % of the width on phones, 560 px on desktop (600 px from 1600 px) | Raoul: "prominently show the long written-out Digital Movement logo, centered"; the colour version is the official one for dark backgrounds |
| Disclaimer motion graphic: phone outline draws, terracotta dimension line, phone widens into a desktop monitor, a wireframe of this page reflows from stacked to one row, the copy rises line by line | inline SVG in `intro.js`, timing in `intro.css` | says "desktop" in pictures; one terracotta element only |
| Exit: the whole card fades as one (0.45 s, light push and defocus), no wipe | `intro.css` | a wipe edge would cross the faces in the thumbnails underneath |
| The chooser's own first-paint motion (header line, intro text, cards) waits behind the card and plays as it leaves | `intro.css` (pauses page animations while `html.efi` is set) | so the cascade is seen, not hidden; `motion.css` itself is unchanged |
| When it plays | guard script: normal load and reload; not back/forward (also bfcache), not from a concept page; `?intro=1` / `?intro=0` | coming back from a concept goes straight to the selection |
| Skip, accessibility, reduced motion | click, tap, any key, wheel or focus (0.18 s fade); one polite status line reads "Digital Movement. Best on desktop screen for full design experience."; reduced motion and Save-Data show the still frame (1.7 s); no JS = no intro | never traps focus or blocks the page |
| Font preloads for Gilroy SemiBold and Bold | `index.html` head | ship list (CLS 0.0001 to 0) |

## What changed in rev 9 (difference table)

| Pattern | Where | Why |
| --- | --- | --- |
| New concept names | the card title (`h2`) on all five cards | Raoul, 29 Oct: names that describe what you see on the page (Warm, Upfront, Tactile, Loud, Glossy) |
| Descriptor and "Best for" line | each card | exact copy from the naming proposal; Warm gets its own short pair in place of the long Home v2 text |
| Button labels | "Open the ___ concept" and "Try the booking in the ___ concept" (screen-reader text) | the buttons carry the new name |
| Unchanged | folders, URLs, data-ids, test ids, thumbnails, layout, the Recommended badge on Warm | the rev 6 to rev 8 layout stays |

## The five concepts

| Name | Folder | In one line |
| --- | --- | --- |
| **Warm** (Recommended) | `variants/s3-home-v4/` (Warm v3) | White cards on warm club video, and a name tag for every coach. |
| **Upfront** | `variants/s3-home-v2a/` | Home's warm look, booking first: today's classes on top, with prices and coaches. |
| **Tactile** | `variants/s5-panels/` | Works like an app: tap a class panel and it opens into your booking. |
| **Loud** | `variants/s4-kinetic/` | Giant words that move as you scroll; class names roll past and numbers count up. |
| **Glossy** | `variants/s2-editorial/` | Reads like the club's own magazine, with numbered pages and reviews set large. |

Each concept folder has its own README with its version, changelog, media credits and open items.

Not in the overview, still on disk with working URLs: `variants/s3-home-v2/` (Warm v1.3.1, the first Warm), `variants/s3-home-v3/` (Warm v2.0), `variants/s1-stage/` (Ensemble), `v1/` (Ground Floor, also the shared engine, data, fonts and logos) and `variants/s3-home/` (the reference Home page). `engine-v2/` is the shared booking engine.

## How to open it

Serve the `Clients/EliteFit` folder with any static web server and open `groupfitness-prototype/`. The pages use relative paths, so they also work from a sub-path such as `/elitefit-ops/groupfitness-prototype/`.

## Media

- Thumbnails in `chooser/thumbs/` are screenshots of each concept's own first view (phone and desktop). Replace a file and the HTML stays as it is. After replacing a thumbnail, refresh its `data-faces` boxes so the hover zoom never crops a face.
- `chooser/og-chooser.jpg` is the share image, a grid of those screenshots.
- Fonts, tokens and logo are linked from `v1/assets/`, not copied.
- `chooser/brand/dm-logo-color-negative.svg` is the official Digital Movement logo (colour version for dark backgrounds), copied unaltered from the DM brand assets for the intro. Do not recolour, stretch or crop it.
- Faces in the screenshots are the club's own members and coaches; the concepts' own READMEs list which clips are stock.

## Before go-live

1. This page is a review tool for Raoul and the club. It is not part of the production site; drop it once one concept is chosen.
2. Each concept's README has its own GO-LIVE section (stock clips to replace with club footage, Sample capacities, the WhatsApp number, quote sources). Close those for the chosen concept only.
3. Refresh the thumbnails and the share image if the chosen concept changes after review.
