# Elite Fit: Warm v2, the class-schedule booking page

| | |
| --- | --- |
| Version | **Warm v2.0**, 4 Nov 2026. The next version of Warm (v1.3.1, `../s3-home-v2`, 30 Oct 2026), answering Patrick's feedback on v1. |
| Folder | `variants/s3-home-v3` (a hand copy of `s3-home-v2` without its `archive/`; no build script was run). `s3-home-v2` stays exactly as Patrick saw it. |
| Feedback it answers | Patrick (owner), on Warm v1: "I think it is a bit heavy on the rounded frames and less dynamic than your earlier proposals but that is ok." |
| Status | Design concept with a demo booking, `noindex, nofollow`. Canonical and og:url/og:image still point where v1's do (to be switched when v2 ships). |
| Title | "Group classes · Elite Fit Bali · Warm v2" (title and og:title); the Now bar's demo label and the footer note say Warm v2. |
| Store key | `ef-gf-warm-v2` (v1 keeps `ef-gf-v2`, so demo bookings do not mix). |
| Direction | `Claude/elitefit-gf-work/DIRECTION-warm-v2.md` (one page: shape system, motion per section, what stays). |

## What changed, in three lines

1. **Rounded frames:** every card, photo frame and box is gone or square. Photos and clips run edge to edge; sections are held by type, a 12-column grid, 1 px hairlines and flat colour fields. Only things you press keep a 4 px corner; circles stay for faces and dots. Rounded containers (radius ≥ 6 px, at rest): v1 37 at 390 and 84 at 1440; v2 0 and 0.
2. **Pace:** the headline at poster scale (one line from 560 px), two bands of class names that slide with your scroll, family titles at poster scale that slide in from their clip's side while the clip frame grows, headlines that rise word by word, huge numbers for times and prices, giant 01 02 03, ink-fill and underline-draw hovers.
3. **"That is ok":** every word of copy and every fact, the engine-v2 booking (same taps), the Google rating and quote beside Book, the sticky Book bar and its pulse, the Now/Next bar, the week schedule, the class finder, coach faces, invitations and name tags, the +1, terracotta #E94A2B, Gilroy and the warm palette are kept.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v2.0 | 4 Nov 2026 | First release of Warm v2. Copied from Warm v1.3.1 (`s3-home-v2`, working tree of 30 Oct 2026). All v1 rules in `home.css` are kept; the v2 changes are one layer at the end of `home.css` ("WARM V2 · v2.0") and one at the end of `sheet.css`, plus the markup changes listed below. Engine-v2 is not edited. Details in the table. |

## Change → where → which Patrick point → why

