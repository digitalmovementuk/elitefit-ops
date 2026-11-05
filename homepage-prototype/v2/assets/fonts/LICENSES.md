# Fonts in this folder: licences and provenance

Version: v3.0 — 2026-10-02 · owner: design-system lane (D1). Both families are open (SIL Open Font License 1.1), self-hosted, Latin subset, woff2. Nothing of The Performance Lab's font files is here: its families (KH Teka, Aeonik Mono) are commercial and were never downloaded; the open twins below were chosen by measurement and a side-by-side render (research/lab/system/tokens/FONT-LICENCE-FINDING.md, DESIGN-SYSTEM-PERFLAB.md §Fonts).

| File | Family · style | Font version | Licence | Source (downloaded 2026-10-02) | Subset | Size |
|---|---|---|---|---|---|---|
| `hanken-grotesk-latin-wght.woff2` | Hanken Grotesk, variable weight 100–900, upright | 3.013 (Fontsource `@fontsource-variable/hanken-grotesk` 5.3.0, Google Fonts v12) | SIL OFL 1.1 | npm registry: `npm pack @fontsource-variable/hanken-grotesk` → `package/files/hanken-grotesk-latin-wght-normal.woff2`; upstream https://github.com/marcologous/hanken-grotesk ; https://fontsource.org/fonts/hanken-grotesk | latin (U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD), 268 glyphs | 34,704 B · sha256 e9201edd…b4a9d5 |
| `fragment-mono-latin-400.woff2` | Fragment Mono, Regular 400, upright (static; the family has no other weights) | 1.011 (Fontsource `@fontsource/fragment-mono` 5.3.0, Google Fonts v6) | SIL OFL 1.1 | npm registry: `npm pack @fontsource/fragment-mono` → `package/files/fragment-mono-latin-400-normal.woff2`; upstream https://github.com/weiweihuanghuang/fragment-mono ; https://fontsource.org/fonts/fragment-mono | latin (same ranges), 326 glyphs | 25,224 B · sha256 44c4e39b…a86b56 |

First-view font transfer: 59,928 B for both files (budget 120 KB). Only the display face is preloaded (CONTRACT §7); the mono loads with the stylesheet.

Copyright lines (from the packages' LICENSE files):
- Hanken Grotesk: Copyright 2021 The Hanken Grotesk Project Authors (https://github.com/marcologous/hanken-grotesk)
- Fragment Mono: Copyright 2022 The Fragment-Mono Project Authors (https://github.com/weiweihuanghuang/fragment-mono)

What the OFL allows and requires (plain words): use, embed, self-host, bundle and redistribute, also commercially, as long as this licence text travels with the fonts; the fonts may not be sold on their own; a modified font may not use the Reserved Font Name; the fonts are provided as is. The files here are unmodified Fontsource builds (subset by Fontsource, not by us).

## SIL Open Font License, Version 1.1 (full text, identical for both families)

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide development of collaborative font projects, to support the font creation efforts of academic and linguistic communities, and to provide a free and open framework in which fonts may be shared and improved in partnership with others.

The OFL allows the licensed fonts to be used, studied, modified and redistributed freely as long as they are not sold by themselves. The fonts, including any derivative works, can be bundled, embedded, redistributed and/or sold with any software provided that any reserved names are not used by derivative works. The fonts and derivatives, however, cannot be released under any other type of license. The requirement for fonts to remain under this license does not apply to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright Holder(s) under this license and clearly marked as such. This may include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the copyright statement(s).

"Original Version" refers to the collection of Font Software components as distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting, or substituting -- in part or in whole -- any of the components of the Original Version, by changing formats or by porting the Font Software to a new environment.

"Author" refers to any designer, engineer, programmer, technical writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components, in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled, redistributed and/or sold with any software, provided that each copy contains the above copyright notice and this license. These can be included either as stand-alone text files, human-readable headers or in the appropriate machine-readable metadata fields within text or binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font Software shall not be used to promote, endorse or advertise any Modified Version, except to acknowledge the contribution(s) of the Copyright Holder(s) and the Author(s) or with their explicit written permission.

5) The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license, and must not be distributed under any other license. The requirement for fonts to remain under this license does not apply to any document created using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.

## Change log
- v3.0 — 2026-10-02: created; Hanken Grotesk 3.013 and Fragment Mono 1.011 added from the Fontsource 5.3.0 packages.
