# Elite Fit Group Fitness page: Home concept

| | |
| --- | --- |
| Version | v1.2, 28 Oct 2026 |
| Live page | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/variants/s3-home/ |
| Status | Design concept, one of five style variants. Not the club's live website. The page carries `noindex, nofollow`. |
| Baseline | [groupfitness-prototype/v1](../../v1/README.md): same content, data, sample rules and booking engine |

## Direction in three lines

1. The warmest, most social variant: "a gym that feels like home", after handbook pages 20, 22 and 23.
2. White cards float on warm club photos and a real class clip; tilted photo cards with "together" chips deal onto the table as you scroll; every coach wears a "Hello, I'm" name tag.
3. Black and white lead in turns, dark grey carries the facts, and terracotta appears only on one button per screen, one word per headline and the "Bring your +1" moment.

## What moves, and why

| Section | Effect | Purpose |
| --- | --- | --- |
| Hero | A slow, muted loop of two members lifting kettlebells in class (poster first); the white card floats up on a spring; the clip drifts slower than the page as you scroll | The first picture is a class, and the card sits on top of it |
| Next up | Invite cards rise one after another; spots count up | It's easy to go today |
| Classes | Each clip settles as it comes into view; its white card rises over the clip's edge | Each family arrives like a card laid on a photo |
| Schedule | The day marker glides; the coaches' faces pop in for the chosen day ("Who's coaching tomorrow?"); rows cross-fade | The week reads as people, not slots |
| Coaches | Name tags swing into place from their pin; class counts roll up; photos tilt toward the pointer on desktop | Everyone knows your name |
| After class | Train, Recover, Eat and Work cards sit in a pile and fan out into a row while you scroll, then float twice | The boutique health club in one gesture |
| Bring your +1 | The photo and the pass are dealt in and fan apart; "+1" pops | The one offer moment |
| Booking sheet | The sheet springs up; steps slide; the confirmation tick draws | Physical, calm feedback |

All springs are CSS `linear()` curves sampled from a damped oscillator and settle in 0.6 s or less. Scroll-linked effects use CSS scroll timelines (`animation-timeline: view()` and `scroll()`); browsers without them get the same end state from an IntersectionObserver and a spring transition. Scrolling stays native (no snap, no pinning, no wheel handlers). With reduced motion or Save-Data on, nothing moves and the clips show posters. With JavaScript off, all content shows in its final layout.

## How to view and test

