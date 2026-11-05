# Elite Fit Group Fitness page: Ground Floor (design concept v1)

| | |
| --- | --- |
| Version | v1.6 (v3 upgrade, on engine-v2 1.1) |
| Date | 28 Oct 2026 |
| Live page | https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/v1/ |
| Status | Design concept. Not the club's live website. The page carries `noindex, nofollow`. |

## What this is

A design concept of Elite Fit's `/groupfitness` page, with a working demo booking.

- It follows the brand handbook (Version 3, 27 Oct 2026): black pages, warm photos, terracotta only where we want a click.
- You can check the class schedule, pick a class and go through the whole booking on a phone.
- No payment is taken. No data leaves the browser. Nothing is sent to the club or to anyone else.
- Anything made up for the demo is tagged "Sample" on the page and listed below.

## How to view and test

1. Open the live page on a phone. It is built mobile first and also works on desktop.
2. Tap **Book a class** (hero or sticky bar) to open the class finder: By day, By class or Show week, or the "Next class" shortcut. Or tap a class in the week, a Next-up card or the Now bar to go straight to that class.
3. Step 1: your coach, the coach's line and one real Google review, then four tiles (I'm a member, Class drop-in, Membership, Duo day pass). Step 2: full name, WhatsApp, Pay now or Pay at reception, then Confirm. Pay now adds one demo payment screen.
4. Try a full class to see the waitlist. "Get a Duo Day Pass" opens the finder with the Duo pass kept.

**Deep link to one class.** Add `?class=<id>` to the address. The id is a class `id` from `assets/data/groupfitness.json`, such as `boxercise-beginner` or `hyrox-conditioning`. The booking sheet opens for the next time that class runs. Example, which opens the next Boxercise Beginner:

https://digitalmovementuk.github.io/elitefit-ops/groupfitness-prototype/v1/?class=boxercise-beginner

You can also name one session: `?class=boxercise-beginner-20261028-0800` (class id, date, start time in Bali time). That works while the session is inside the next 7 days. Otherwise the page opens the next time the class runs. Once the sheet is open, the address goes back to the clean page URL.

**See another time.** Add `?now=2026-10-28T07:30` to see the page at that Bali time.

