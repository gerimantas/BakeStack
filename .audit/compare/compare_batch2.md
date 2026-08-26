# Compare Batch 2 — Master Tips 053–104 vs. site/data/tips.json

Audit pass only. No fixes applied. tips.json entries referenced by 0-based array index (title given for identification).

---

## Problems found

### Tip 053 — What's a Perfect Cheesecake for You? (Reader Engagement Post)
**Category: Merged wrongly.** Not present as its own entry. Its full text is appended to the END of tips.json[81] "FORMING THE PERFECT CHEESECAKE CRUST: STEP-BY-STEP GUIDE", which is actually a *different*, earlier tip (about forming the crust bottom with a bent tablespoon — not part of my assigned range, likely master Tip ~052 or earlier). Two unrelated tips are fused into one JSON record.
- Master: "What's a perfect cheesecake for you? What attracts you the most in this dessert? ... Share your preferences in the comments, please."
- tips.json[81] (tail of entry): "...approximately 57% of shortbread crumbs are used for the sides, while 43% are used for the bottom (I use 240 g and 180 g)\nWhat's a perfect cheesecake for you?..." — the crust how-to content and the reader-engagement post run together with no separation.

### Tip 055 — Forming the Perfect Cheesecake Crust: Sides (Using Fingers)
**Category: Title mismatch (minor) / ordering artifact.** Content matches tips.json[83] "FORMING THE PERFECT CHEESECAKE CRUST: STEP-BY-STEP GUIDE — 2" word-for-word — body is correct and complete. Flagging only because the JSON title suffix "— 2" implies it's the second half of the entry at [81], but it is chronologically the tip that should come *before* [81]'s bottom-forming instructions (Tip 055 = sides; the bottom-forming tip = a later step). Sequencing/labeling issue, not a content-loss issue.

### Tips 056–059 — Egg White Coagulation, Parts 1–4
**Category: Merged wrongly.** All four master tips (Part 1 intro, Part 2 quantity/temp/part-of-egg, Part 3 sugar/lipids/acid, Part 4 starch/salt/enzymes) are concatenated into a single tips.json entry: [84] "WHEN THE CHEESECAKE IS READY: EGG WHITE COAGULATION". Body text itself is complete and faithful (all 4 parts present in order, nothing dropped) — this is purely a wrong-merge/granularity issue, not data loss.

### Tip 060 — The Relevance of Fat Content in Dairy Products for Frosting
**Category: Content mismatch (truncation).** tips.json[85] matches the master almost to the end but is cut off before the closing line.
- Master ending: "...heightened pleasure for our taste buds!;)\n\nYou might have come across this information from me before, but in case you haven't, I'll reiterate:\n\n🖋 FAT MOLECULES ARE CARRIERS OF TASTE TO OUR TASTE RECEPTORS"
- tips.json[85] ending: "...heightened pleasure for our taste buds!;)\n\nYou might have come across this information from me before, but in case you haven't, I'll reiterate:" — stops right before the payoff line. Confirmed via full-corpus search: the phrase "FAT MOLECULES ARE CARRIERS" does not appear anywhere in tips.json.

### Tip 061 — Cultured Butter in Napoleon Cake Layers
**Category: Split wrongly (content intact).** Split across tips.json[86] "CULTURED BUTTER IN NAPOLEON CAKE LAYERS" (intro + butter type definitions) and [87] "MELTING POINT" (melting-point comparison + freezer/grating tips). Both halves match master content verbatim; only the single master tip is broken into two JSON records at a sub-heading boundary.

### Tip 062 — Interchangeability of Varieties of Flour, Part 2: Seed Flours
**Category: Split wrongly (content intact).** One master tip (flax, sesame, sunflower, amaranth, quinoa, hemp) is broken into 7 tips.json entries: [88] intro, [89] FLAX FLOUR, [90] SESAME FLOUR, [91] SUNFLOWER FLOUR, [92] AMARANTH FLOUR, [93] QUINOA FLOUR, [94] HEMP FLOUR. All sub-sections' content verified complete and faithful.

### Tip 063 — Interchangeability of Varieties of Flour: Nut Flours
**Category: Split wrongly (content intact).** One master tip (almond, pecan, cashew, peanut, tiger nut) is broken into 6 entries: [95] intro, [96] ALMOND FLOUR, [97] PECAN FLOUR, [98] CASHEW FLOUR, [99] PEANUT FLOUR, [100] TIGER NUT FLOUR. Content verified complete and faithful.

