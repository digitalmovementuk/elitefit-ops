# Elite Fit group fitness page: Upfront concept (Home v2a, booking-first)

| | |
| --- | --- |
| Version | **Upfront (Home v2a) v1.2, 29 Oct 2026 (faces-only fixes on the frozen design after v1.1's handover fixes; booking-first direction, withdrawn for Home v2 and kept as its own concept for comparison)** |
| Successor | [Home v2](../s3-home-v2/), the version being built now. This page stays exactly as the withdrawn v1.0 was. |
| Live page (after the ship) | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/variants/s3-home-v2a/ |
| Production URL it is built for | https://elitefitbali.com/class-schedule/ (canonical and JSON-LD url; Raoul's deliberate exception to the slug rule) |
| Status | Design concept and demo booking. The page carries `noindex, nofollow`. Nothing a visitor types leaves the browser. |
| Search term | "classes gym canggu" (organic SEO only) |
| Specs | the Home v2 BRIEF, CONCEPT, UX-SPEC, SEO-SPEC, FACTS, COPY.md v1.3 (Status: FINAL) and the reviews file (kept with the project notes, not in this folder) |
| Base | `../s3-home` (copied from, never edited) and the shared `../../v1/` engine and data (never edited) |

## Direction in three lines

1. A booking page first and a brand page second: the first screen answers "classes gym Canggu" with today's next classes and their free spots, the drop-in price, the hours and the real Google rating, and the next class is one Book tap away.
2. Handbook p. 20–23 as the system: black pages and the club's own class film, white cards with the logogram for the human moments, dark grey cards for prices and facts, and terracotta only on the one click per screen.
3. Everyone knows your name: the booking sheet opens on the coach (portrait, name, their invitation, a real review), a returning visitor books with one tap after Book, and Confirmed greets you by first name.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v1.0 | 28 Oct 2026 | First release of Home v2, evolved from s3-home v1.2 into an SEO booking landing page. Crawlable 33-row timetable in the raw HTML (one DOM, enhanced in place), first-view Today card painted by an inline script before first paint, one-sheet booking engine forked from v1 (store key `ef-gf-v2a`), desktop non-modal side panel, ExerciseGym + FAQPage JSON-LD, copy COPY.md v1.0 pasted verbatim. |
| v1.0 | 28 Oct 2026 | **Payment is an equal choice (Raoul).** `DEFAULT_PAY = null` (one line in `assets/js/booking.js`): nothing is preselected for a first-timer; Confirm with no choice moves focus to the pay group with "Please choose Pay now or Pay at reception." A returning visitor gets their last choice. |
| v1.0 | 28 Oct 2026 | **No joke on the page (Raoul).** The ice-bath line removed; RECHARGE.body from COPY v1.1. No joke-like microcopy anywhere in the sheet, empty states or alts. |
| v1.0 | 28 Oct 2026 | **Low cognitive effort (Raoul).** The sheet offers exactly four options: I'm a member (WhatsApp only), Class drop-in (preselected after Book on a class), Membership (one next screen: Perform 4 weeks 2.2M or Elite 4 weeks 2.7M), Duo day pass (225K each, needs 2 free spots, no +1 field). Removed: Elite day pass, Perform day pass, 10-class pass, the email field (and from the payload), the +1 name, all checkboxes. Pay now has no Card/QRIS picker: one demo payment screen, then Confirmed. The prices section mirrors the same products plus a member line; every price CTA opens the sheet with that option selected. Copy COPY.md v1.2. |
| v1.0 | 28 Oct 2026 | **Free-spots seat row (Raoul).** One dot per place on every Today row, timetable row, the sheet header and Confirmed ("You took 1 of the N free spots"); free dots solid and first, taken dots as rings, always with "N spots free" / "1 spot free" / "Full · Join waitlist"; screen readers hear "N of C spots free"; groups of 5 above 12 places; never terracotta, never a % bar. Legend "● free spot ○ taken" plus one Sample chip in the timetable header. Sample capacities per class in `assets/data/v2.json`. Seats fill in on reveal (≤ 0.4 s) and tick down in place after a booking; reduced motion is instant. |
| v1.0 | 28 Oct 2026 | **Hero trust (Raoul).** A rating widget (4.7 stars drawn to 4.7, never 5 full, "4.7", "497 Google reviews · 28 Oct 2026", links to the Google Maps reviews, brand colours only, no Google logo) and a rotating quote: one at a time, 0.4 s crossfade every 6.5 s, pauses on hover and focus, a visible 44 px pause/play and next control, no auto-rotate under reduced motion, first quote static with JS off. Data-driven from `reviews` in `assets/data/v2.json`. |
| v1.0 | 28 Oct 2026 | **Coach-first checkout (Raoul).** The sheet opens on a coach header: a 4:5 portrait cropped from the top of the head to mid-torso (per coach), "YOUR COACH", the first name, class · day and time, the seat row, the coach's invitation (COPY v1.3 SHEET.coach.<class-id>, Sample until approved) and one real review tagged with that class or coach. On phones it folds to a 56 px strip while the keyboard is up; on desktop the portrait is larger and stays expanded. |
| v1.0 | 28 Oct 2026 | **Real reviews.** Hero rotator: the 5 "hero" quotes in file order (Sonal P. first). Sheet: "sheet" quotes by class first, then coach (Rey Boxercise and Off-Court → Alexandra H., HYROX → Conor B., Tinos → Conor B., Icha → Rue A., Ain → none). Source: Google Maps reviews read via Firecrawl on 28 Oct 2026, 172 of 497 reviews, excerpts verbatim (typos, lowercase and "…" kept). The hero, sheet and reviews-section sets never overlap. |
| v1.0 | 28 Oct 2026 | **Split into its own concept, "Home v2a, booking-first" (Raoul).** The withdrawn Home v2 v1.0 is kept as its own concept so the client can compare it with the Home v2 now being built (successor: `../s3-home-v2/`). Design, copy and behaviour are unchanged. Changed only for standalone use: store key `ef-gf-v2` → `ef-gf-v2a` (`assets/js/api.js` and the inline first-view script, so the two concepts never share bookings), `og-s3-home-v2.jpg` → `og-s3-home-v2a.jpg` with `og:url`, `og:image` and the JSON-LD image URLs on `variants/s3-home-v2a/`, concept bar "Concept · Home v2a, booking-first · demo bookings only · All concepts →" (phones: "Home v2a · demo · All concepts →"), footer and file comments "Design concept, Home v2a, booking-first". SEO title, meta description and canonical are as they were. Chooser thumbnail: `chooser/thumbs/s3-home-v2a-m.webp`. |
| v1.1 | 29 Oct 2026 | **Handover defect fixes on the frozen design; the concept is named Upfront (RULINGS #48).** (1) The "In panel" button in the timetable now has the accessible name "In panel, <class>, <day>, <time>" so it starts with its visible text (`assets/js/page.js`; axe label-content-name-mismatch, 0 serious with the sheet open at 1440). (2) The shared conditioning poster and clip have a head cut by their left source edge (RULINGS #46), so this page uses its own face-safe re-cut of the same Pexels footage: `assets/video/conditioning-facesafe.mp4` and `assets/img/conditioning-facesafe-poster.webp`. The shared files are untouched; `assets/js/base.js` points the conditioning data at the new pair. (3) `<title>` and `og:title` are "Group classes · Elite Fit Bali · Upfront"; the concept bar reads "Concept · Upfront · demo bookings only" (phones: "Upfront · demo"); this README's title carries the name. (4) Local paths and the dev smoke-test line are removed from this README. (5) GO-LIVE section and difference table added. Design, copy, behaviour and the page layout are otherwise unchanged. |
| v1.2 | 29 Oct 2026 | **Faces only (RULINGS #53, #54, #56; nothing else changes).** (1) All 14 coach avatars now come from the re-cropped head-and-shoulders files in `../../engine-v2/img/r/avatar-<id>-{48,64,96,128}.webp` (Today card and timetable rows 24 px, filter faces 48 px, filter chips 28 px, sticky bar 34 px), with `srcset` 48w/64w/96w/128w, `sizes` equal to the displayed size and the same `width`/`height`. The shared `v1/assets/img/avatar-*.webp` are no longer requested (0 requests, WebKit and Chromium). The 28 px filter chips start at the 96 px file, because the 48 px file's face box touches the circle edge at that size. Edited: `index.html` (first-view data and template, sticky bar), `assets/js/page.js`, `assets/js/base.js`. (2) Sticky-bar face row (phones and tablets up to 1023 px): the overlap between faces goes from -10 px to -6 px (`assets/css/home.css`), so a neighbour's ring no longer paints over a face (RULINGS #54); the overlap stays. (3) The Sculpt chapter has its own face-safe copy: `assets/img/sculpt-floor-facesafe.webp` and `assets/video/sculpt-facesafe.mp4` (left 36 % and bottom 36 % of the 1280×720 frame cropped away, scaled back to 1280×720), because the foreground head at the bottom left was cut by the frame edge in the poster and the clip. The shared `sculpt.mp4` and the old poster are untouched and no longer used by this page. |

## What changed in v1.1 (difference table)

| Pattern | Where | Why |
| --- | --- | --- |
| Accessible name starts with the visible text | `assets/js/page.js`, the `rbtn--inpanel` button ("In panel") | WCAG 2.5.3 label in name; axe `label-content-name-mismatch` was the one serious finding with the sheet open at 1440 |
| Face-safe conditioning clip and poster | `assets/video/conditioning-facesafe.mp4`, `assets/img/conditioning-facesafe-poster.webp`, `index.html` (`#family-conditioning`), `assets/js/base.js` | RULINGS #46: the shared clip has a head cut by its left source edge. New pair: the 3.2 to 4.0 s stretch of the same 6.6 s clip, cut to the 4:3 frame the page shows, slowed 2x with motion interpolation, ping-pong (3.2 s loop, 219 KB against 1.66 MB). Three heads (the coach and two members) stay fully inside at every frame, at least 24 px from the edge at 720 px wide |
| Coach avatars from the re-cropped engine files | `index.html` (first-view data, template, sticky bar), `assets/js/page.js`, `assets/js/base.js` | RULINGS #53 and #56: the old v1 avatar crops left the head 0.6 to 2.6 px from the circle edge; the new crops keep at least 4.3 px at the displayed size (3 px needed) |
| Sticky-bar faces overlap by 6 px instead of 10 px | `assets/css/home.css` (`.dock__faces img`) | RULINGS #54: the faces row may overlap, but no neighbour may paint over a face; at -10 px the next ring covered 3 of 4 faces |
| Face-safe Sculpt poster and clip | `assets/img/sculpt-floor-facesafe.webp`, `assets/video/sculpt-facesafe.mp4`, `index.html` (`#family-sculpt`) | RULINGS #46, #51 and #56: a foreground head was cut by the bottom edge of the footage |
| Concept name in the page title, share title and concept bar | `index.html` | RULINGS #48: "Group classes · Elite Fit Bali · Upfront" (the old SEO title is dropped; the page is `noindex` and the purpose override made SEO background only) |
| Dev commands and local paths removed | this file | Only what a reader of the shipped folder needs stays |

## GO-LIVE

Close these before this page goes live. None is a design change.

1. **Replace the stock clips with club footage.** Boxing (`../../v1/assets/video/boxing.mp4` and poster), conditioning (this folder's `assets/video/conditioning-facesafe.mp4` and poster, a re-cut of Pexels video 6326788 by Pavel Danilyuk) and mobility (`../../v1/assets/video/mobility.mp4` and poster) are Pexels stock. Each carries the visible "Stock clip" chip; remove the chip when a club clip replaces it. Every replacement clip must keep every head fully inside the frame (RULINGS #46), checked every 0.5 s.
2. **Confirm the Sample capacities.** The class capacities in `assets/data/v2.json` (`timetable.capacity`) are Sample: the club publishes none. They drive every seat dot, "N spots free" and "Full · Join waitlist". Replace them with the booking system's live spots, then remove the Sample chips. The other Sample items are listed above.
3. **Confirm the WhatsApp number that goes live.** The page uses +62 857-2022-1101 (`wa.me/6285720221101`) in the timetable links, the booking sheet and the member option. The /promo-duo/ page of the club site shows +62 851-9552-0220. The club names the one that goes live.
4. **Confirm the quote sources.** The hero rotator, the sheet and the reviews section show real Google Maps reviews, verbatim (typos, lowercase and "…" kept), read via Firecrawl on 28 Oct 2026 (172 of 497 reviews; the 497 count and the 4.7 rating are from the same day). Before go-live: re-read the listing, confirm the wording is still current, confirm each reviewer's first name and initial may appear, and update the date and count on the page and in this README.
5. **Ship the avatar files with the page.** The coach avatars load from `../../engine-v2/img/r/avatar-<id>-{48,64,96,128}.webp` (16 small files). Copy that folder next to the page, or copy the 16 files into this folder and change the path in `index.html`, `assets/js/page.js` and `assets/js/base.js`.
6. **Open items 1 to 6 below** stay open until the club answers.

## How to view and test

- Open the page; tap **Book** on any class (Today card, timetable, class lists, coach tags) or a price CTA.
- `?now=2026-10-28T07:30` shows the page at that Bali time (it keeps ticking). `?class=<classId|occId>&pass=duo|membership|member&step=membership|pay|done` deep-links into the sheet. `?coach=rey` opens a coach. `?payload=1` shows the production payload on Confirmed (QA only).
- Bookings, the draft and the remembered contact live in your browser under `ef-gf-v2a` (the shipped pages keep `ef-gf-v1`, Home v2 keeps `ef-gf-v2`). "Forget my details" (Confirmed and footer) clears the contact.

## Taps and fields (from the first Book tap to Confirmed, measured by the self-test at 375, 390 and 1440)

| Path | Taps | Required fields | Taps |
| --- | --- | --- | --- |
| First-timer, Class drop-in, pay at reception | **3** | **2** | Book → type full name + WhatsApp → Pay at reception → Confirm booking |
| First-timer, pay now | 4 | 2 | Book → Pay now → Confirm and pay 300K → Pay 300K (demo) |
| First-timer, Duo day pass | 4 | 2 | Book → Duo day pass → pay choice → Confirm |
| First-timer, Membership | **5** | **2** | Book → Membership → Perform or Elite → pay choice → Confirm membership start |
| Member, first time on this device | 3 | 1 | Book → I'm a member → type WhatsApp → Book with my membership |
| Returning visitor (details saved) | **2** | **0** | Book → Confirm (last pass and pay choice come back) |
| Waitlist (full class) | 2 | 2 | Book → type name + WhatsApp → Join the waitlist |
| WhatsApp share link `?class=…&pass=duo` | 2 | 2 | the link opens the sheet with Duo → pay choice → Confirm |

The orchestrator's target for membership was 4 taps + 2 fields. With the equal pay choice (nothing preselected) the measured count is 5: the pay tap is the fifth. Drop-in hits its target (3 + 2).

## Production data note

The prototype sends nothing. `EF.api.ENDPOINT` is `null`; `EF.api.submit()` resolves locally after 600 ms; `EF.api.payload(booking)` builds the record a live page would POST as JSON to one first-party endpoint (for example a same-origin WordPress REST route that forwards to **HubSpot** or the **club's booking system**, GymMaster). Fields (UX-SPEC §14, minus email and the +1 name): `schema_version`, `booking_ref` (idempotency key), `created_at`, `intent` (class_booking | membership_start | waitlist), `class_id`, `class_name`, `occurrence_id`, `class_start/end` (+08:00), `coach_id/name`, `pass_id` (class-1 | duo | perform-4w | elite-4w | member), `people`, `unit_price_idr`, `total_idr`, `currency`, `membership_start_date`, `pay_choice`, `payment_status`, `payment_method` (null), `payment_ref`, `full_name`, `first_name`, `whatsapp_e164`, `whatsapp_country_code`, `is_member`, `returning_device`, `waitlist`, `reminder_channel` ("whatsapp"), `marketing_opt_in` (false), `privacy_notice_version`, `source_page`, `source_section`, `utm_*`, `referrer_origin`, `locale`. **No email anywhere.** HubSpot: upsert the contact on `whatsapp_e164`; the booking as a deal or custom object. Live spots and capacity must come from the club's booking system (the seat row reads them). Indonesia's PDP law (UU PDP 27/2022): the sheet shows a purpose line; the privacy-notice URL is a gap; consent handling is for the club's counsel.

## Sample items (each carries one "Sample" marker on the page)

- Free spots and waitlists on every class (seat row), and the **capacity per class** (`assets/data/v2.json` → `timetable.capacity`; the club publishes none). One Sample chip on the timetable legend, one on each Today card header, one in the sheet header.
- The level "All levels" for HYROX Conditioning, Body Sculpt, Booty, Stretching, Mobility and Injury Prevention & Mobility.
- The 60-minute length of Injury Prevention & Mobility.
- The coach invitation lines in the sheet (COPY v1.3, until each coach approves).
- Coach bios in the coach sheet (`?coach=`), from the shared data.
- The four class families (our grouping, not the club's).
- The stock clips for boxing, conditioning and mobility ("Stock clip").
- Class descriptions shown under "About this class" for Booty, Stretching, Mobility and Injury Prevention & Mobility (the club publishes none).
- The Duo "needs 2 spots" note when a class has 1 free spot, and the waitlist lead (capacity).

## Deviations (declared)

1. **Desktop hero.** The club film has people across the whole frame, so a 400 px card over the photo's lower-left (CONCEPT §6.2) would cover faces. The photo is a 16:9 band in the right half and the Today card overlaps only its bottom 72 px (turf and feet), hanging below it.
2. **Mobile first view.** Photo strip `clamp(132px, 100svh − 680px, 200px)` (164 px at 390×844, 132 px at 375×812), and the answer block at 17 px below 400 px width (18 px from 400 up), so row 1's Book stays above the fold at 375×812 and 390×844 with the trust widget added.
3. **Coach header height** at 390 is about 280 px expanded (target about 200 px): portrait 80×100, the 3-line invitation at 18 px and a 2-line real review do not fit in 200 px at the required sizes. It folds to a 56 px strip with the keyboard up, so the fields and Confirm stay visible.
4. **Membership is 5 taps** (target 4): see the tap table.
5. **Inline first-view script is 5.2 KB** (target ≤ 2 KB) plus 1.7 KB of `tt-data`: it carries the seat row and the whole Today template, so the first paint and every later update use one template with no layout shift. Critical CSS is not inlined (two stylesheets); Lighthouse mobile Performance is 99 without it.
6. **Header** stays 72 px on desktop (no 72 → 56 change, which would shift the layout); the terracotta "Book a class" appears after the hero and hides over the offer card and the bottom booking card.
7. **Meta description** says "Book in 3 taps" (SEO-SPEC said 2, before the equal-choice decision). **BOOK.line** (copy) says "Booking one takes two taps": true for a returning visitor, three for a first-timer. Pasted verbatim and reported, not rewritten.
8. **Slug**: `/class-schedule/` (FK1.4 fails by design, Raoul's decision). **No byline** (LB1.2, no named person with credentials yet). **Organization logo** in JSON-LD points at the prototype-hosted logogram (the club logo URL is a gap).
9. **Timetable**: one Sample chip on the legend instead of one per row; the filters drawer offers class type, coach and time of day (the level filter is dropped, levels are mostly Sample); no per-row level.
10. **Member** is an option inside the one sheet (no separate member step); `?step=member` preselects it.
11. **A day at Elite Fit** is a 2×2 grid on phones (not a 4-card column) to keep the page shorter; desktop fans 4 cards on a scroll timeline.
12. **Confirmed** keeps the Recharge card without a link (copy v1.2 removed the Recharge day pass from the page). The waitlist's primary "See other times →" and the sheet step labels ("Book a class", "Membership", "Pay (demo)", "Booked") are builder UI labels with no copy slot.
13. **Ain's portrait** (club photo) has her hair about 4 px below the frame top on the name tags at 390; nothing is cut or covered. A looser portrait from the club would fix it.
14. **Hero quote** uses the reviews data; the reviews section keeps Tom J., Skye D.S. and asyraf140796 (no overlap with the hero or the sheet).

## Media

All new media are crops or cuts of Elite Fit's own footage and photos; copyright Elite Fit, used only for this concept. The one exception is the conditioning pair, a re-cut of a Pexels stock clip (row below).

| File | What | Source |
| --- | --- | --- |
| `assets/img/hero-780/1440/1920.webp` + `.avif` | Four members lifting kettlebells on the outdoor turf (poster, LCP) | first frame of the hero loop below |
| `assets/video/hero-m.mp4` (780×438, 158 KB), `hero-d.mp4` (1280×720, 360 KB) | the same class, a 3.2 s loop | Elite Fit's own header film (landscape master), the 0:04.9–0:05.7 shot, frames 3–21, slowed 0.45× with motion interpolation, ping-pong |
| `assets/img/deck-*.webp`, `steam-*.webp`, `visit-*.webp`, `rec-sauna.webp`, `sculpt-floor.webp` | copied unchanged from `../s3-home/assets/img/` | credits in the s3-home README |
| `assets/video/conditioning-facesafe.mp4` (720×540, 219 KB), `assets/img/conditioning-facesafe-poster.webp` (720×540, 19 KB) | the Conditioning chapter clip and poster ("Stock clip"), a 3.2 s ping-pong loop | Stock, not club footage: [Pexels video 6326788](https://www.pexels.com/video/fitness-trainer-in-a-class-6326788/) by [Pavel Danilyuk](https://www.pexels.com/@pavel-danilyuk/), [Pexels License](https://www.pexels.com/license/). Re-cut on 29 Oct 2026 from the shared source `../../v1/assets/video/conditioning.mp4` (the shared files stay as they are): frames 3.16 to 4.00 s, cropped to the 4:3 frame the page shows, slowed 2x with motion interpolation, ping-pong, H.264. The poster is its first frame. Reason: the shared clip has a head cut by its left source edge (RULINGS #46). Replace with club footage (GO-LIVE) |
| `assets/video/sculpt-facesafe.mp4` (1280×720, 682 KB), `assets/img/sculpt-floor-facesafe.webp` (1280×720, 36 KB) | the Sculpt chapter clip and poster, same 16:9 frame as before | Elite Fit's own footage (the shared `../../v1/assets/video/sculpt.mp4` and this folder's `sculpt-floor.webp`, which stay as they are), cropped on 29 Oct 2026: `crop=820:461:460:0,scale=1280:720` (left 36 % and bottom 36 % removed). The page still starts the clip at 1.9 s |
| `og-s3-home-v2a.jpg` | share image 1200×630 | rendered from this page's first view (the v1.0 image, renamed) |

Shared from `../../engine-v2/img/r/` (not copied): the coach avatars (`avatar-<id>-48/64/96/128.webp`, head and shoulders). Shared from `../../v1/assets/` (not copied): fonts, logo files, coach portraits, class posters and clips for boxing and mobility (boxing and mobility are Pexels stock), `community-day.webp`, `zone-classes.webp`. Credits: `../../v1/README.md`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | the page; the timetable, `tt-data`, the inline first-view script and the JSON-LD are generated from the shared data and the visible FAQ by a build script that is not part of this folder |
| `assets/css/home.css` | tokens, layout, sections, seat row, motion and no-motion blocks |
| `assets/css/sheet.css` | the booking sheet and panel |
| `assets/js/api.js`, `assets/js/booking.js` | forks of the v1 engine (headers say why); v1 is unchanged |
| `assets/js/base.js` | copied from s3-home: points shared media paths at `../../v1/`; since v1.1 it also points the conditioning family at this folder's face-safe clip and poster, and since v1.2 the coach avatars at `../../engine-v2/img/r/` |
| `assets/js/motion.js` | from s3-home, extended (mask frames, name tags, pass table; no counters) |
| `assets/js/page.js` | timetable enhancement, Today cards, filters, family lists, name tags, price CTAs, quote rotator, dock and header CTA |
| `assets/data/v2.json` | overlay: four options, Sample capacities, coach lines, tagged reviews, address, rating, drive, payload meta |

Shared: `../../v1/assets/js/media.js`, `../../v1/assets/data/groupfitness.json`.

## Hooks (CONTRACT §6, as changed by UX-SPEC §15 and Raoul's decisions)

Kept: `hero-book` (Today card row 1), `hdr-book`, `buybar-book`, `open-filters`, `filters-apply`, `filters-clear`, `day-0…6`, `row` (+ `data-occ`), `row-book`, `next-card`, `coach-<id>`, `sheet`, `sheet-back`, `sheet-close`, `step-class`, `step-pay`, `step-done`, `step-coach`, `cta-book`, `cta-pay`, `cta-ics`, `cta-wa-share`, `join-member`, `join-duo`, `pack-class-1`, `pack-perform-4w`, `pack-elite-4w`, `f-name`, `f-cc`, `f-phone`, `demo-flag`, `done-title`, `mrow-book`. Added: `step-membership`, `join-membership`, `pay-now`, `pay-reception`, `returning-summary`, `not-you`, `pick-another`, `other-time`, `cta-directions`, `cta-forget`, `err-summary`, `about-class`, `change-membership`, `next-chip`, `now-line`, `tt-static`, `use-pass-<id>`, `offer-book`, `bottom-book`, `coach-flip-<id>`, `faq-<n>`, `hero-rating`, `done-seats`, `recharge-duo`, `footer-forget`. Dropped: `step-join`, `step-details`, `step-member`, `cta-continue`, `cta-details`, `join-day`, `join-pack`, `join-elite-day`, `pack-class-10`, `f-email`, `f-plus1`, `f-wa`, `f-first`, `add-email`, `add-plus1`, `pay-card`, `pay-qris`, `pay-desk`, `[data-visitor]`, `[data-panels]`.

## QA evidence

- **Faces re-test, v1.2, 29 Oct 2026:** the engine faces check for this page (every `img` that loads an `avatar-*` file, measured at its rendered size in every page and sheet state, plus the Next-up cards) gives 0 findings at iPhone 390 and at desktop 1440: 14 avatar elements, 0 still load a v1 avatar, the smallest head clearance is 4.3 px (3 px needed). Sticky-bar paint-order check (each avatar's face box plus 2 px must be painted by its own image) at 390, 375, 360, 768 and 1023 px: 0 covered points (at the old -10 px overlap 3 of 4 faces were covered). The handover faces gate at 375, 390, 1440 and 1920 stays at 0 fails. The Sculpt poster and frames were checked by eye at 390 and 1440: no head touches an edge. Console errors 0, 404s 0, 0 requests to `v1/assets/img/avatar-*` in WebKit and Chromium. Axe with the sheet open: 0 serious. The v1.1 gate is unchanged: the failing check ids of the booking flow (8) and the upgrade checks (43) are identical to the pre-fix run, and the layout gate shows no new finding against the previous run (35 distinct findings, all present before).
- **Handover re-test, 29 Oct 2026** (Chromium and WebKit, after the v1.1 fixes): axe-core with the booking sheet open, 0 serious or critical at 360, 390 and 1440. Faces gate at 375, 390, 1440 and 1920 (YuNet face tables on every image and on video frames every 0.5 s, checked at every half-viewport scroll stop): 0 heads cut or covered, 0 heads too close to a frame edge, and the anchor-jump checks pass. The new conditioning clip was also rendered in the page and checked every 0.5 s at the same four widths (3 heads inside at every frame, at least 3 % of the frame width from the edge) and by eye on the poster and five sampled frames. Console errors 0 and 404s 0 at 375, 390, 1440 and 1920; the page requests only the new conditioning pair, never the shared one.
- **Booking flow** at iPhone 390: all 10 paths complete (day, pay now, Duo, member, Perform, pack, returning, waitlist, deep links). Browser Back from Confirmed does not follow the Home v2 two-step rules; that is by design, because this page keeps the single-sheet engine. The Home v2 upgrade checks (`V2P-*` and `V2-*`: two-step sheet, sticky label, rotator timing, pulse and so on) do not apply to this frozen concept and fail the same way before and after v1.1.
- **Smoke test of the split** (28 Oct 2026): WebKit 390×844 and Chromium 1440×900, console errors, 404s, horizontal scroll, one full first-timer booking paying at reception, the `?class=` deep link and the `ef-gf-v2a` store key.
- The v1.0 evidence (self-test at 375, 390 and 1440, faces at 9 sizes, Lighthouse) was produced before the split, in Home v2's own QA folder.

## Open items

1. Pay at reception versus the club T&C ("paid in full upfront at the time of purchase"): confirm with the club before the live page offers it.
2. Tinos's portrait identity (it may show Martijn): the repo photo is used as it is.
3. Which WhatsApp number (+62 857-2022-1101 used; +62 851-9552-0220 is on /promo-duo/).
4. Byline person, club logo URL and privacy-notice URL for the schema and the sheet.
5. Coach invitation lines need each coach's approval (Sample until then).
6. Live spots and capacity from the club's booking system; the Sample capacities go.