**Reset the demo.** Bookings and the name and WhatsApp you type are kept in one `localStorage` key, `ef-gf-v3-v1`, in your browser (the finder's last mode sits in `sessionStorage`). Nothing else is stored, and nothing is sent.

- Phone, quickest: open the link in a private tab. It always starts clean.
- Desktop: open the browser console on the page, run `localStorage.removeItem('ef-gf-v3-v1')`, then reload. Only this demo is reset. (In Chrome you can also delete the key under Application, Local storage.)
- Phone, without a private tab: clear the website data for `digitalmovementuk.github.io` in the browser settings. Other prototypes on that domain lose their saved state too.

## Changelog

| Version | Date | Change |
| --- | --- | --- |
| v1.6 | 29 Oct 2026 | Switched to the shared engine-v2 1.1 (`../engine-v2/api.js` with store key `ef-gf-v3-v1`, `../engine-v2/booking.js`, `sheet-base.css` before `sheet-v3.css`). The engine owns the generic Book buttons and the class finder; the page's own Book, Duo and Duo-note handlers are gone. The Now bar opens its class with `{src: 'nowbar'}`. The hero quotes come from the engine's data. The finder is skinned in Ground Floor's look. `booking.css` and v1's own `api.js` / `booking.js` stay in `assets/` for the other pages but are no longer loaded here. |
| v1.5 | 29 Oct 2026 | Motion pass (MOTION-BRIEF v1.0, RULINGS 39): `assets/js/motion-v3.js` and `assets/css/motion-v3.css`, loaded only here; motion-v3.js replaces the shared motion.js on this page (that file is untouched). RULINGS 43 Now-bar wording. RULINGS 44: the concept is named Ground Floor (title, og:title, concept line, footer, this README). |
| v1.4 | 29 Oct 2026 | RULINGS 38: the Now / Next bar is pinned at the top (phones: the only pinned chrome, 44 px; desktop: the header sticks under it, 120 px together); every anchor lands below it; the desktop panel starts below it. RULINGS 41: the bar's class, coach and time and the sheet's privacy line are 14 px. Archived before the motion pass as `ef-gf/variants/v1/archive/v1.4-pre-motion/`. |
| v1.3 | 29 Oct 2026 | P22: the week schedule is now section 1 after the hero (desktop 7-day grid, phones day selector + list); the hero family panels are hidden on phones so the week comes straight after the hero. RULINGS 29: the "First class / Been before" toggle, its line and the Next-up lead are gone. P23: the live "Now / Next" bar replaces the concept banner line. RULINGS 28: stock clips listed as "replace with club footage". |
| v1.2 | 28 Oct 2026 | v3 upgrade, part 1: the Home v2 best practices in this concept's own parts (see "v3 upgrade" below). New phone hero film (real Elite Fit class footage, no veil), Google line, rotating review quotes, sticky bar on phones and desktop with Raoul's quote and the pulse, desktop trust row, class clips and seat rows on the Next-up cards, seat rows in the schedule, the joke removed, 497 reviews, "Full · Join waitlist", Sample chips cut to the two allowed places. New sheet skin `assets/css/sheet-v3.css`, loaded once engine-v2 is ready (part 2). The v1.1 folder is archived unchanged in `ef-gf/variants/v1/archive/v1.1/`. |
| v1.1 | 28 Oct 2026 | Final QA fixes. |
| v1 | 27 Oct 2026 | Sculpt clip re-cut from the club's landscape master (1280 x 720, no face cut in 16:9 or 9:16 crops); page crops set per container. |
| v1 | 27 Oct 2026 | Initial concept: group classes page in the Elite Fit handbook style, with the 7-day schedule and a demo booking from class sheet to confirmation. |

## v3 upgrade (28 Oct 2026)

Raoul, 28 Oct: "All of the best practices from advancing the Home draft I want to apply to the other design concepts as well." The rules come from `ef-gf/upgrade/BEST-PRACTICES.md` (P1 to P21) and `ef-gf/upgrade/RULINGS.md`. The concept keeps its own look: black pages, grey cards, pill buttons, 18 px corners, Gilroy, terracotta only on the click.

### Difference table

| Pattern | Where | Why |
| --- | --- | --- |
| P16 hero film | Phones: the hero opens on a 16:9 film of a real Elite Fit class (`video/hero-band.mp4`), edge to edge, with nothing on it. The words moved onto flat black below it. | Raoul asked for real, dynamic class action. Text on a moving clip can't keep faces clear, so the text came off the picture. |
| P16 veil | The 52 % `hero__veil` is gone. | It only existed to make text on the photo readable. With no text on the film it has no job, and the rubric counts overlays (D2). Text contrast is now white on #1B1B1B. |
| P16 desktop | Desktop keeps the four family panels. | The panels are this concept's hero and already play class clips across the media column. Turning them into one full-bleed film would make the Original look like Home. |
| P5 fold | Phones: eyebrow, headline, then Book and Schedule on one row, the Google line, the quote. The lead sentence moved under the quote. | Book, rating and full quote must show on load at 390×664 and 360×640. Measured: quote bottom 649 / 632. |
| P5 Schedule label | Below 560 px the outline button reads "Schedule" (accessible name stays "See the schedule"). | Keeps Book and Schedule on one row, which buys the room for the rating and quote. |
| P1 Google line | Hero (phones and tablets), sticky bar, desktop trust row. Official G, 4.7, stars drawn to 4.7, "497 Google reviews", white ink, linked to the Maps reviews. | Raoul's Google widget. One component, one style block. No date on the widget (RULINGS 4); the read date is in the link title and here. |
| P4 quotes | Under the Google line: one real review at a time, 20 px on phones and 26 px on desktop, a 0.4 s fade every 3.5 s, a pause control, static under reduced motion. | "Quicker alternating... make citations more prominent." Plain text on black, no box, like v1's location quote. |
| P6 one rating per screen | The sticky bar waits until the hero Book, Google line, quote and (desktop) trust row are gone, and hides over the location quote. On desktop the hero shows no rating line. | Never two ratings or two terracotta buttons on one screen. |
| P15 trust row | Desktop only: the Google badge plus "33 classes a week" and "4 coaches" (FACTS F2-CLB-03) in the empty top right of the Next-up head, above the lead. v1 chip style. | Raoul's desktop trust badges. That corner was the empty space in this head. Two credentials keep it to one calm row at 1280 px and up. |
| P2 sticky bar | Phones: v1's black edge bar, now with the four coach faces, Book, the quote line and the Google line (120 px). Desktop: the same content in a floating grey card (74 px), centred, 20 px from the bottom. The header CTA is gone. | Raoul: the bar on desktop too, with his quote above the Google line. Grey matches v1's cards and stands out on black sections. |
| P3 pulse | A terracotta ring on the bar's Book, 11 px, every 2.3 s. Off on hover and focus, under reduced motion and while the sheet is open. | "Gently but noticeably pulsing." Box-shadow only, so nothing moves. |
| P14 class clips | Each Next-up card now opens with a 16:9 clip of its class family. Nothing sits on the clip. "Stock clip" moved into the meta line under it. One "Pause" for these clips sits under the cards. | "A small video on top of each black card." The card is v1's grey card; the clip shows the whole frame, so no face is cut. |
| P13 seat rows | Next-up cards and every schedule row: free dots solid and first, taken dots as rings, "N spots free" / "1 spot free" / "Full · Join waitlist". Legend once, in the schedule note. | Replaces "Room for N more". Phones: the seat row runs under the Book button so it stays one line. |
| P17 copy | Joke removed from the Recharge card. Location caption: 497 Google reviews (28 Oct 2026). "Full · Join waitlist". FAQ: single class 300K and Duo 225K each (the booking sheet's products, no 350K day pass). | RULINGS 19, 23, 25 and the sheet's four options. |
| P17 / RULINGS 11 Sample chips | On the page only two chips stay: one capacity chip on the first Next-up card and one in the schedule note. Level, length, description and family-line chips and the chapters footnote are gone. | Sample chips only on the coach line (in the sheet) and one capacity chip per list. The other Sample items are listed below. |
| P22 week schedule | The schedule moved from fourth place to straight after the hero; Next up follows it. Desktop: seven columns, today first, today's header in black (never terracotta), each class a compact chip (time, class, coach, seat row) that opens the sheet. Phones: v1's day pills and that day's list, as before. The trust row moved with it into this head. | Raoul, 29 Oct: "Add the schedule in section 1 immediately, well visible". Columns run today first, like the phone pills, because the demo week starts today (a Mon to Sun order would put the dates out of order). One timetable only. |
| P22 phone hero | The four family panels are hidden below 768 px. | They repeated the Classes section and pushed the week about 560 px down. The week now starts at 801 px on a 390 px phone. |
| RULINGS 29 | "First class / Been before", its welcome line and "The next three classes with room for you. Tap one to book." are gone. | Raoul: "Don't understand this, remove". |
| P23 Now / Next bar | A 44 px bar at the very top on phones and desktop: class icon, "Now" or "Next", the class, the coach's avatar and name, "ends in" / "starts in" with a ticking countdown (mm:ss under an hour, h:mm:ss above). The surface is that class's own footage, cropped below the faces, blurred and slowed, under a 70 % #1B1B1B layer. Tap opens the next bookable session of that class. It replaces the concept banner line and keeps "All concepts". | Raoul, 29 Oct (RULINGS 31). White text only, no terracotta. Two short lines on phones, one line on desktop. The film's Pause also stops this surface. |
| RULINGS 38 pinned bar | The Now / Next bar is `position: sticky` at the top (plus the safe-area inset). Phones: the header scrolls away, so only the 44 px bar stays. Desktop: the header sticks right under it (44 + 76 = 120 px). `scroll-margin-top` on every anchor target is the pinned height + 16 px. The phone sheet's backdrop covers the bar; the desktop panel starts below it (booking.css and sheet-v3.css). | Raoul: "top slim bar with current class is sticky on desktop and mobile". |
| RULINGS 33 | The bar surfaces from stock (boxing, mobility) carry no on-bar label: they are blurred to colour with no person visible. Listed under GO-LIVE. | A 44 px bar can't carry the label cleanly. |
| P7 to P12 sheet skin | `assets/css/sheet-v3.css`: v1's black sheet with grey option cards for the two-step engine. 112×140 coach portrait, white review on black, the drop-in tile with the terracotta outline and "Most chosen", a one-line strip, v1's fields, a white-outline pay pair, a white tick on Confirmed. Desktop keeps v1's right-edge panel, now non-modal; the page makes room. | Same class names as Home v2's sheet. Loaded with engine-v2 (part 2). |

### Motion pass (v1.5, MOTION-BRIEF v1.0)

The Original's own grammar stays: things rise into place on its fast-start ease (`cubic-bezier(.16, 1, .3, 1)`), cards are dealt, the day indicator glides. One spring (`linear()`, critically damped, no overshoot) moves the UI. Native scroll only: no scroll listener drives any animation, and no script reads layout in a scroll or animation frame.

| Pattern | Where | Why |
| --- | --- | --- |
| Own motion engine | `motion-v3.js` replaces the shared `motion.js` on this page, with the same API and classes. The fast-scroll flag is gone (it read `scrollY` in every frame). | MOTION-BRIEF performance gate: 0 forced layouts. The shared file stays untouched for the others. |
| Skim-first | The Now bar, hero film, headline, Book, rating and quote render final on first paint. Anything on screen at boot is shown at once. | Hard rule 2. |
| Headlines line by line | Every section headline: each line slides up out of its own mask, 0.6 s, 80 ms apart. Measured once in Gilroy, never while scrolling. | The handbook's big type, given a title-sequence entrance. Masks on headlines only. |
| Eyebrows and leads | v1's rise (fade + 16 px). | v1's existing token. |
| Hero recede | As the hero leaves, the film (phones) or the panels (desktop) scale to 0.95 and fade to 0.5, tied to the scroll. | Depth between the hero and the week. Whole boxes scale, so no face is cropped. |
| Now bar hairline | A 2 px line under the pinned bar fills with the page's scroll progress. | The pinned bar is always there; this tells you where you are. Compositor only. |
| The week | Trust badges cascade, "33" counts up once (0.7 s). Day pills cascade in under the gliding indicator. The desktop grid's seven columns cascade today-first (45 ms apart, done in 0.82 s). Seat dots fill in sequence when their list comes into view. The phone day heading's rule draws. | Raoul's "well visible" week, built up in reading order. |
| Next up | v1's card stagger; the seat dots fill when the cards arrive. | v1's existing token. |
| Classes | Each chapter's media rises into place (opacity + translate), then its text cascades. | v1's clip-path mask crossed the conditioning poster's face at the top edge; faces rule. |
| Coaches | v1's stagger and pointer tilt stay; the hover zoom on the photo is gone. | A zoom crowds a face against the frame. |
| After class | v1's dealt "together" cards. The ruled list draws row by row. The Recharge photo settles, then the white card follows (0.15 s later). | The hairlines are v1's; now they draw. |
| Offer | The copy cascades; the photo is dealt onto its 3 degree tilt. | The old mask clipped faces at the photo's right edge. |
| First class, Visit | Steps and facts rows draw their hairlines, then lift. FAQ and quote cascade. The entrance video keeps v1's mask (no people in it). | The same ruled-row language across the white and black sections. |
| Footer | Logo, columns and note cascade. | Every section has its motion. |
| Sticky bar | Slides in on the spring. The pulse is now a pseudo-element on opacity and transform (11 px ring, 2.3 s), never box-shadow. | Hard rule 7. |
| Sheet | Opens and closes on the same spring in 0.42 s. | One easing family. |
| Micro | Buttons press to 0.97. Week chips lift 2 px on hover (fine pointers). Focus rings ease in (0.18 s). | Small, consistent feedback. |
| Fallbacks | Without `html.motion-ok` (reduced motion, Save-Data) no pre-state applies: final states at once, posters only, no pulse, no recede, no hairline. Without JS everything is visible. | Hard rule 6. |

### Footage and quotes (sources)

| File | What | Source |
| --- | --- | --- |
| `video/hero-band.mp4`, `img/hero-band-poster.webp` | 11.0 s loop, 960×540, 0.99 MB: the kettlebell class on the turf, the core class on mats, then the kettlebell shot played back, so the loop point is seamless | Elite Fit, own footage: `variants/s1-stage/assets/video/conditioning-wide.mp4` and `sculpt-wide.mp4` (the club's landscape header film). Full 16:9 frame shown, no crop. |
| `video/next-conditioning.mp4` | Conditioning card | Elite Fit, own footage (s1-stage `conditioning-wide.mp4`, re-encoded 960×540) |
| `video/next-sculpt.mp4` | Sculpt card | Elite Fit, own footage (this folder's `sculpt.mp4`, re-encoded 960×540) |
| `video/next-boxing.mp4` | Boxing card, "Stock clip" | Pexels video 34801443 by khezez (this folder's `boxing.mp4`), a 16:9 window from 168 px down, checked every 0.25 s: the head stays inside the frame |
| `video/next-mobility.mp4` | Mobility & Stretch card, "Stock clip" | Pexels video 6326792 by Pavel Danilyuk (s1-stage `mobility-wide.mp4`, re-encoded) |
| `video/now-boxing.mp4`, `now-conditioning.mp4`, `now-sculpt.mp4`, `now-mobility.mp4` (+ `img/now-*-poster.webp`) | The Now / Next bar surfaces, 640×64, 16 to 40 KB each, half speed | Bands cut below every face (boxing: gloves and torso of this folder's Pexels `boxing.mp4`; conditioning: turf and kettlebells of Elite Fit's `conditioning-wide.mp4`; sculpt: mats and legs of Elite Fit's `sculpt-wide.mp4`; mobility: legs and mat of Pexels `mobility-wide.mp4`), then a Gaussian blur (sigma 12) so nothing is recognisable |
| Class icons in the Now / Next bar | Glove, kettlebell, dumbbell, stretch | Drawn for this page as line SVGs in #FCFCFA |
| Hero quotes | Verbatim cuts of 12 words or fewer: Alex F., Sonal P., Tom H., Edi H., Kieran H. | `ef-gf/s3v2/reviews/REVIEWS.md` v1.1 and `reviews.json`. Until engine-v2 brings `reviews[]`, page.js carries the same cuts. |
| Google rating | 4.7 from 497 reviews | Google knowledge panel, read 28 Oct 2026 (FACTS F2-REV-01) |

### QA, part 1 (updated 29 Oct 2026 for P22 and P23; my server on port 8810, gzip, `?now=2026-10-28T07:30`)

| Check | Result |
| --- | --- |
| Fold, phones, with the Now bar (bottom of Book / Google line / quote) | 390×664: 529 / 577 / 655. 360×640: 512 / 560 / 637. 375×548 is best effort (Book in, quote out). 1440×900: Book at 674. |
| Week schedule position | Starts at 801 px on a 390 px phone, right after the hero; desktop grid in the second screen at 1440 |
| One terracotta button and one rating per screen, half-screen steps | at most 1 and at most 1 at 360, 390, 1024 and 1440 |
| Horizontal scroll | none at 360, 375, 390, 1024, 1440 |
| Console errors, 404s, third-party requests | 0, 0, 0 |
| Quotes | change every 3.5 s (measured 3.48 and 3.54 s); static under reduced motion |
| Now / Next bar | 44 px; "starts in 29:59" at 07:30, "ends in 39:59" at 08:20, "2:59:59" at 05:00; ticks every second, rolls from "Next ... 01:00" to "Now ... ends in 59:59"; screen-reader line once a minute; tap opens that class's next bookable session; poster only under reduced motion while the countdown keeps going |
| Sticky bar | hidden while the first view's Book, rating and quote (desktop: the trust row) are on screen; shows 21 ms after they leave; 120 px on phones, 74 px on desktop |
| Reduced motion | no video plays, no quote timer, no pulse, seats instant |
| Overlays on the film and the card clips | none at 375, 390, 1440, 1920; all boxes exactly 16:9, the clips' full frame |
| Lighthouse mobile, median of 3 (v1.5, with motion) | Performance 95, Accessibility 100, Best practices 100, CLS 0, TBT 11 ms |
| Scroll trace (v1.5), top to bottom by wheel | 390 at 4x CPU: 99 % of frames on time, 0 long tasks, 0 forced layouts. 1440: 99.2 % on time, 0 forced layouts, one 50 ms task (a compositor commit, no script) |
| Pinned Now bar (v1.5) | at the top at every scroll position; header gone on phones, 120 px of chrome on desktop; every anchor's heading lands below it; the phone sheet's backdrop covers it; the desktop panel starts at 44 px with the bar still tappable |
| Reveals (v1.5) | none hidden in the first view; after a full pass, all 30 motion containers played and nothing is left hidden; reduced motion shows final states |

### QA after the engine-v2 switch (v1.6, 29 Oct 2026)

| Check | Result |
| --- | --- |
| `engine-v2/qa/concepts.js` on this page | OK at WebKit 390 and Chromium 1440: store key `ef-gf-v3-v1`, no missing API, finder, step 1, step 2, Confirmed, row Book, coach view, filters, Duo offer, 0 errors, 0 third-party |
| Class journeys (taps + fields), 390 and 1440 | drop-in 4 + 2, Duo 4 + 2, membership 5 + 2, member 3 + 1 |
| Finder journeys (clock 29 Oct 07:30) | shortcut drop-in 5 + 2, By day today 6 + 2, another day 7 + 2, Show week Duo 6 + 2, "Get a Duo Day Pass" 4 + 2 (this page has no price cards, so #42 has nothing to change) |
| Finder layout at 360, 375, 390, 1440 (step 0, By day, By class with 10 classes, Show week) | 0 overlaps, 0 clipped items, every target >= 44 px, text floors met, no terracotta, no horizontal scroll |
| Focus | phones: modal, Tab stays in the sheet, Esc returns to the opener; desktop: non-modal (no aria-modal), the page stays usable, Esc returns to the opener |
| Pinned bar with the sheet | phones: under the backdrop and inert; desktop: the panel starts at 44 px (engine `--sheet-top`), the bar stays tappable |
| Confirmed | 55 words, one terracotta button |
| Page sweeps, fold, errors | as above: at most 1 terracotta button and 1 rating per screen, fold 529 / 577 / 655 at 390×664, 0 errors, 0 404s, 0 third-party |
| Lighthouse mobile, median of 3 | Performance 96, Accessibility 100, Best practices 100, CLS 0, TBT 10 ms |

### GO-LIVE notes for the client (RULINGS 28)

- Stock clips, replace with club footage: boxing (`video/boxing.mp4`, `next-boxing.mp4`, `now-boxing.mp4`), conditioning in the chapters and hero panels (`video/conditioning.mp4`), mobility (`video/mobility.mp4`, `next-mobility.mp4`, `now-mobility.mp4`). Each carries "Stock clip" in its meta line or on its chapter. The conditioning and sculpt cards, the hero film and the sculpt chapter already use Elite Fit's own footage.
- The sticky bar quote and "Most chosen": see the Sample list below.

### Sample items without an on-page chip (RULINGS 11)

- The sticky bar quote "One of the top premium gyms in Bali! Must see!": Raoul's wording; the reviewer is not in the 120 pulled reviews. GO-LIVE: source it or get the club's approval.
- "Most chosen" on the drop-in tile (sheet): until the club confirms drop-in is the most-booked option.
- Class levels and the Injury Prevention & Mobility length, class descriptions for Booty, Stretching, Mobility and Injury Prevention & Mobility, the four families and their feel lines, coach bios: as in the Sample table below.
- Capacity (spots, dots, full classes) keeps its one chip per list; coach invitation lines keep their chip in the sheet.

## Data sources

### Real data

Taken from the club's own website, elitefitbali.com, unless stated.

| What | Source | Date |
| --- | --- | --- |
| Timetable: 33 classes a week (Mon 7, Tue 6, Wed 4, Thu 4, Fri 7, Sat 3, Sun 2) | `/class-schedule/` | 27 Oct 2026 |
| Class names, coaches, 60 minutes per class | `/class-schedule/` and the class pages `/schedule/<class>/` | 27 Oct and 1 Oct 2026 |
| Descriptions of 6 classes: HYROX Conditioning, Off-Court Training, Boxercise Beginner, Boxercise Advanced, Booty and Core, Body Sculpt | The club's class pages. Reworded in the club's voice, facts unchanged. | 1 Oct 2026 |
| Coaches: Rey, Tinos, Ain, Icha. Rey's role line ("Sports Strength & Conditioning · Weight loss · 1:1 Boxing"). | Timetable and the trainer grid on `/perform/` | 27 Oct 2026 |
| Prices: Day Pass 350K, Duo Day Pass 225K each (450K for two), Perform 4 weeks 2.2M, Elite 4 weeks 2.7M, Recharge day pass 300K | `/promo-duo/` | 27 Oct 2026 |
| Single class 300K and 10-class pass 2M ("class only, no gym floor") | `/membership/` price popup. Not re-checked on 27 Oct: check before showing to the club. | 2 Oct 2026 |
| Duo Day Pass terms, including "Decide to join after? We'll credit your day pass toward your membership." | `/promo-duo/` | 27 Oct 2026 |
| Address (Jalan Sempol No. 26, Pererenan), hours (gym and classes 06:00 to 22:00, Recharge from 06:30), email, Instagram | The club's website and Google | Oct 2026 |
| Google rating 4.7 from 497 reviews (v1.1 said 488) | Google knowledge panel | 28 Oct 2026 |
| WhatsApp number +62 857-2022-1101 | Contact section on `/membership/`, `/perform/` and `/class-schedule/`. See the open items. | 27 Oct 2026 |
| Class rules (arrive 10 minutes early, cancel in advance, class is called off if nobody has arrived 15 minutes after the start) and how booking works today (members: GymMaster app or front desk; non-members: ClassPass) | The club's terms and Perform FAQ | Oct 2026 |
| Review by Skye D.S., 5 stars | Google review shown on `/promo-duo/` | 27 Oct 2026 |
| Colours, type, voice and website parts | Brand handbook, pages 1 to 32 | Version 3, 27 Oct 2026 |

Notes on the real data:

- Thursday's first class is printed "8:00 am 8:30 am" on the club's page. The concept uses 08:30, as in the 1 Oct timetable.
- Weekend classes run on set dates at the club. The page shows the standing pattern and says so.
- Putu is on the club's trainer grid but teaches none of the timetable classes, so he is not shown.

### Sample data

Everything below is made up for the demo. The page tags these items "Sample".

| Sample item | Where it shows | What is real | Note |
| --- | --- | --- | --- |
| Spots left and capacity (10 to 16 per class, from engine-v2's data) | Week, Next up, finder, class sheet, seat rows | Nothing. The club publishes no capacity or spots left. | Stable numbers made in the browser from the class and the date. A demo booking lowers the count in your browser only. |
| "Full" classes | Schedule, class sheet | Nothing | About one class in eight shows as full, so the waitlist can be seen. |
| Waitlist | Full classes | Nothing. The club has no waitlist. | Joining only saves a note in your browser. |
| Calendar dates | 7-day date strip | The weekly timetable is real | Dates are made in the browser, today first. They are not real availability. |
| Class levels for HYROX Conditioning, Body Sculpt, Booty, Stretching, Mobility, Injury Prevention & Mobility, and the level lines on the Conditioning, Sculpt and Mobility & Stretch hero panels | Schedule, Next up, class chapters, class sheet, filters | Levels are real for Boxercise Beginner, Boxercise Advanced (from the name), Booty and Core and Off-Court Training (club: open to everyone) | The club publishes no level for the others. |
| Description of Booty | Class sheet, class cards | Coach and length | The club's class page has no text of its own. |
| Description of Stretching | Class sheet, class cards | Coach and length | Same. |
| Description of Mobility | Class sheet, class cards | Coach and length | Same. |
| Description of Injury Prevention & Mobility | Class sheet, class cards | Name and coach | New class on 27 Oct. The club's page was not read. |
| Length of Injury Prevention & Mobility (60 min) | Next up, class chapters, class sheet | Name, coach and start times (Mon 13:00, Wed 10:00, Thu 10:00) | The live timetable prints start times only and the class has no page yet. Every other class page says 1 hour, so 60 min is assumed. |
| The "Sample" chip | v1.2: one capacity chip per list (first Next-up card, schedule note) and the coach line in the sheet | Not applicable | RULINGS 11 replaced the v1.1 rule (a chip on every sample level, length, description and spot). The rest is listed here. |
| The four class families (Boxing, Conditioning, Sculpt, Mobility & Stretch) and the one-line feel of each | Hero panels, class chapters | The classes inside each family | Our suggestion. The club defines no families. |
| Coach bios (Rey, Tinos, Ain, Icha) | Coach sheets | Names, photos and the classes each coach teaches. Rey's role line is the club's own. | The club publishes no bios. |
| "I'm a member" | Booking step 1 | Nothing | WhatsApp only; no account is checked. |
| Coach invitation lines | Booking step 1 (with a Sample chip) | The class facts | Sample until each coach approves the line (engine-v2 data). |
| "Most chosen" on Class drop-in | Booking step 1 | Nothing | Until the club confirms drop-in is the most-booked option. |
| Pay now (demo payment screen) or Pay at reception | Booking step 2 | The club's real tools today are GymMaster (members), ClassPass (non-members) and Moka (shop) | Labelled "Demo, no payment taken". Nothing is charged. |
| Booking confirmation and reference (`EF-DEMO-` plus four digits) | Confirmation screen | Nothing | Made in the browser. The club receives nothing. |
| Details you type (full name, WhatsApp) | Booking step 2 | Nothing | Stay in this browser's `localStorage` (90 days at most). Never sent. No email is asked. |
| "What to bring": trainers and clothes you can move in | First class section, class sheet | Own water bottle, towel, showers and lockers are the club's | Concept suggestion for the shoes line. |
| Welcome lines: the "First class / Been before" notes and the 3-step first-class plan | Hero, First class section | Class rules and the 10-minute arrival | Written for the concept in the handbook voice. The club has not confirmed them. |
| Class video for Boxing, Conditioning and Mobility & Stretch | Hero panels, class chapters, class sheets | Not the club's classes | Free stock footage, tagged "Stock clip" on the page, see the credits. The club has no class footage for these. |

## Media credits

Every photo and clip in `assets/img/` and `assets/video/`.

### Free stock clips (3)

All three are used under the Pexels License (free to use, no attribution required). They are credited here anyway. Each was cropped to 3:4 portrait, trimmed and looped, 720 x 960, muted. Posters are frames of the clip.

| Files | Used for | Source | Author | Licence | Edit |
| --- | --- | --- | --- | --- | --- |
| `video/boxing.mp4`, `img/boxing-poster.webp` | Boxing | [Pexels video 34801443](https://www.pexels.com/video/intense-boxing-training-session-in-gym-34801443/) | [khezez](https://www.pexels.com/@khezez/) | [Pexels License](https://www.pexels.com/license/) | Two parts joined, slowed to 0.8x, 5 s loop |
| `video/conditioning.mp4`, `img/conditioning-poster.webp` | Conditioning | [Pexels video 6326788](https://www.pexels.com/video/fitness-trainer-in-a-class-6326788/) | [Pavel Danilyuk](https://www.pexels.com/@pavel-danilyuk/) | [Pexels License](https://www.pexels.com/license/) | One section, 6.6 s loop |
| `video/mobility.mp4`, `img/mobility-poster.webp` | Mobility & Stretch | [Pexels video 6326791](https://www.pexels.com/video/people-stretching-on-a-mat-6326791/) | [Pavel Danilyuk](https://www.pexels.com/@pavel-danilyuk/) | [Pexels License](https://www.pexels.com/license/) | One section, 7.6 s loop |

### Elite Fit's own clips (2)

Source and author: **Elite Fit, own footage**. Rights: copyright Elite Fit. Used here only for this design concept, not licensed for reuse.

| Files | Shows |
| --- | --- |
| `video/sculpt.mp4`, `img/sculpt-poster.webp` | Kettlebell deadlifts and core work on mats on the outdoor turf (the club's landscape header film, 4.84–5.60 s and 5.72–6.58 s). Re-cut on 27 Oct 2026 as 1280 x 720: every visible face sits fully in the 16:9 frame and is either fully inside or fully outside a centred 9:16 crop; no coach is in shot (the masters only show him cut at the frame edge). Two parts joined with a crossfade, slowed to 0.35x, 3.7 s loop, 0.74 MB. |
| `video/visit-entrance.mp4`, `img/visit-entrance-poster.webp` | The concrete entrance wall with the Elite Fit logo and palms |

### Elite Fit's own photos (16)

Source and author: **Elite Fit, own footage**. Rights: copyright Elite Fit. Used here only for this design concept, not licensed for reuse.

| Files | Shows |
| --- | --- |
| `img/coach-rey.webp`, `img/coach-tinos.webp`, `img/coach-ain.webp`, `img/coach-icha.webp` | Coach portraits |
| `img/avatar-rey.webp`, `img/avatar-tinos.webp`, `img/avatar-ain.webp`, `img/avatar-icha.webp` | Small face crops of the same portraits |
| `img/zone-classes.webp` | Woman on a mat with a kettlebell in the outdoor turf area |
| `img/train-together.webp` | A man and a woman in training kit talking on the gym floor |
| `img/hero-cafe.webp` | The café: timber counter, bench seating |
| `img/eat-together.webp` | Two friends laughing at lunch |
| `img/community-day.webp` | A group of women around a table |
| `img/rec-ice.webp` | The ice baths |
| `img/rec-jacuzzi.webp` | A woman resting at the jacuzzi edge |
| `img/rec-sauna.webp` | The sauna |

## Fonts and logo

**Fonts.** The page is set in Gilroy, as the handbook asks: ExtraBold for headlines, Bold for buttons, SemiBold for eyebrows, Regular for body text.

- The four WOFF2 files in `assets/fonts/` come from the Gilroy files the club hosts on its own website.
- **They are to be removed from this public repo after Patrick's review (Raoul's decision, 27 Oct 2026).** The Gilroy web licence is not confirmed yet.
- To remove them: delete `assets/fonts/`, delete the four `@font-face` rules in `assets/css/tokens.css`, and delete the two font `preload` lines in `index.html`. The page then falls back to Arial until a licensed web font is added. Deleting the files does not remove them from the git history (see the open items).

**Logo.** The logo files in `assets/logo/` are the club's own.

- `elitefit-logotype-white.svg` (header and footer) and `elitefit-logogram-black.svg` (the white card on the offer) are cut from the club's logo file by splitting its shapes. The black one only changes the fill colour. Nothing was traced or redrawn.
- `favicon.svg` is the logogram on a black tile.
- No PERFORM / RECHARGE lockup file is available yet (handbook page 13). The header shows the logotype with the word PERFORM beside it as a stand-in.

## Open items for the client

| # | Item | Why it matters |
| --- | --- | --- |
| 1 | The full handbook edition. Pages 33 onwards are missing (Imagery p. 33 to 37, Layout p. 38 onwards). Our file has 32 pages. | Photo and layout rules here follow the sample pages (p. 20 to 23), not the written rules. |
| 2 | The PERFORM lockup file (and RECHARGE) from handbook page 13 | The header uses a text stand-in. |
| 3 | The logo and font download links (handbook pages 8 and 25) | The links are not in the PDF. The logo came from the logo file in this repo, and Gilroy from the club's website. |
| 4 | The Gilroy web licence | Needed before the font files can stay in any public place. |
| 5 | Which WhatsApp number to use: +62 857-2022-1101 (membership, Perform and class schedule pages; used on this page) or +62 851-9552-0220 (promo page) | The two pages disagree. |
| 6 | Reski. He is in the handbook (page 21 coach row) but not on the club's timetable or trainer grid. | Not shown on this page until the club confirms. |
| 7 | The MOST POPULAR pill (white on terracotta, 14 px; 12 px in the pack list) has a contrast of 3.7:1. | That is below the 4.5:1 AA asks for text this small (3:1 applies only to large text). Kept as it is because it is the handbook's pattern (page 22). Confirm the club accepts it. |
| 8 | Whether the Tinos portrait shows Tinos or Martijn. The club's trainer grid lists "Martijn Taken" with a photo file named for Tinos. | The page names this coach Tinos. |
| 9 | Deleting Gilroy later. The font files stay in the git history of this public repo unless the history is rewritten. | Removing the files from the folder alone does not stop anyone fetching them from earlier commits. |

Also to confirm with the club:

- Thursday's first class: 08:00 or 08:30.
- The single class (300K) and 10-class (2M) prices, last seen on 2 Oct 2026.
- The sample items above (levels, descriptions, bios, welcome lines), before any of them goes on a live page.

## Tech notes

- Static files only: HTML, CSS, JavaScript, JSON, images and video. No backend, no build step, no accounts. Ready for GitHub Pages (project page, served from the `elitefit-ops` path), so all file paths are relative.
- Libraries: none. The script tags in `index.html` load five of our own files (`api.js`, `motion.js`, `media.js`, `booking.js`, `page.js`), all `defer`, in that order. No CDN, no third-party scripts, styles or fonts (checked 27 Oct 2026). Each script is plain ES5 in one function, so no GSAP or other animation library is used.
- Network: one same-origin `fetch` of `assets/data/groupfitness.json`. Nothing a visitor types is sent anywhere.
- Booking state is kept in `localStorage` under the key `ef-gf-v1`, inside try/catch, with an in-memory fallback when storage is blocked. The `.ics` calendar file is built in the browser.
- Dates and times are Bali time (UTC+8), whatever the device timezone.
- Video: MP4 H.264, muted, looped, `playsinline`, each with a poster image. Clips load only when near the screen. Reduced-motion and Save-Data settings show the posters instead.

### File map

| File | Purpose |
| --- | --- |
| `index.html` | The page: markup, meta tags, links to the CSS and JS |
| `og-gf-v1.jpg` | Share image for link previews, 1200 x 630, rendered from the page's own assets |
| `README.md` | This file |
| `assets/css/tokens.css` | The four brand colours (flat) plus opacity values, type scale, spacing, shape and motion values, Gilroy `@font-face` rules |
| `assets/css/gf.css` | Page layout and components, and the reveal effects at the bottom |
| `assets/css/booking.css` | Booking sheet, steps, forms, demo payment screen, confirmation and coach sheet (the five-step v1 engine). v1.4: the desktop panel starts below the pinned Now bar |
| `assets/css/sheet-v3.css` | v1.2: the Original's skin for the shared two-step engine (engine-v2). Loaded instead of booking.css once index.html switches to engine-v2 |
| `assets/js/api.js` | Demo "API": loads the JSON, works out the 7 days in Bali time, makes the sample spots from the class and date, saves bookings in `localStorage`, creates the `EF-DEMO-` reference and the `.ics` file. Also the `?now=` clock override. |
| `assets/js/motion-v3.js`, `assets/css/motion-v3.css` | v1.5: this page's motion engine and motion language (replaces motion.js here) |
| `assets/js/motion.js` | Enter-view reveals (rise, stagger, mask, deal), pointer tilt on coach photos, the spot counter roll. Native scroll only. Off for reduced motion and Save-Data. |
| `assets/js/media.js` | Lazy, pausable class clips: plays when 25 % visible, at most 2 at once on phones and 4 on desktop, Pause buttons |
| `assets/js/booking.js` | v1's original five-step engine. Since v1.6 no longer loaded by this page (it runs on `../engine-v2/`); kept for s3-home and the other pages that load it. |
| `assets/js/page.js` | Builds and wires the page: hero panels, First class / Been before toggle, Next up, class chapters, 7-day schedule and filter drawer, coaches, prices, sticky Book bar |
| `assets/data/groupfitness.json` | All class, coach, timetable, price and club data. Sample items carry `"sample": true` or are named in `"sample_fields"`. |
| `assets/fonts/` | Four Gilroy WOFF2 files: Regular, SemiBold, Bold, ExtraBold (to be removed, see above) |
| `assets/img/` | Photos, coach portraits and avatars, and one `-poster.webp` frame for each clip |
| `assets/video/` | Five MP4 clips: boxing, conditioning, sculpt, mobility, visit-entrance |
| `assets/logo/` | `elitefit-logotype-white.svg`, `elitefit-logogram-black.svg`, `favicon.svg` |