### Tip 064 — The Perfect Cheesecake: How to Choose a Cake Ring
**Category: Split wrongly (content intact).** One master tip split into 4 entries: [101] intro, [102] DIAMETER TO HEIGHT RATIO, [103] THICKNESS, [104] JOINT (WELD). Content complete and faithful.

### Tips 066 & 067 — How to Store Chocolate, Part 2 (Fat Bloom) and Part 3 (Sugar Bloom)
**Category: Merged wrongly.** Both master tips are concatenated into one entry, tips.json[106] "EVERYTHING YOU NEED TO KNOW ON HOW TO STORE CHOCOLATE" — Part 2's fat-bloom content runs directly into Part 3's sugar-bloom content with no separation. Content itself is complete (nothing dropped), just wrongly combined.
- tips.json[106] excerpt showing the seam: "...it loses its appealing gloss and crispness, and quickly melts upon touch.\npart 3\n\n#marusya_chocolate_storage\n\nIn the previous part we discovered..."

### Tip 068 — How Moisture Comes in Contact With Chocolate (Part 1)
**Category: Split wrongly (content intact).** One master tip split into tips.json[107] "HOW MOISTURE COMES IN CONTACT WITH CHOCOLATE?" (intro through "here's the first question...") and [108] "HOW LONG DOES CHOCOLATE LAST?" (the rest of Part 1: shelf-life table, moisture absorption, condensation, summary). Content complete and faithful across the two halves.

### Tip 069 — 60 Shades of Flour, Part 1: Full List by Category
**Category: Split wrongly (content intact).** One master tip (the full 60-item categorized list) split into 8 entries: [109] intro, [110] WHEAT, [111] GRAIN, [112] BEAN, [113] NUT, [114] FRUIT AND VEGETABLE, [115] SEED, [116] OTHER VARIETIES. All 60 flour names verified present. Entry [116] also runs on into Tip 070's opening line without a break (see below).

### Tip 070 — 60 Shades of Flour, Part 2: Top 5 Types Detailed
**Category: Split wrongly (content intact).** One master tip split across the tail of tips.json[116] (intro: "part 2 ... 5 most popular types") and entries [117] RICE FLOUR, [118] COCONUT FLOUR, [119] BUCKWHEAT FLOUR, [120] OAT FLOUR, and the head of [121] TEFF FLOUR. Content complete and faithful; the flour-name headers are used as tips.json titles.

### Tip 071 — 60 Shades of Flour, Part 3: Substitution Table Principles
**Category: Split wrongly (content intact) — good news.** Content sits at the tail of tips.json[121] "TEFF FLOUR" (after the teff paragraph, "part 3" begins and continues through the absorbency-factors bullet list). Complete and faithful; merely appended to an unrelated-title entry rather than the mis-split hurting content.

### Tip 073 — Flavor Pairing: Blackberry
### Tip 074 — Life Hack: How to Know When Zephyr Syrup Is Cooked Without a Thermometer
**Category: Merged wrongly.** Two completely unrelated master tips (a flavor-pairing post about blackberries, and a syrup-doneness life-hack post) are concatenated into a single tips.json entry, [124] "FLAVOR PAIRING. BLACKBERRY", with no separator between them.
- Seam in tips.json[124]: "...the vanilla notes, typical of both white chocolate and blackberries, will make this duet a "Perfect match" Just look at the cross section of the Chiffon honey cake with blackberries and white chocolate–coconut ganache\nLIFE HACK: HOW TO KNOW WHEN THE SYRUP FOR ZEPHYR IS COOKED WITHOUT A THERMOMETER..." — the blackberry post's closing sentence runs directly into the next post's title/body with no line break marking a new entry.

### Tip 075 — Why One Shouldn't Open the Oven While Baking a Sponge
### Tip 076 — Lumpy Cream Cheese Mixture: Why Does It Happen and How to Prevent It?
**Category: Merged wrongly.** Two more unrelated master tips (oven-opening/sponge-deflation science, and lumpy cream-cheese troubleshooting) are concatenated into one tips.json entry, [125] "WHY ONE SHOULDN'T OPEN THE OVEN WHILE BAKING A SPONGE".
- Seam in tips.json[125]: "...the gas will shrink back, the bubbles will become smaller, and if the protein has not yet had time to denature, the sponge will deflate.\nLUMPY CREAM CHEESE MIXTURE: WHY DOES IT HAPPEN AND HOW TO PREVENT IT?..." — again, no boundary between the two posts.

