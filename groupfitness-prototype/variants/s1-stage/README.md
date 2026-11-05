# Elite Fit Group Fitness page: Ensemble concept

Raoul named this concept **Ensemble** on 29 Oct 2026 (RULINGS #44; it was "Cinematic stage"). The folder and URL stay `variants/s1-stage`.

| | |
| --- | --- |
| Version | v1.5, 29 Oct 2026 (archives: `ef-gf/variants/s1-stage/archive/v1.2/`, `archive/v1.4-pre-motion/`) |
| Live page | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/variants/s1-stage/ |
| Status | Style variant of the design concept. Not the club's live website. The page carries `noindex, nofollow`. |
| Baseline | [v1](../../v1/) (same content and data). v1.3 adds the Home v2 best practices (P1 to P23) in this concept's own style. |

## Direction in three lines

1. The page is a film: a "now showing" line, a title card that opens on a widescreen trailer, the showtimes board (the week) and next up, four picture chapters (one per class family), a terracotta intermission for the one offer, end credits.
2. Signature: as you scroll, a card-sized video frame grows to full-bleed (CSS scroll-driven animation on each chapter's runway), while a sticky chapter bar swaps the family title. No text ever sits on the picture.
3. Black-dominant, few words, long breaths between beats. Terracotta is only the one booking button on screen, one word per headline and the intermission.

## How to view and test

Same as v1: tap **Book a class**, or pick a day and a class on the stage, then go through joining, details, the demo payment and the confirmation. Nothing is charged or sent.

- Deep link: `?class=boxercise-beginner` (or a session id such as `?class=boxercise-beginner-20261028-0800`) opens that class's sheet.
- Another time: `?now=2026-10-28T07:30` shows the page at that Bali time.
- Booking engine: `../../engine-v2/` (api.js with `data-store-key="ef-gf-v3-s1"`, booking.js, sheet-base.css), skinned by `assets/css/s1-sheet-v2.css`. Generic Book (title card, sticky bar) opens the class finder; rows, cards, week stubs and the Now bar open the class directly.
- Reset: run `localStorage.removeItem('ef-gf-v3-s1')` in the console, or use a private tab.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v1.5 | 29 Oct 2026 | Motion and scroll pass (RULINGS #39, MOTION-BRIEF): a film-grammar motion language on every section (table below), compositor-only (transform, opacity, filter), no clip-path reveals, no scroll listeners for animation, the title card final on first paint. Desktop chapters play as a centred screen at each clip's own aspect, so no face is cropped. |
| v1.4 | 29 Oct 2026 | Named Ensemble (#44). Switched to engine-v2 1.1 (class finder, two-step sheet, store key `ef-gf-v3-s1`) with the finder skinned as part of the film. Now bar pinned on phones and desktop (#38), header sticky under it on desktop, anchors land below the pinned chrome. Desktop week board today-first (#32) with compact seat dots on every stub; day-selector gaps 8 px above 375 px (#40); Now bar wording per #43 (trainer name at every width, "in 1:12:05" / "23:14 left" on phones), its own pause control and no on-bar stock label (#33). Sample chips cut to one per section (VISUAL-AUDIT S1-2); the hero quotes now rotate from the engine data (S1-1). |
| v1.3 | 29 Oct 2026 | Home v2 best practices in the cinematic style (difference table below): Now / Next top bar with a live countdown; widescreen trailer recut from the club's own class footage; Google rating line and rotating review quotes under the Book button, all above the fold at 390 x 664 and 360 x 640; the week as section 1 (showtimes board on desktop, day selector on phones); seat dots; class clips on the Next up cards; desktop trust row; one sticky bar on phones and desktop with the coaches, the dictated quote, the rating and a terracotta pulse; the joke, the visitor toggle and the Next up lead removed; 497 reviews; "Full · Join waitlist"; skin for the two-step sheet (`s1-sheet-v2.css`). |
| v1.2 | 28 Oct 2026 | Final QA fixes. |
| v1.1 | 27 Oct 2026 | Review fixes: the title card opens on a video trailer (4:5 on phones, 16:9 beside the headline on desktop) with a "Next up" line under the buttons; Boxing on desktop now ends in a centred 4:5 stage from the vertical clip (head to waist in frame) instead of a head-only close-up; the booking sheet has its own film skin (slate "02 / 05" with the scene name, frame-strip progress, edge-to-edge clip); coaches run as full-bleed portrait credits on phones; After class is one full-bleed café shot and one line; concept bar with a link to all concepts; one Sample chip per schedule row; review quote cut to its first sentence. |
| v1 | 27 Oct 2026 | First release of the cinematic variant: title card, chapter menu, four scroll-grown video chapters with a sticky chapter bar, the stage (next up and the week), cast, after class, terracotta intermission, programme notes (first class), closing shot (visit) and end credits. |

## What is shared with v1 (not duplicated)

- Booking engine: `../../v1/assets/js/api.js` and `../../v1/assets/js/booking.js`, linked unchanged. Skinned by `assets/css/s1-sheet.css`.
- Data: `../../v1/assets/data/groupfitness.json` (loaded by api.js). Every real and sample item is listed in [v1's README](../../v1/README.md#data-sources).
- Fonts, logo files, coach and club photos and the clips inside the booking sheet: `../../v1/assets/`. Credits in [v1's README](../../v1/README.md#media-credits).

## Files in this folder

| Path | What |
| --- | --- |
| `index.html` | The page |
| `assets/css/s1.css` | Tokens, layout, sections, motion |
| `assets/css/s1-sheet.css` | Skin for v1's five-step booking sheet (kept; used until the switch to engine-v2) |
| `assets/css/s1-sheet-v2.css` | v1.3 skin for the two-step sheet (engine-v2): slate "01 / 02", the coach as the picture, subtitle review, four tiles, one-row strip, credits-style Confirmed |
| `assets/js/base.js` | Rebases the media paths in the shared JSON to `../../v1/` before anything renders |
| `assets/js/motion.js` | Reveals, chapter bar swap, the frame-grow fallback, odometer |
| `assets/js/media.js` | Lazy, capped, pausable clips; picks the 16:9 (desktop) or the 9:16 (phone) clip per screen |
| `assets/js/page.js` | Now / Next bar, review quotes, Next up (clips + seat dots), week board and day list, chapters, filters, coaches, the sticky bar rule, the sheet slate (shared page hooks) |
| `assets/video/trailer-tall.mp4`, `assets/video/trailer-wide.mp4` (+ posters) | The title-card trailer (credits below) |
| `assets/video/*-wide.mp4`, `assets/img/*-wide-poster.webp` | New 16:9 chapter clips for desktop (credits below) |
| `assets/video/*-tall.mp4`, `assets/img/*-tall-poster.webp` | New 9:16 chapter clips for phones (credits below) |
| `assets/img/rec-sauna.webp` | 192 x 240 copy of v1's sauna photo for the confirmation card (booking.js asks for `assets/img/rec-sauna.webp` next to the page) |
| `og-gf-s1.jpg` | Share image (1200 x 630, a screenshot of this page) |

## Motion (v1.5, film grammar)

One easing family (`--ease-out`, a slow film ease-out) plus `--spring` (critically damped, no bounce) for the sheet. Everything animates `transform`, `opacity` or `filter` only. Every reveal plays once, takes 0.6 s or less, and a stagger group finishes within 0.9 s. Reduced motion and Save-Data give the final state at once (no video, no pulse, no parallax, no scroll-linked effects).

| Section | Pattern | Trigger | Timing |
| --- | --- | --- | --- |
| Now bar | A slow, blurred shot of the class under a 70 % layer; its own pause control; the countdown ticks | always (pinned) | ambient loop |
| Title card | Renders final on first paint (the old headline and screen entrances are gone). When the trailer rolls, letterbox bars ease in to a 2:1 scope picture (5.6 % each; faces sit between 15.5 % and 66 %). Leaving the scene, the picture fades toward black | video playing; scroll (CSS scroll timeline) | 0.6 s; over the first 70 % of a screen |
| Title card quotes | One review at a time, crossfade | every 3.5 s, pauses on hover, focus, off screen, pause button | 0.4 s |
| The week | Headline rises. Desktop board: columns flip in like a split-flap board, today's white rule draws in, stubs flip again on a filter change, hover lift 2 px, press 0.97. Phones: the day indicator glides, rows flip in on a day change | enter view; tap | 0.5 s + 45 ms per column; rows 0.4 s + 35 ms |
| Seat dots | Free dots fill in, one after another, once they are in view | enter view | 0.25 s + 10 ms per dot (0.4 s max) |
| Next up | Cards rise in sequence; each clip racks into focus (blur 8 px to 0) | enter view | 0.4 s + 40 ms; focus 0.6 s |
| Chapter menu | Stills rack into focus in sequence | enter view | 0.6 s + 60 ms |
| Chapters (signature) | The whole screen scales up from a card (0.84 phones, 0.90 desktop) while the picture racks into focus (blur 10 px to 0, exposure 0.5 to 1). Nothing is clipped, so no edge ever crosses a face. A hairline draws in above each chapter label like an intertitle; the sticky chapter bar hands over the title | scroll (CSS view timeline; IntersectionObserver fallback) | follows scroll; hairline 0.6 s |
| Cast | Portraits rise (opacity + translate only, the faces rule for portraits) | enter view | 0.55 s + 70 ms |
| After class | The cafe shot fades and settles inside its fixed frame (1.06 to 1) and drifts 5 % with scroll; the Recharge photo and card rise | enter view; scroll | 0.6 s |
| Intermission | The terracotta curtain opens from the centre (scaleX), the text rises over it | enter view | 0.6 s |
| First class | Steps rise in sequence; on desktop the step rules draw in left to right | enter view | 0.6 s + 90 ms |
| Visit | The entrance clip fades and settles in its frame; the quote rises | enter view | 0.6 s |
| End credits | The footer lines glide up in sequence | enter view | 0.6 s + 90 ms |
| Sticky bar | Slides up; Book pulses with a terracotta halo (a pseudo-element on opacity and transform, not box-shadow) | after the title card's Book, rating and quote | 0.45 s; pulse 2.4 s, continuous |
| Sheet | Opens on the spring; steps slide; the finder presses at 0.97; Confirmed glides up line by line like end credits | open, tap | 0.45 s; 0.5 s + 50 ms per line |


## v1.3 difference table (Home v2 best practices, in this concept's style)

Each row is one visible change. Pattern IDs are from `ef-gf/upgrade/BEST-PRACTICES.md`; rulings from `RULINGS.md`.

| Pattern | Where | Why |
| --- | --- | --- |
| P23 Now / Next bar | Very top, 48 px (phones, two short lines) / 44 px (desktop, one line). Replaces the concept bar; "All concepts" moves into the phone header, and the desktop bar keeps "Cinematic stage · demo · All concepts" on the right | Ruling 31. The film's "now showing" line: class icon, class, coach avatar and name, countdown (WITA, `?now=` aware, rolls over). Surface: that class's clip, cut from a band without faces, blurred and slowed, under a 70 % #1B1B1B layer. Tap opens the next bookable session of that class. No terracotta |
| P16 Dynamic hero | Title card trailer recut: `trailer-v2-wide.mp4` / `trailer-v2-m.mp4`, 9 s, five shots of the club's own class footage (kettlebells, agility rings, leg raises, cable machine with coach, kettlebell close-up) | "Much more dynamic video that shows action in class". Kept framed (the concept's screen). No stock in the trailer, so its "Includes stock clips" chip is gone |
| P5 Mobile fold | Phones: the trailer is widescreen 16:9 (was 4:5), header 56 px, H1 slightly smaller, the parts ordered eyebrow, H1, Book, rating, quote | The cinematic way: letterboxed like a film on a phone. Book + G widget + full quote fit 390 x 664 (bottom 638) and 360 x 640 (621) |
| P1 + P4 Critics' line | Under Book on phones; under the screen on desktop, like the quote card after a trailer | One rating line (G, 4.7, stars drawn to 4.7, 497 Google reviews, Maps link) and one real quote at a time, every 3.5 s, 19 px (24 to 26 px desktop), attribution 15 to 16 px, pause control. Plain text, never on the picture |
| P2 + P3 Sticky bar | Phones: the black strip, coaches + Book, the dictated quote as a centred subtitle line, the rating line (118 px). Desktop: the same parts as a floating cue strip, bottom centre (74 px) | Shows only once the title card's Book, rating and quote are gone; hides over the trust badge, the Visit quote, the offer, the footer, an open sheet and a focused field. Terracotta ring pulse, 2.4 s, off under reduced motion, hover and focus. The header CTA is gone, so one terracotta button per screen. Chapter frames on desktop now stop above the bar, so it never sits on a picture |
| P22 Week in section 1 | The week moves right after the title card. Desktop: a Monday-to-Sunday showtimes board (time + class per stub, today with a white rule and a "Today" tag). Phones: the day selector and that day's list, as before | Ruling P22 ("what classes take place on what day"). One timetable only. Order now: Now bar, title card, the week, Next up, chapter menu, chapters, cast, after class, offer, first class, visit |
| P13 Seat dots | Next up cards and every phone timetable row; the sheet (engine) | Free dots solid and first, taken as rings, "N spots free" / "1 spot free" / "Full · Join waitlist". Legend once, under Next up, with the one Sample marker for the section. Replaces "Room for N more" and the per-row Sample chips |
| P14 Class clips | Top of each Next up card, edge to edge like a screen; boxing as a centred 4:5 window (pillarbox) because its only source is vertical | "See what each class is about without reading". Nothing sits on the clip; stock clips say "Stock clip" in the card's meta line (ruling 28). One pause control for all three, beside the legend |
| P15 Desktop trust row | Next up head, right column (desktop only): the Google badge plus "33 classes a week", "4 coaches", "Open 06:00 to 22:00 daily" in the page's chip style | Verified facts only (FACTS F2-CLB-03, F2-HRS-01). It sits well below the title card, so a screen never shows two ratings |
| P17 Copy | Ice bath joke removed; 497 reviews; "Full · Join waitlist"; the week lead now "The next seven days. Tap a class to book."; the Next up lead and the First class / Been before toggle removed | Ruling 19, 23, 25, 29. The old week lead said "starting today", which the Monday-first desktop board no longer matches |
| P18 Brand | Pause buttons and media chips are solid #1B1B1B (no 74 % scrim); chapter "Stock clip" labels moved from the picture into the chapter's meta line | RUBRIC D2 (no scrims) and ruling 28. The Now bar's 70 % layer is the one overlay, required by ruling 31 |
| #38 Pinned Now bar | The Now bar is `position: sticky` at the top on every width (48 px phones, 44 px desktop). Phones: the header scrolls away. Desktop: the header sticks under the bar (120 px together). The chapter bar and stages start below both | Raoul: "top slim bar with current class is sticky on desktop and mobile". `scroll-margin-top` on every anchor clears the pinned chrome. Its blurred surface has its own pause control, since it now moves on every screen |
| #32 + P13 Week board | Today-first columns; every stub shows time, class and compact seat dots (5 px) with the label | Same order as the phone day selector and the other concepts; seat information at a glance |
| Finder skin | `s1-sheet-v2.css`, the finder block: step 0 set like the title card, By day as showtimes on hairline rows with the page's day selector, Show week as the page's ticket stubs, By class with a line icon per family | The finder is part of the film, in the page's own type and surfaces; no terracotta on any finder screen |
| P19 / #39 Motion language | Every section (Motion table above) | Raoul: "butter smooth and ultra premium when scrolling". Film grammar in the concept's own language: rack focus, letterbox bars, split-flap showtimes, intertitle rules, end-credits glides. Compositor-only, so the scroll trace stays on time |
| #39 Faces-safe chapters | Desktop chapters (all four) play as a centred screen at the clip's own aspect on the dark stage; phone conditioning frames its trainer from 20 % | The old card-to-full-bleed grow clipped across the picture and scaled faces toward the edge; at rest the cover crop cut heads in three clips. Now 0 heads are cut by the frames at any width |
| P7 to P12 Sheet skin | `assets/css/s1-sheet-v2.css` (linked at the engine-v2 switch) | Same screening room: slate "01 / 02" from `data-step` / `data-steps`, coach portrait 112 x 140 at 390 (148 x 185 desktop), the coach's line 20 to 22 px, the full review as a subtitle block, four tiles (drop-in outlined in terracotta with "Most chosen"), a one-row slate strip, equal pay pair, Confirmed as end credits. Desktop: a non-modal panel down the right edge; the page steps aside so the week stays in view |

## Sample list (on the page, or claims still to confirm)

| Item | Where | Marked on the page |
| --- | --- | --- |
| Class capacity and free spots | Seat dots, timetable, week board, sheet | Yes, one Sample marker per section (schedule note, Next up, classes footnote) |
| Class levels ("Open to everyone", "All levels") and the Injury Prevention & Mobility length | Chapters | Covered by the classes footnote; no chip on the chips (VISUAL-AUDIT S1-2) |
| Coach invitation lines | Sheet step 1 | Yes (engine) |
| "Most chosen" on Class drop-in | Sheet step 1 | No (ruling 11); GO-LIVE |
| Sticky bar quote "One of the top premium gyms in Bali! Must see!" | Sticky bar | No (ruling 8, 11); reviewer not found in the 120 pulled reviews; GO-LIVE |
| Family groupings, levels, feel lines | Chapters | Yes (footnote and chips) |
| Stock clips: boxing (khezez, Pexels 34801443), mobility (Pavel Danilyuk, Pexels 6326791 / 6326792), conditioning on phones (Pexels 6326788) | Chapters, Next up cards | "Stock clip" in the meta line; GO-LIVE: replace with club footage |
| Now bar surfaces for boxing and mobility (stock, blurred to abstract colour, no recognisable person) | Now bar | No on-bar label (RULINGS #33); GO-LIVE: replace with club footage |
| Rating 4.7 from 497 Google reviews | Title card, sticky bar, trust badge, Visit | Read 28 Oct 2026 (in each rating link's title) |

## Clip provenance (ruling 28)

| Clip | Used in | Source | Verified from |
| --- | --- | --- | --- |
| `trailer-v2-wide.mp4`, `trailer-v2-m.mp4` (+ posters) | Title card | Shots from `s3-home-v2a/assets/video/hero-d.mp4`, `homepage-prototype/v1/assets/video/zone-classes.mp4`, this folder's `sculpt-wide.mp4`, `homepage-prototype/v2/assets/video/training-clip.mp4`, `v1/assets/video/sculpt.mp4`. 1280 x 720 (1.9 MB) and 960 x 540 (1.0 MB), 9 s, 0.29 s crossfades, soft loop. Build script: `ef-gf/variants/s1-stage/up/scripts/trailer2.py` | hero-d, sculpt-wide, sculpt: Elite Fit's own header film (s3-home-v2a and v1 READMEs, this README). zone-classes and training-clip: no source README exists in `homepage-prototype`; the shots show the club's outdoor turf, perforated block wall and indoor gym, and come from the same shoot as the club's facility reel (`homepage-prototype/v1/assets/video/hero-reel-9x16.mp4`). GO-LIVE: the club confirms these two |
| `nowbar-{boxing,conditioning,sculpt,mobility}.mp4` (+ posters) | Now bar surface | 384 x 16 bands from the lower part of `boxing-tall`, `conditioning-wide`, `../../v1 sculpt.mp4`, `mobility-wide`, Gaussian blur sigma 7 (20 px or more on screen), slowed 2x, forward and back, 5 to 8 KB each | As the source clips (table below); boxing and mobility are stock and the bar says "Stock clip" |
| Next up card clips | Next up | `boxing-tall.mp4` (stock), `conditioning-wide.mp4` (own), `../../v1/assets/video/sculpt.mp4` (own), `mobility-wide.mp4` (stock) | Tables below and v1's README |

## Deviations from v1 and the brief (all intentional)

1. Order (v1.3, P22): the week comes straight after the title card, then Next up, then the class chapters. Book a class in the title card and the sticky bar opens the next class with room at any point.
2. The "First class / Been before" toggle is removed (ruling 29).
3. The title card's video (v1.3) is a 9 s widescreen trailer cut from the club's own class footage, 16:9 on phones and desktop (see Clip provenance). It carries no text: the headline sits below it (phones) or beside it (desktop).
4. Chapter class lines open the booking sheet directly instead of expanding in place.
5. The chapters use new clips: 16:9 on desktop and 9:16 on phones, so the full-bleed frame never crops a face at its edge (v1's 3:4 clips would lose a quarter of their width on a phone). Conditioning is the club's own footage on desktop and stock footage on phones, so its "Stock clip" tag shows on phones only. The booking sheet keeps v1's clips.
6. Boxing has only a vertical source, so on desktop its frame grows into a centred 4:5 stage (the 9:16 clip) instead of full-bleed, keeping her head to waist in frame. The other three chapters grow to full-bleed.
7. Scroll-linked effects (the frame grow, the café drift) follow the brief, which allows scroll-driven animations with a fallback, and replace v1's enter-view-only rule for this variant.

## New media in this folder

| Files | Used for | Source | Author | Licence | Edit |
| --- | --- | --- | --- | --- | --- |
| `assets/video/trailer-tall.mp4`, `assets/img/trailer-tall-poster.webp` | Title card, phones | Cut from this folder's four 9:16 chapter clips (credits in this table) | khezez, Pavel Danilyuk, Elite Fit | as the source clips | Four 1.6 s shots, 4:5 crops framed to keep every head in, hard cuts, 720 x 900, 6.4 s |
| `assets/video/trailer-wide.mp4`, `assets/img/trailer-wide-poster.webp` | Title card, desktop | Cut from this folder's conditioning, sculpt and mobility 16:9 clips plus the restaurant-table shot of the club's landscape header film | Elite Fit, Pavel Danilyuk | as the source clips; the club footage is copyright Elite Fit, used for this design concept only | Four 1.6 s shots, hard cuts, the restaurant shot slowed to 0.7x with motion interpolation, 1280 x 720, 6.4 s |
| `assets/video/conditioning-wide.mp4`, `assets/img/conditioning-wide-poster.webp` | Conditioning chapter, desktop | Elite Fit, own footage (the club's landscape header film) | Elite Fit | Copyright Elite Fit, used for this design concept only | The kettlebell shot on the outdoor turf (about 0.8 s), slowed to 0.4x with motion interpolation, played forward then back for a seamless loop, 1280 x 720 |
| `assets/video/sculpt-wide.mp4`, `assets/img/sculpt-wide-poster.webp` | Sculpt chapter, desktop | Elite Fit, own footage (same film) | Elite Fit | Copyright Elite Fit, used for this design concept only | The core-work shot on mats (about 0.9 s), same treatment |
| `assets/video/mobility-wide.mp4`, `assets/img/mobility-wide-poster.webp` | Mobility & Stretch chapter, desktop | [Pexels video 6326792, "Women Stretching on a Mat"](https://www.pexels.com/video/women-stretching-on-a-mat-6326792/) | [Pavel Danilyuk](https://www.pexels.com/@pavel-danilyuk/) | [Pexels License](https://www.pexels.com/license/) | 16:9 crop of the 1080 x 1920 original, 3 to 10 s, 1280 x 720, muted |
| `assets/video/boxing-tall.mp4`, `assets/img/boxing-tall-poster.webp` | Boxing chapter (phones full-bleed, desktop 4:5 stage), chapter menu | [Pexels video 34801443](https://www.pexels.com/video/intense-boxing-training-session-in-gym-34801443/) | [khezez](https://www.pexels.com/@khezez/) | [Pexels License](https://www.pexels.com/license/) | Full 9:16 frame, two windows (0 to 3.0 s, 4.5 to 6.2 s) joined with a 0.3 s crossfade, 720 x 1280, 4.4 s |
| `assets/video/conditioning-tall.mp4`, `assets/img/conditioning-tall-poster.webp` | Conditioning chapter, phones | [Pexels video 6326788](https://www.pexels.com/video/fitness-trainer-in-a-class-6326788/) | [Pavel Danilyuk](https://www.pexels.com/@pavel-danilyuk/) | [Pexels License](https://www.pexels.com/license/) | Full 9:16 frame, 12.5 to 19.5 s (v1's window), 720 x 1280 |
| `assets/video/sculpt-tall.mp4`, `assets/img/sculpt-tall-poster.webp` | Sculpt chapter, phones | Elite Fit, own footage (the club's landscape header film) | Elite Fit | Copyright Elite Fit, used for this design concept only | 9:16 window of the core-work shot, 0.4x with motion interpolation, forward and back, 720 x 1280 |
| `assets/video/mobility-tall.mp4`, `assets/img/mobility-tall-poster.webp` | Mobility & Stretch chapter, phones | [Pexels video 6326791](https://www.pexels.com/video/people-stretching-on-a-mat-6326791/) | [Pavel Danilyuk](https://www.pexels.com/@pavel-danilyuk/) | [Pexels License](https://www.pexels.com/license/) | Full 9:16 frame, 0.2 to 8.2 s (v1's window), 720 x 1280 native |
| `assets/img/rec-sauna.webp` | Confirmation card | Elite Fit, own photo (v1's `rec-sauna.webp`) | Elite Fit | Copyright Elite Fit, used for this design concept only | Resized to 192 x 240 |

Every clip is H.264, no audio, 0.8 to 1.4 MB, `preload="none"`, and loads only near the screen.

## Sample data

Unchanged from v1. Everything tagged "Sample" on the page is listed in [v1's README](../../v1/README.md#sample-data): spots, full classes and the waitlist, calendar dates, most class levels, four class descriptions, the Injury Prevention & Mobility length, the four families and their feel lines, coach bios, the member sign-in, the payment methods, the booking reference and the WhatsApp reminder.

## Fonts and logo

Gilroy and the logo files are v1's (`../../v1/assets/fonts/`, `../../v1/assets/logo/`). The Gilroy web licence is still an open item, see v1's README. This folder holds no font files.

## QA (v1.3, page level, 29 Oct 2026, before the engine-v2 switch)

| Check | Result |
| --- | --- |
| First view, no scroll (Book, rating, full quote) | 390 x 664: bottoms 516 / 564 / 638. 360 x 640: 500 / 548 / 621. 375 x 548 (best effort): Book in, quote at 630, out |
| Book in view at 375 x 812, 390 x 844, 1024 x 768, 1440 x 900, 1920 x 1080 | Yes |
| Horizontal scroll at 360, 375, 390, 1024, 1440, 1920 | None |
| Half-viewport sweep, ratings and terracotta buttons per screen (390, 360, 1024, 1440, plus 390 reduced motion) | Never more than 1 of either; the bar button is tabbable only while the bar shows |
| Sticky bar height | 118 px on phones, 74 px on desktop |
| Pulse | Running while the bar shows; none under reduced motion |
| Console errors, 404s, third-party requests | 0 / 0 / 0 |
| Lighthouse mobile, gzip server (median of 3) | Performance 99 (99 / 99 / 99), Accessibility 100, CLS 0, TBT 0 |
| Trailer faces | 19 frames (every 0.5 s) plus 5 crossfade frames: no face cut by the frame edge, none under the pause button's zone on phones or desktop (`ef-gf/variants/s1-stage/up/trailer-v2-faces.json`, `.jpg`) |
| Still to run after the engine-v2 switch | The CONTRACT self-test and tap counts (4 / 4 / 5 / 3), the sheet in place, the full faces gate per width with frames every 0.5 s |

## Clip swap (v1.5b, 29 Oct 2026): no head cut by a frame edge at any frame

| Slot | Old clip | New clip | Source, crop, own or stock |
| --- | --- | --- | --- |
| Conditioning chapter, phones | `conditioning-tall.mp4` (a man's head cut at the left edge) | `conditioning-m.mp4` (+ poster, 4:5) | the club's kettlebell class (`conditioning-wide.mp4`), 576 x 720 window, own footage: no stock label any more |
| Sculpt chapter, phones | `sculpt-tall.mp4` (two women cut at the right edge) | `sculpt-m.mp4` (+ poster, 4:5) | the club's core work on mats (`sculpt-wide.mp4`), 576 x 720 window, own |
| Mobility chapter, phones | `mobility-tall.mp4` (hair cut at the right edge) | `mobility-m.mp4` (+ poster, 4:5) | `mobility-tall.mp4` from 3.52 s, 720 x 900 window, stock (Pexels 6326791) |
| Sculpt chapter (desktop) and Next up card | `sculpt-wide.mp4` and `v1 sculpt.mp4` (heads cut at the top-left and bottom edges) | `sculpt-d.mp4` (+ poster, 16:9) | `sculpt-wide.mp4`, 717 x 403 window, own |
| Mobility chapter (desktop) and Next up card | `mobility-wide.mp4` (ponytail at the top edge) | `mobility-d.mp4` (+ poster, 16:9) | `mobility-wide.mp4` from 3.0 s, 1184 x 666 window, stock (Pexels 6326792) |
| Menu stills | the three tall posters | `conditioning-m`, `sculpt-m`, `mobility-m` posters | first frames of the new 4:5 clips |
| Now bar sculpt surface | `nowbar-sculpt.mp4` | `nowbar-sculpt-v2.mp4` (+ poster) | the lower band of `sculpt-d.mp4` (no heads), blurred |

Build: `ef-gf/variants/s1-stage/up/clean/build.py`; head boxes in `up/clean/faces-clean.json`. The old files stay in the folder, unused.

## GO-LIVE items from this concept (for `GO-LIVE.md`)
- Replace with club footage: the boxing and mobility stock clips (chapters, Next up cards) and the blurred boxing and mobility Now bar surfaces (#28, #33). (The heads cut by source frame edges are fixed in v1.5b, not a GO-LIVE item.)
- The club confirms the two trailer shots from `homepage-prototype` (`zone-classes`, `training-clip`) as its own footage.
- The sticky bar quote: source the reviewer, or the club approves the wording.
- "Most chosen" on Class drop-in: the club confirms drop-in is the most-booked option.
- Class capacities, coach invitation lines and class levels stay Sample until the club confirms them.

## QA (v1.5, motion pass, 29 Oct 2026, engine-v2 1.1)

| Check | Result |
| --- | --- |
| Booking flows (own self-test `ef-gf/variants/s1-stage/up/flows.mjs`) | 30 / 30 at 390 and 1440: class journeys 4 / 4 / 5 / 3 taps to Confirmed; hero Book opens the finder; By day, By class (10 classes), Show week, step 1, step 2, Confirmed; the desktop panel starts below the Now bar and the bar stays tappable; Esc returns focus to the opener; the phone sheet makes the page and the Now bar inert; store key `ef-gf-v3-s1`; 0 errors, 0 404s, 0 third-party requests |
| Fold, no scroll | 390 x 664: Book / rating / quote bottoms 516 / 564 / 638. 360 x 640: 500 / 548 / 621 |
| Sweep, half-viewport steps (390, 360, 1024, 1440, 390 reduced motion) | 0 screens with more than one rating line or terracotta button; bar 118 px (phones) / 74 px (desktop); pulse on, and none under reduced motion |
| Scroll trace, top to bottom by wheel input, 4 runs | 390 with 4x CPU throttle: 97.0 to 99.3 % of frames on time; 1440: 96.1 to 99.0 %; 0 forced layouts in every run; long tasks during the scroll 0 to 2 per run (51 to 74 ms at 4x CPU) |
| Lighthouse mobile, gzip server, median of 3 | Performance 96 (96 / 96 / 98), Accessibility 100, CLS 0, TBT 0 |
| Faces (v1.5b, `up/facegate.py`, frames every 0.5 s) | 0 fails in 1,543 head-frames: trailer, the four chapters, the four Next up clips and their posters, and the four menu stills, at 375, 390 and 1440 / 1920. Each head is fully inside its visible crop, none under a pause button, and none under the trailer's letterbox bars. Four source clips had heads cut by their own frame edge; they are replaced (Clip swap table) |