Same as v1 (see [v1 README](../../v1/README.md#how-to-view-and-test)): tap **Book a class** or any class, choose how you join, add your details, go through the demo payment screen. `?class=<id>` opens a class sheet, `?now=2026-10-28T07:30` shows the page at that Bali time. Bookings live in your browser under the `ef-gf-v1` key, shared with the other variants on this site.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v1.2 | 28 Oct 2026 | Final QA fixes. |
| v1.1 | 27 Oct 2026 | Review fixes: hero is now a real group class (slow loop of the club's own header film, poster first) and the restaurant photo moved to Pull up a chair with the after-class list on a white card; Sculpt uses the re-cut wide v1 clip in full 16:9 with the card only on its turf corner; Conditioning is cropped so every head has 20 px or more above it; the coaches sentence keeps a static 33; counters roll in 0.4 s; one Sample chip per row and card; concept bar "Concept · Home · demo bookings only · All concepts →"; review quote shortened to its first sentence. |
| v1 | 27 Oct 2026 | First release of the Home style: white-card hero on the club's restaurant photo, family chapters with floating cards, friendly schedule with coach faces, name-tag coaches, the dealing Train/Recover/Eat/Work deck, Recharge story card, terracotta +1 block with a pass card, floating booking dock, white booking sheet. |

## Shared with v1 (not copied)

- Booking engine, unchanged: `../../v1/assets/js/api.js`, `../../v1/assets/js/booking.js`, and the clip loader `../../v1/assets/js/media.js`.
- Data: `../../v1/assets/data/groupfitness.json` (loaded by api.js).
- Fonts, logo files, coach portraits and avatars, class posters and clips, and the Recharge and community photos from `../../v1/assets/`. Their credits and the full list of sample data are in the [v1 README](../../v1/README.md#media-credits).

## Own files

| File | Purpose |
| --- | --- |
| `index.html` | The page |
| `assets/css/home.css` | Tokens, layout, components and the motion block (bottom) |
| `assets/css/sheet.css` | This variant's skin for the shared booking sheet (same class names as v1) |
| `assets/js/base.js` | Points the shared data's media paths (`assets/…`) at `../../v1/` before the booking engine renders |
| `assets/js/motion.js` | Reveal states, counters, pointer tilt and the scroll-timeline fallback |
| `assets/js/page.js` | Renders and wires the page: next up, family class rows, schedule with "Who's coaching", filters, coach counts, dock |
| `assets/img/` | New crops only (see below) |
| `og-s3-home.jpg` | Share image, 1200 x 630, rendered from this page |
| `assets/video/hero-class.mp4` | Hero loop, 720 x 810, 3.3 s, muted |

## Deviations from the shared brief and v1

1. **Hero form.** The hero is a white card on one real class clip (handbook p. 20 and 23), not BXR-style video panels. On phones the card overlaps the clip's turf; from 900 px the clip bleeds off the right edge and the card floats over its left edge, which shows only wall and turf. The four class families appear as clip chapters in "What do you feel like today?".
2. **Visitor toggle.** "First class / Been before" sits with Next up, where its note greets the visitor, instead of in the hero.
3. **Coaches eyebrow.** EVERYONE KNOWS YOUR NAME (the handbook pillar) replaces THE TEAM.
4. **New lines in the handbook voice:** "Who's coaching today?" (tomorrow, on Friday), "Tap a face to see only their classes.", the "Hello, I'm" name tags, and the handbook caption "Train, recover, eat, work. Together." No facts, names, prices or approved lines were changed.
5. **Offer.** No small eyebrow on terracotta (white text that small would fail contrast). The price and the credit note sit on a white pass card, so the deal price can be terracotta.
6. **Confirmation image.** booking.js asks for `assets/img/rec-sauna.webp` relative to the page, so this folder holds a 240 x 300 crop of the v1 sauna photo for that card. booking.js itself is unchanged.
7. **Sticky bar.** A floating white dock with the four coach faces and the one terracotta pill. It hides over the offer and the footer, while a sheet is open and while a field has focus.
8. **Float.** The deck floats two strokes (under 5 seconds) and then rests, so no motion runs on without the visitor asking.
9. **Class clip framing.** Sculpt uses the re-cut wide v1 clip (1280 x 720) uncropped at every width, with a poster from its floor-work half so the resting frame differs from the hero; its pause button sits top left, clear of every face. Conditioning is zoomed 1.14x from the top right so the member at the source's left edge is out of frame and the coach's head has 20 px or more above it. All four clips, the hero loop and the photos under cards pass a faces gate at 9 sizes (375 to 1920) with union boxes over 5 frames of each loop.
10. **Coach portraits.** The shared portraits are framed tight at the top by the club (Ain's hair is 3.7 % below the edge), so at 390 px her hair sits about 7 px under the card edge. No face is cut or covered; a looser portrait set from the club would fix it.
11. **Sample chips.** One chip per schedule row and per invite card, at its end (the sheet's chips come from the shared engine, unchanged).

## New media in this folder

All are crops of Elite Fit's own photos and film. Source and author: **Elite Fit, own photography and footage**. Rights: copyright Elite Fit, used only for this design concept, not licensed for reuse. No new stock media.

| File | Shows | Source |
| --- | --- | --- |
| `img/hero-class.webp`, `video/hero-class.mp4` | Two members lifting kettlebells in a class on the outdoor turf (poster and a 0.45x ping-pong loop) | Elite Fit's own header film (landscape master), 0:04.9 to 0:05.7 |
| `img/sculpt-floor.webp` | Members doing leg raises on the turf (poster for the Sculpt chapter) | frame at 1.9 s of `../../v1/assets/video/sculpt.mp4` |
| `img/hero-d.webp`, `img/hero-m.webp` | Members at the long tables in the restaurant, stone wall and plants (Pull up a chair) | elitefitbali.com, `/promo-duo/` photo 16 (Oct 2026) |
| `img/deck-work.webp` | Members on laptops at the restaurant tables | elitefitbali.com, `/promo-duo/` photo 14 (Oct 2026) |
| `img/steam-d.webp`, `img/steam-m.webp` | The steam room at Recharge, amber light | elitefitbali.com, `/promo-duo/` photo 13 (Oct 2026) |
| `img/visit-d.webp`, `img/visit-m.webp` | The entrance on Jalan Sempol with palms and scooters | elitefitbali.com, `/promo-duo/` photo 1 (Oct 2026) |
| `img/deck-train.webp` | Two members talking on the gym floor | crop of `train-together.webp` (club photo already in this repo) |
| `img/deck-recover.webp` | Two friends on the sunbeds by the pool | crop of `recover-together.webp` (club photo already in this repo) |
| `img/deck-eat.webp` | Friends over lunch | crop of `../../v1/assets/img/eat-together.webp` |
| `img/rec-sauna.webp` | The sauna (confirmation card) | 240 x 300 crop of `../../v1/assets/img/rec-sauna.webp` |

## Open items

The v1 open items apply unchanged (handbook pages 33 onwards, PERFORM lockup, Gilroy web licence, WhatsApp number, Reski, MOST POPULAR contrast, Tinos or Martijn). See the [v1 README](../../v1/README.md#open-items-for-the-client).