### Tip 077 — Honey Dough: 3 Consistencies You Should Know About
**Category: Split wrongly (content intact).** One master tip split into 4 entries: [126] intro/definitions, [127] STIFF HONEY DOUGH, [128] SOFT HONEY DOUGH, [129] LIQUID HONEY DOUGH (BATTER) (which also carries the tail "what does consistency affect" section). Content complete and faithful.

### Tips 079 & 080 — What You Need to Know About Mousses, Parts 1 & 2
**Category: Merged wrongly.** Both parts (mousse base/aerator intro, and cream-based mousses/gelatin thickener) are concatenated into a single tips.json entry, [131] "WHAT YOU NEED TO KNOW ABOUT MOUSSES", with the Part 2 heading embedded mid-text rather than starting a new record. Content itself complete and faithful.

### Tip 081 — Pistachio Paste: 2 Tips You Didn't Know About
**Category: Split wrongly (content intact).** One master tip split into 4 entries: [132] intro, [133] TIP #1, [134] TIP #2, [135] BRANDS I USE (*BONUS). Content complete and faithful.

### Tip 082 — How to Temper Eggs and Why You Need To, Part 1: Definition
**Category: Merged wrongly (spans into Tip 083).** tips.json[136] correctly holds most of Part 1, but its final section ("HOW TO TEMPER EGGS (IN BRIEF)" — the two numbered steps) is pushed into the START of the NEXT entry, [137], which then continues directly into Tip 083's Part 2 opening with no boundary at all.
- Seam in tips.json[137]: "1. Slowly stream the hot/boiling liquid into the cold/room-temperature eggs while whisking.\n2. Pour the warm eggs back into the saucepan.\npart 2\n\n#marusya_theory_tips\n\nIn a previous post, we discussed with you what tempering eggs is..." — Tip 082's closing steps and Tip 083's Part 2 intro are fused with zero separation, and the tips.json title for [137] ("HOW TO TEMPER EGGS (IN BRIEF)") reflects only the Tip-082 fragment, hiding the Tip-083 content that follows it.

### Tip 083 — How to Temper Eggs and Why You Need To, Part 2: Why & How Much Liquid
**Category: Split wrongly (content intact, but see above).** Its intro is buried at the tail of [137] (see Tip 082 finding above); the rest is correctly split across [138] "WHY WE NEED TO TEMPER EGGS" and [139] "HOW MUCH HOT LIQUID SHOULD BE ADDED TO EGGS". All wording verified complete and faithful once the [137] fragment is accounted for.

### Tip 084 — Hydrocolloids in Confectionery Art, Part 1: What Are Hydrocolloids?
**Category: Merged wrongly (spans into Tip 085).** tips.json[140] "HYDROCOLLOIDS IN CONFECTIONERY ART" holds all of Part 1 AND all of Part 2's intro (down through "...let's get acquainted with the most mysterious representative...") concatenated with no boundary, before [141] "Carrageenan" picks up the rest of Part 2.
- Seam inside [140]: "...P.S. Let me give you a little hint — hydrocolloids are often used in modern molecular cuisine\npart 2\n\n#marusya_hydrocolloids\n\nJudging by the answers in the comments section under the previous part of this post..." — Part 1 and Part 2's opening are fused into a single JSON record.

### Tip 085 — Hydrocolloids in Confectionery Art, Part 2: Applications & Carrageenan
**Category: Split wrongly (content intact, but see above).** Intro portion buried inside [140] (see Tip 084 above); Carrageenan section correctly isolated in [141]. Content complete and faithful once both fragments are combined.

### Tip 086 — Everything You Need to Know About Ganaches, Part 1: What Is Ganache?
tips.json[142] "EVERYTHING YOU NEED TO KNOW ABOUT GANASHES" — **Match confirmed correct** (see list below) EXCEPT its true continuation (Part 2) is not attached here; instead Part 2's opening got relocated (see Tip 087 below). Entry [142] itself is complete and faithful for Part 1's own content.