| Change | Where | Patrick point | Why |
| --- | --- | --- | --- |
| Shape tokens: `--r-frame: 0` for everything that holds content, `--r-ctl: 4px` for controls; `--r-card`, `--r-photo` and `--r-pill` now point to them | `home.css` v2 layer, top | Rounded frames | One rule instead of six radii. Pills become square-ish controls, cards and photos square. |
| Hero: no white card. An open off-white field with the headline at poster scale ("FIND YOUR PEOPLE." on one line from 560 px, two lines on phones), then the club film full-bleed at its own 1280:608 aspect (nothing cropped) | `index.html` hero (text first, film after; phones show the film first by CSS order); `home.css` hero block | Both | The white card on the film was the biggest frame on the page. The film now runs edge to edge and the type carries the energy. Skim-first held: H1, Book, rating and full quote on screen at 360x640, 390x664 and every desktop size. |
| Hero on scroll: "Find" and "your people." drift apart, the film settles back (scale to .9) as you leave | `home.css` (`drift-l`, `drift-r`, `recede`, scroll timelines) | Less dynamic | Motion that answers your scroll, the way the homepage v2 headline does; at the top of the page both are at rest, so the first paint is final. |
| Google rating shown in the hero at every width (v1 moved it to the trust row from 1024 px); the trust row keeps its three facts as a hairline strip | `index.html` `#schedule` head; `home.css` | Rounded frames ("that is ok": rating beside Book) | The rating now sits next to Book on desktop too; one rating per screen still holds. |
| Two seams: big class names (Boxing + HYROX + Sculpt + Stretch + Mobility + 33 classes a week) and "Train together + Recover together + Eat together + Work together", sliding sideways with your scroll, the second the other way | `index.html` after the hero and before After class (`aria-hidden`, words are on the page as text); `home.css` `.seam` | Less dynamic | A rhythm device between sections, like Loud's band, but scroll-linked rather than auto-playing (nothing moves unless you scroll; no pause control needed). |
| Week schedule: square day tabs (the spring indicator kept), hairline week grid on desktop with a black rule over today, rows lighten and the time nudges on hover | `home.css` schedule block | Both | The rounded day bar and 33 rounded week chips were frame-in-frame; the grid now reads as a timetable. |
| Next up: open tiles on the white field, clip on top, time at poster scale, a 2 px rule above Book; phone clips 128 → 132 px tall and the sculpt card aimed at 50 % 35 % | `home.css`; `assets/data/v2.json` (`card_pos`) | Both | Dark rounded cards were boxes on a white page. The taller clip keeps the seated sculpt head 8 px clear (RULINGS #51). |
| Classes: each family has a poster-size title row ("01 BOXING") above a full-bleed clip; the text column sits beside it with no card; chips become a plain "60 min · All levels" line | `index.html` chapters (label and title moved into `.chap__head`, `wcard` removed); `home.css` | Both | The white card floating over a rounded clip is gone; type and the clip carry the section. |
| The family title slides in from its clip's side; the clip frame grows from .86 to full as it enters (the frame scales as a whole, the picture inside is never cropped further) | `home.css` (`title-in`, `frame-in`); one-shot fallback via `[data-sd]` in `motion.js` | Less dynamic | Scroll-driven depth on the compositor. Older Safari and Firefox get the same end state as a one-shot spring. |
| Portrait clips (Boxing, Conditioning, Mobility) at 4:5 aimed at the top, five desktop columns; Sculpt at its own 16:9, uncropped. Boxing loops its own first 2.8 s (`assets/video/boxing-warm.mp4`, 374 KB, from `v1/assets/video/boxing.mp4`) | `index.html`, `home.css`, new trimmed clip | Faces (HARD) | The whole-page faces sweep found heads cut by v1's 1:1 and 4:3 crops of these portrait clips, and a second head entering at the top edge late in the boxing shot. v2 shows them whole. |
| Coaches: edge-to-edge portraits (2 to a row on phones, 4 across the full width on desktop), no photo tilt; the name tags keep their swing and become square | `home.css` coaches block | Rounded frames | The name tags are Warm's signature, so they stay; the rounded, tilted photo frames go. |
| After class: the four photos edge to edge with 2 px seams (no deal from a pile, a short staggered rise); the restaurant photo full-bleed with its four facts below on a hairline grid; Recharge split into a full-bleed photo and a flat black field | `index.html` (`wcard` removed); `home.css`; new `assets/img/elitefit-logogram-white.svg` (the club's logogram recoloured white for the black field) | Both | No photo frames or cards left; the deck still reads as "together". |
| The +1: "BRING YOUR +1." on one line at full width, then three flush fields: terracotta (deal, the white button), the photo, the white pass | `home.css` offer block | Both | The photo and the pass were tilted rounded cards; now they are colour fields, and the +1 still pops. White text stays large on terracotta (contrast). |
| Prices: three columns of huge numbers on white rules | `home.css` prices block | Both | Three dark rounded cards become a price list you read at a glance. |
| First class: giant terracotta 01 02 03 on black rules instead of three dark cards; the "What to bring" photo straight and square | `home.css` steps block | Both | |
| Visit: the entrance photo full-bleed; facts and the review set large on black, no card or grey box | `index.html` (`wcard` removed, ghost buttons light); `home.css` | Both | |
| Footer: the logotype at full width as the closing wordmark, rising slightly as it comes in | `home.css` | Less dynamic | |
| Headlines below the fold rise word by word from their own line (≤ .55 s each, the group done ≤ .9 s, once). The hero and, from 768 px, the schedule title render final | `index.html` `data-motion="words"`; `motion.js` `splitWords`; `home.css` `.w` | Less dynamic | Kinetic type without hiding anything above the fold; no JS or reduced motion leaves plain text (no wrappers). |
| Buttons fill with ink from the left; nav links draw a terracotta underline; rows and Next-up times nudge | `home.css` | Less dynamic | Livelier micro-interactions, compositor only. |
| Sticky Book bar flush to the bottom edge, square (phones full width, desktop 720 px); the pulse kept | `home.css` dock block | Rounded frames ("that is ok": the bar) | |
| Booking sheet re-skinned to the shape system: square panel (flush to the right edge on desktop), 4 px tiles, inputs and chips, square photos and summary | `sheet.css` v2 layer | Rounded frames ("that is ok": the flow) | The engine, its markup and the taps are unchanged. |
| Fast-scroll flag moved from `<html>` to the revealed element (`.m-fast-el`) | `motion.js`, `home.css` | Speed ("that is ok") | Toggling a class on `<html>` restyled the whole page during fast scrolls (55-120 ms tasks at 4x CPU, in v1 too). Now 0 long tasks. |
| CLS 0: the Recharge column keeps `position: relative` (its logogram no longer jumps when the reveal ends); the Now bar's "All concepts" link is pinned right from 1024 px (it moved when the live class replaced the demo label, also in v1); Gilroy SemiBold and Bold are preloaded | `home.css`, `index.html` head | Speed ("that is ok") | |
| Headline widows: `.nw` pairs hold at every width, every h2 balances, the deck caption keeps "work. Together." together, the Recharge title is one line from 1024 px | `home.css`, `index.html` | Clarity | Larger type created new single-word last lines; the check now finds none at 360 to 1920 px. |
| Faces at more widths: the +1 photo keeps its own 911:608 from 1024 px (it stretched to the pass and its crop cut a face at 1024); the entrance photo is aimed 30 % from the top from 1024 px (the person at the door lost the top of the head at 1920) | `home.css` pass 7 | Faces (HARD) | Found by the whole-page sweep at 1024 and 1920. |
| Beside a tall portrait clip the family text sits at the clip's foot (desktop) | `home.css` pass 7 | Less dynamic | Visual review at 1440: the text column floated at the top with a gap below. |

## Gates (4 Nov 2026, local server, `?now=2026-11-04T07:30`)

| Gate | Result | Note |
| --- | --- | --- |
| Faces, engine-v2/qa/faces.js (finder thumbnails, Next-up cards, every avatar in every state) | **0 issues** at i390 (WebKit iPhone 14, 278 checks) and d1440 (295 checks); avatars ≥ 3.4 px clear | Run from a copy in the work folder (`qa/engine-qa/`, faces table copied), so engine-v2/qa files were not written to. |
| Faces, whole page (every img and video, every clip frame at 0.1 s, scroll stops every 0.3 screens sampled at +0, +160, +320, +700 ms, RULINGS #51 whole-head 8 px) | **0 issues** at 390x844 (Chromium and WebKit), 768x1024, 1024x768, 1280x800, 1440x900, 1920x1080 | `qa/faces-page.js`. Same sweep on v1: 20 findings (portrait-clip crops, sculpt, boxing). Four low-score YuNet boxes reviewed by eye as not faces (a forearm, a neck, a punch bag, a leg) are listed in `qa/faces-reviewed.json` with stills. Ain's portrait passes on her measured hair top (9.7 px at 390, 17.9 px at 1440), not the box estimate. |
| Rounded containers (radius ≥ 6 px, at rest, whole page) | v1 **37** at 390 / **84** at 1440 (frames 13/17, boxes 24/67; 3/40 inside another rounded frame) → v2 **0 / 0** | `qa/count-radius.js`. v2 keeps 4 px only on 31-35 controls (buttons, pause, filter chips, Book). v1 also had 54-59 pills ≥ 6 px; v2 0. |
| Lighthouse mobile, median of 3 (gzip server like GitHub Pages) | perf **95** (83, 95, 96), a11y **100**, LCP 2.9 s, TBT 57 ms, CLS 0 | v1 on the same server: 95 (94, 95, 98), a11y 100. |
| Lighthouse desktop, median of 3 | perf **99** (95, 99, 100), a11y **100**, TBT 0, CLS 0 | v1: 99. |
| CLS, load plus a full scroll (layout-shift entries) | **0.0000** at 390, 1024 and 1440 | v1: 0.003 at 1440 (font swap, the Now bar link). |
| Scroll trace, 390, 4x CPU, native wheel scroll top to bottom | **96.0-98.8 %** frames on time (3 runs), **0** long tasks > 50 ms | Before the fast-scroll fix: 1-2 long tasks per run (55-120 ms), as v1 (0-2). |
| Reduced motion | final state: no `motion-ok`, nothing translated or scaled, no split words, no clip plays | |
| Save-Data | no `motion-ok`, no clip plays, no scroll-driven animation | |
| No JS | H1, 33 timetable rows, 4 families, 4 coaches, 3 prices, 6 FAQs and all 9 h2 visible | |
| One terracotta button and one Google rating per screen | 0 screens over the limit at 390 and 1440 (scroll stops every half screen) | |
| Text floor | content ≥ 14 px; meta labels 12-13 px (eyebrows, day names, Sample, Stock clip, tag labels) | as v1 |
| Headline widows | 0 at 360, 375, 390, 414, 768, 1024, 1280, 1440, 1920 | `qa/widows.js` |
| Skim-first (H1, Book, rating, full quote on the first screen) | OK at 360x640, 375x667, 390x664, 390x844, 414x896, 1024x768, 1280x800, 1440x900, 1920x1080 | `qa/fold.js` |
| Booking path, generic Book → finder → next class → drop-in → details → Confirm → Booked | OK at 390 (WebKit and Chromium) and 1440: 5 taps + 2 fields, **0 console errors**, no 4xx, no third-party requests | Same 5 + 2 as v1 on the same script. |
| Motion JS | `motion.js` 12.4 KB, **4.6 KB gzip** (v1 4.1 KB) | limit 8 KB |
| Video weight | hero unchanged (1.15 MB desktop, 0.79 MB phone); boxing clip 374 KB (v1 1.48 MB) | |

## Files

| File | Note |
| --- | --- |
| `index.html` | Hero order, chapter heads, seams, `data-motion="words"`, `data-sd`, light ghost buttons in Visit, the white logogram, two font preloads, store key, overlay path (`../variants/s3-home-v3/assets/data/v2.json`), Warm v2 title and labels. |
| `assets/css/home.css` | v1.3.1 rules unchanged, then the "WARM V2 · v2.0" layer (passes 1 to 7). |
| `assets/css/sheet.css` | v1.3.1 rules unchanged, then the Warm v2 layer (radii only). |
| `assets/js/motion.js` | `s3-2.0.0`: word splitting, `[data-sd]` one-shot fallback, element-level fast-scroll flag. 12.4 KB, 4.6 KB gzip. `page.js`, `media.js`, `avatars.js` unchanged. |
| `assets/data/v2.json` | Warm v2 overlay 2.0: sculpt `card_pos` 50 % 35 %. |
| `assets/video/boxing-warm.mp4` | New: the first 2.8 s of `v1/assets/video/boxing.mp4`, H.264 CRF 25, 374 KB (the v1 clip was 1.48 MB). |
| `assets/img/elitefit-logogram-white.svg` | New: the club logogram, fill #FCFCFA. |

QA scripts, results and screenshots live in `Claude/elitefit-gf-work/` (`qa/`, `shots/run-01` to `run-06`). Never run Warm's build scripts on this folder: they overwrite hand edits.