### Tip 087 — Everything You Need to Know About Ganaches, Part 2: Chocolate Used in Ganache
**Category: Split wrongly AND misplaced (severe).** This tip's OPENING (the "Part 2 ... One of the last posts of 2022 was dedicated to ganache theory..." intro through "...Impact factors") is misfiled at the very end of tips.json[167] "ATTENTION" — an entry whose title and preceding content are entirely about HONEY (Tip 104's tail plus an out-of-range honey "Part 4" tip). The REST of Tip 087 (the TEXTURE/TASTE sub-sections) is misfiled at the very START of tips.json[168] "Ganache Components: Liquid, Butter, Sugar, and Additives" (which itself is a large wrong-merge — see below), continuing mid-sentence with no title or separator.
- tips.json[167] seam: "...I advise you not to neglect this step... Ratio of adding lemon juice to honey dough\n\n1-1.5 g per every 100 g of dough\n\nPart 2\n\n#marusya_about_ganache\n\nOne of the last posts of 2022 was the dedicated to ganache theory...Impact factors" (entry ends here, mid-topic)
- tips.json[168] seam: begins "TEXTURE\n thanks to the cocoa butter, ganache becomes fluid when heated..." — this is Tip 087's own TEXTURE section, but it opens entry [168] with no title/heading identifying it as ganache content at all (the [168] title only reflects later content).
This is the most severely scrambled tip in the batch: honey content and ganache content are interleaved with no boundaries, and Tip 087 itself is torn in half across two unrelated-looking JSON titles.

### Tips 088–091 — Everything You Need to Know About Ganaches, Parts 3–6
**Category: Merged wrongly (all 4 parts into one entry, itself mislabeled).** All four master tips (Part 3: liquid types & dosage; Part 4: butter; Part 5: sugar/sorbitol/aromatics; Part 6: why ganache splits & storage) are concatenated into the single tips.json[168] entry "Ganache Components: Liquid, Butter, Sugar, and Additives" (which, per the Tip 087 finding above, ALSO contains Tip 087's tail at its very start). Content of Parts 3–6 themselves is complete and faithful — verified all dosage figures (milk max 40%, cream 20–50%, puree max 50%, butter 5–15%, sugar ≥25%, sorbitol 1.5–2.5%) and the split/storage tips at the end match master exactly. The only problem is that 5 distinct master tips (tail of 087 + 088 + 089 + 090 + 091) are jammed into one JSON record with a title that describes only part of the content.

### Tip 092 — A Crash Course in Chocolate, Part 1: What Is Chocolate & Composition
**Category: Split wrongly (content intact) + wrong-merge at the tail.** Split cleanly across [143] intro, [144] WHAT IS CHOCOLATE?, [145] TYPES OF CHOCOLATE AND ITS COMPOSITION, [146]-[148] the three composition lists, [149] WHAT ELSE CAN BE IN..., [150] WHAT YOU SHOULD NOT HAVE IN CHOCOLATE — all faithful. However, its final two lines ("the percentage indicated on the WHITE chocolate packaging...") are pushed into the head of [151] "BUT", where Tip 093 is then appended with no boundary (see below).

### Tip 093 — A Crash Course in Chocolate, Part 2: Brands
**Category: Merged wrongly + content mismatch (missing brand).** Concatenated onto the tail of Tip 092 inside tips.json[151] "BUT" with no separating title of its own, running straight into Part 3's opening line at the very end. Separately, and more importantly: **IRCA is missing from the brand bullet list.**
- Master list: "🔸 IRCA (Italy) / 🔸 DGF (France) / 🔸 Natra Cacao (Spain) / 🔸 Cacao Barry (France) / 🔸 Lubeca (Germany) / 🔸 Callebaut (Belgium)" — 6 brands.
- tips.json[151]: "- DGF (France)\n- Natra Cacao (Spain)\n- Cacao Barry (France)\n- Lubeca (Germany)\n- Callebaut (Belgium)" — only 5 brands; IRCA is dropped from the list (it is still mentioned once in prose later: "I also enjoy working with brands such as IRCA and Lubeca", but the bullet-list entry itself is gone). Confirmed via full-corpus search — the string "IRCA (Italy)" does not appear anywhere in tips.json.

### Tip 094 — A Crash Course in Chocolate, Part 3: Tempering Definition & Classic Method
**Category: Split wrongly (content intact) + wrong-merge at the tail.** Split across [152] WHAT IS TEMPERING?, [153] METHODS FOR TEMPERING CHOCOLATE, [154] CLASSIC TEMPERING METHOD — faithful. Its final line ("The trick is that the callets themselves are already tempered...") opens [155] "SEEDING METHOD OR CALLET TEMPERING", where Tips 095 and 096 are then appended with no boundaries (see below).

### Tips 095 & 096 — A Crash Course in Chocolate, Part 4 (Seeding Method Detail) and Part 5 (Secrets of Seeding Method)
**Category: Merged wrongly.** Both parts, plus the Tip 094 tail noted above, plus Tip 097's opening line, are all concatenated into the single entry tips.json[155] "SEEDING METHOD OR CALLET TEMPERING" with no separating titles between the four pieces of content. Content of Parts 4 and 5 themselves verified complete and faithful (all temperature figures and the 6-point secrets list match master).
- Seam example inside [155]: "...white chocolate is much thicker than dark or milk chocolate — to make it easier to work with, add a little cocoa butter along with the callets to it\npart 6\n\n#marusya_about_chocolate\n\nToday I suggest talking about a very interesting product..." (Part 5 ends and Tip 097/Part 6 begins mid-entry).

### Tip 097 — A Crash Course in Chocolate, Part 6: What Is Mycryo?
**Category: Split wrongly (content intact).** Opening line buried at the tail of [155] (see above); body correctly split across [156] WHAT IS MYCRYO?, [157] HOW IS MYCRYO OBTAINED?, [158] TYPES OF COCOA BUTTER CRYSTALS. Content complete and faithful. Its final line ("Chocolate tempering with Mycryo — the conventional technique VS method I use.") is pushed into the head of [159] along with Tip 098 (see below), but this is a minor spillover, not data loss.

### Tip 098 — A Crash Course in Chocolate, Part 7: Mycryo Tempering
**Category: Split wrongly (content intact).** Split across [159] CONVENTIONAL TECHNIQUE FOR CHOCOLATE TEMPERING WITH MYCRYO and [160] MY CHOCOLATE TEMPERING METHOD USING MYCRYO. Content complete and faithful, including the corrected 2% Mycryo dosage note.

### Tips 102, 103, 104 — Honey: Myths vs. Reality, Parts 1, 2, 3
**Category: Merged wrongly (102+103+104's head) + further scrambling at 104's tail.** Parts 1–2–3 are concatenated into a single entry, tips.json[166] "HONEY. MYTHS VS REALITY", with "part 2" and "part 3" markers embedded mid-text rather than starting new records. Content of Parts 1–2 and the start of Part 3 is complete and faithful. Tip 104's remaining content (honey substitutes, allergy note, sugar-to-honey ratio) spills into tips.json[167] "ATTENTION", which ALSO contains an out-of-range honey "Part 4" tip and the misplaced opening of Tip 087 (ganache) — see the Tip 087 finding above for the full detail on that entry's severe scrambling.

---

## Confirmed correct matches (content verified faithful; no detail needed)

Tip 054, Tip 065, Tip 078, Tip 099, Tip 100 (across its 3-way split), Tip 101, Tip 086 (Part 1 content itself, aside from its missing Part 2 continuation).

Additionally, the following tips are correct in CONTENT once their (wrongly split or wrongly merged) fragments are reassembled — i.e., no text is missing, altered, or corrupted, only mis-grouped into JSON record boundaries — and are not repeated in the problems list above beyond their entry: 055, 056–059, 061, 062, 063, 064, 066–067, 068, 069, 070, 071, 073 (content itself, aside from the merge), 074 (content itself, aside from the merge), 075 (content itself, aside from the merge), 076 (content itself, aside from the merge), 077, 079–080, 081, 082–083 (content itself, aside from the merge/misplacement), 084–085 (content itself, aside from the merge), 088–091 (content itself, aside from the merge), 092, 094, 095–096 (content itself, aside from the merge), 097, 098.

---

## Summary of distinct-content problems (excluding pure split/merge granularity, which is listed separately above)

1. **Tip 053** — entirely unlabeled, buried inside a wrong-merge with an unrelated tip (effectively "missing" as a discoverable, correctly-titled entry).
2. **Tip 060** — truncated; final tagline sentence ("FAT MOLECULES ARE CARRIERS OF TASTE TO OUR TASTE RECEPTORS") is missing entirely from tips.json.
3. **Tip 093** — the brand "IRCA (Italy)" is dropped from its bullet list (content mismatch / data loss), on top of being wrong-merged with Tips 092 and 094.
4. **Tip 087** — severely scrambled: its two halves are separated and buried inside two different, unrelated-looking entries ([167] "ATTENTION", which is primarily about honey, and [168] "Ganache Components..."), with the honey and ganache series interleaved with no clean boundary anywhere in that stretch of the file.

All other findings in this batch are wrong-merge or wrong-split *granularity* issues (multiple small master tips squashed into one JSON record, or one master tip broken across several JSON records) where the underlying prose itself was not corrupted — flagged per the assignment's categories, but lower severity than the four content-loss/scrambling issues above.
