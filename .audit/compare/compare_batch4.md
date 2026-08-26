# Compare Batch 4 — Master Tips 157–207 vs tips.json

Scope: MASTER_rebuilt_tips.md Tip 157 through Tip 207 (51 tips) compared against all 310
entries in site/data/tips.json. This is a comparison/audit only — no fixes applied.

---

## PROBLEMS FOUND

### Tip 166 — What You Need to Know About Gelatin (Can Gelatin Be Boiled?)
**tips.json entry:** "WHAT YOU NEED TO KNOW ABOUT GELATIN" (idx 281)
**Category:** MERGED WRONG (with content that belongs to Tip 168)

The tips.json entry starts correctly with Tip 166's full "can gelatin be boiled" content, but
then — with **no separator, heading, or transition** — it continues directly into the opening
paragraphs of Tip 168 ("Gelatin: Converting Between Different Strengths"), stopping partway
through (cuts off right before "‼️HERE'S THE FORMULA:", which was carved out into its own
tips.json entry, idx 282, titled "HERE'S THE FORMULA:").

- Master Tip 166 ends: *"...it should be remembered that the strength of gelatin is significantly reduced in an acidic environment (pH < 5) and in the presence of protease enzymes."*
- tips.json idx 281 continues right after that sentence with: *"We've already talked about what gelatin is, its usage, types, as well as forms of gelatin and its strength. The beginning of the article can be found by the hashtag #marusya_about_gelatin / Today I suggest talking about conversion between different strengths of gelatin..."* — this is Tip 168's opening, glued on with zero separation.

### Tip 168 — Gelatin: Converting Between Different Strengths (Bloom Conversion Formula)
**tips.json entries:** SPLIT across three entries — tail of idx 281 ("WHAT YOU NEED TO KNOW ABOUT GELATIN"), idx 282 ("HERE'S THE FORMULA:"), idx 283 ("G1÷G2")
**Category:** SPLIT WRONG (and merged wrong at the front, see Tip 166 above)

Tip 168's content is scattered: its opening ("We've already talked about what gelatin is...")
is wrongly appended to the end of the Tip 166 entry (idx 281); the middle ("‼️HERE'S THE
FORMULA: In order to convert...") became its own standalone entry (idx 282) with only one
sentence of body text; the worked example and conclusion became a third entry (idx 283, "G1÷G2").
None of these three fragments carries Tip 168's own title — the parser used inline sub-headers
as titles instead of the real post title.

### Tip 169 — Shelf Life of Frosting
**tips.json entry:** "SHELF LIFE OF FROSTING" (idx 284)
**Category:** Match confirmed correct (content is complete and faithful)

### Tip 170 — Conversion of Recipes for Any Size Cake Molds
**tips.json entries:** SPLIT across "CONVERSION OF RECIPES FOR ANY SIZE CAKE MOLDS" (idx 285) and "SO, HERE'S THE FORMULA:" (idx 286)
**Category:** SPLIT WRONG

Same pattern as Tip 168: the intro paragraphs became one entry, and the formula walkthrough
("d1² ÷ d2²" onward, including the worked 18cm/20cm example and closing P.S.) became a second,
separately-titled entry using an inline sub-header as the title instead of the real post title.
Content itself is not lost, but it is incorrectly presented as two unrelated tips.

### Tip 171 — Cake Coating, Common Problems: Leaking Liquid — Whey
**tips.json entry:** "CAKE COATING. COMMON PROBLEMS" (idx 287)
**Category:** MERGED WRONG (with Tip 172's content, and mid-sentence at that)

idx 287 starts with Tip 171's full whey/leaking-liquid content (matches master exactly through
"...That cream cheese released 3-4 times more whey than Cremette. As a result, in the morning
there were several tablespoons of sweet liquid on the cake base."), but then continues directly
with Tip 172's cake-press content ("Last couple of words about putting the press on the
cake...") with no separator at all — two distinct posts fused into one tips.json entry.

### Tip 172 — Cake Coating, Common Problems: The Cake Press
**tips.json entry:** tail of "CAKE COATING. COMMON PROBLEMS" (idx 287, same entry as Tip 171)
**Category:** MERGED WRONG (duplicate finding of the Tip 171 bug above — recorded once)

- Master Tip 172 begins: *"CAKE COATING. COMMON PROBLEMS / Last couple of words about putting the press on the cake and we'll proceed to the last part of the article - leaking liquid from the assembled cake."*
- In tips.json idx 287 this text appears mid-paragraph, directly glued onto the end of Tip 171's whey content, with the repeated header "CAKE COATING. COMMON PROBLEMS" stripped out (since the JSON entry can only have one title).

### Tip 173 — How to Make a Perfect Cheesecake (Myths, Baking, Cooling, Decorating, Storage — Q&A)
**tips.json entry:** "HOW TO MAKE A PERFECT CHEESECAKE" (idx 288)
**Category:** Match confirmed correct (full Q&A content present and faithful)

### Tip 174 — What You Need to Know About Gelatin, Part 1
Per the master file's own note, Tip 174 is a documented duplicate-capture of Tip 167 (same
source post, captured twice at a batch seam) and "is not repeated as its own tip" in the master
count. No separate tips.json comparison needed — see Tip 167 (out of this batch's range, but
noted for completeness: idx 289 "WHAT YOU NEED TO KNOW ABOUT GELATIN — 2" matches Tip 167's
content faithfully at its start).

### Tip 175 — Cake Coating, Common Problems: Air Bubbles (Why They Form, Press Pros/Cons)
**tips.json entry:** "CAKE COATING. COMMON PROBLEMS — 2" (idx 291)
**Category:** MERGED WRONG (with Tip 176's content)

idx 291 contains Tip 175's full air-bubbles/press content, matching the master closely, but then
continues directly into Tip 176's content ("Yesterday we discussed the possible reasons why the
filling may get out of the cake in the form of bubbles on the coating...") with only a stray
literal backslash character (`\Yesterday we discussed...`) marking the seam — no real separator.

### Tip 176 — Cake Coating, Common Problems: Where Air Bubbles Come From (Mechanism)
**tips.json entry:** tail of "CAKE COATING. COMMON PROBLEMS — 2" (idx 291, same entry as Tip 175)
**Category:** MERGED WRONG (duplicate finding of the Tip 175 bug — recorded once)

- Master Tip 176 begins: *"CAKE COATING. COMMON PROBLEMS / Yesterday we discussed the possible reasons why the filling may get out of the cake in the form of bubbles on the coating..."*
- tips.json idx 291 has this glued onto the end of Tip 175's text as `\Yesterday we discussed the possible reasons...` (note the literal backslash artifact) — no title, no paragraph break in the JSON.

### Tip 177 — Cake Coating, Common Problems: Deviating from Instructions & Incorrect Assembly
**tips.json entry:** "CAKE COATING. COMMON PROBLEMS — 3" (idx 292)
**Category:** MERGED WRONG (with Tip 178's content)

idx 292 contains Tip 177's content in full, then continues directly with Tip 178's content
("... Quite often, by the way, it is the filling itself that tries to get out...") — correctly
preserving the mid-sentence ellipsis join that the master itself flags as intentional
continuation, but incorrectly fusing what the master treats as two distinct numbered tips into
one JSON entry.

### Tip 178 — Cake Coating, Common Problems: Root Cause (Pectin/Gelatin Types)
**tips.json entry:** tail of "CAKE COATING. COMMON PROBLEMS — 3" (idx 292, same entry as Tip 177)
**Category:** MERGED WRONG (duplicate finding of the Tip 177 bug — recorded once)

### Tip 179 — Cake Coating, Common Problems: Cracked Coating — Causes and Fixes
**tips.json entry:** tail of "CAKE COATING. COMMON PROBLEMS — 3" (idx 292) — continues even further, past Tip 178's content
**Category:** MERGED WRONG (three tips fused into one JSON entry)

idx 292 does not stop after Tip 178's content — it continues directly into Tip 179's full
cracked-coating text ("- You deviated from the cooking instructions. It's your fault if... So,
the first problem which we've already discussed was cracked coating...") through to the end
("If the article was helpful, leave 👍🏻 in the comments and I'll write a continuation."). So
tips.json idx 292 = master Tips 177 + 178 + 179 all in a single entry, three separate posts
merged into one.

### Tip 180 — What You Need to Know About Gelatin, Part 2 (Gelatin Mass, Sheet, Bloom Strength)
**tips.json entries:** SPLIT across "WHAT YOU NEED TO KNOW ABOUT GELATIN — 3" (idx 293) and "SHEET" (idx 294)
**Category:** SPLIT WRONG

Tip 180's content is split at the "📌 SHEET" sub-header: the gelatin-mass intro became entry
idx 293 (titled with a generic reused gelatin header), and everything from "The gelatin sheets
are soaked..." onward (sheet gelatin, Bloom classification table, dosage guidance) became a
separate entry idx 294 titled simply "SHEET" — an inline sub-header masquerading as a tip title.

### Tip 181 — Cream Cheese vs Mascarpone — What's the Difference
**tips.json entry:** "LET'S FIND OUT MORE ABOUT CREAM CHEESES" (idx 295)
**Category:** MERGED WRONG (with Tips 182, 183, and 184 — four tips fused into one entry)

idx 295 begins correctly with Tip 181's content, but then runs — with no separators — straight
through Tip 182 ("I kindly ask you to support the post with ❤ and any emoticon..."), Tip 183
("So, we figured out the difference between cream cheese and Mascarpone... Now let's talk about
different brands..."), and Tip 184 ("Since you supported the continuation of the story with
comments, I am posting its end...", ending with "...ask in the comments!"). This single
tips.json entry (idx 295) contains what the master correctly treats as four distinct posts (Tips
181–184), including the entire "Kuala Lumpur buttercream story" cliffhanger-and-payoff pair.

### Tip 182 — Cream Cheese vs Mascarpone — When They ARE and ARE NOT Interchangeable
**tips.json entry:** mid-section of idx 295 (same entry as Tip 181)
**Category:** MERGED WRONG (duplicate finding of the Tip 181 bug — recorded once)

### Tip 183 — Cream Cheese Brands — Cremette vs Philadelphia, and the Malaysia Story (setup)
**tips.json entry:** mid-section of idx 295 (same entry as Tip 181)
**Category:** MERGED WRONG (duplicate finding of the Tip 181 bug — recorded once)

### Tip 184 — The Kuala Lumpur Buttercream Story — Ending
**tips.json entry:** tail of idx 295 (same entry as Tip 181)
**Category:** MERGED WRONG (duplicate finding of the Tip 181 bug — recorded once)

Notably: master's Tip 183 ends on a cliffhanger ("If you are curious to know the end of the
story, leave an emoticon...") and Tip 184 explicitly resumes with the payoff ("Since you
supported the continuation of the story with comments, I am posting its end...")  — these were
clearly published as two separate posts on two different days, yet tips.json fuses them
seamlessly into idx 295 alongside Tips 181 and 182 as well.

### Tip 185 — What You Need to Know About Ganache, Part 1
**tips.json entry:** "WHAT YOU NEED TO KNOW ABOUT GANACHE" (idx 296)
**Category:** MERGED WRONG (with Tips 186, 187, 188, 189 — AND bleeds into Tips 190/191 — six+ tips fused into one entry)

This is the most severe merge found in this batch. idx 296 begins with Tip 185's ganache intro
and methods, then runs uninterrupted through:
- Tip 186 ("Broken ganache. Possible reasons and way outs...")
- Tip 187 ("Today we'll analyze the components of ganache... 🌿 Chocolate...")
- Tip 188 ("In continuation of the article let's continue analyzing the components...")
- Tip 189 ("The continuation of the article where I analyze the components... 🌿 Sugar...",
  including the full basic ganache recipe and the "P.S. Kyiv cake... Would you like to taste
  it?" closer)
- and then, with **zero separation whatsoever**, directly into Tip 190's opening: *"CARAMELIZATION AND THE MAILLARD REACTION - IS IT THAT EASY TO MAKE CARAMEL? Part 1..."* and continues through the **entirety of Tip 191** as well (Maillard reaction explanation, the cream/butter caramel temperature answer), ending on "...which enhances the aroma and provides a darker shade of caramel."

So tips.json idx 296 = master Tips 185 + 186 + 187 + 188 + 189 + 190 + 191, seven consecutive
posts, all fused into a single JSON entry titled only "WHAT YOU NEED TO KNOW ABOUT GANACHE."
The ganache-recipe closing ("Would you like to taste it?") and the caramelization opening
("CARAMELIZATION AND THE MAILLARD REACTION...") appear back-to-back with no paragraph break,
title, or any marker that a new, unrelated topic has begun.

### Tip 186 — Ganache — Broken Ganache Fixes and Storage/Stabilization Tips
**tips.json entry:** mid-section of idx 296
**Category:** MERGED WRONG (duplicate finding of the Tip 185 mega-merge — recorded once)

### Tip 187 — Ganache Components — Chocolate and Liquid
**tips.json entry:** mid-section of idx 296
**Category:** MERGED WRONG (duplicate finding of the Tip 185 mega-merge — recorded once)

### Tip 188 — Ganache Components — Whipping Cream Protein, Fats/Butter
**tips.json entry:** mid-section of idx 296
**Category:** MERGED WRONG (duplicate finding of the Tip 185 mega-merge — recorded once)

Note also: content is present but one sentence appears truncated relative to the master — master
Tip 188 reads *"if you add butter at the end of cooking... the ganache will acquire a smooth and
creamy consistency"* — this text is present in idx 296 correctly. No further mismatch found
beyond the merge itself.

### Tip 189 — Ganache — Sugar, Additives (Sorbitol), Aromatics, and Full Recipe
**tips.json entry:** mid/tail-section of idx 296
**Category:** MERGED WRONG (duplicate finding of the Tip 185 mega-merge — recorded once)

### Tip 190 — Caramelization and the Maillard Reaction, Part 1 (Caramelization Basics)
**tips.json entry:** tail of idx 296 ("WHAT YOU NEED TO KNOW ABOUT GANACHE")
**Category:** MERGED WRONG — this is a particularly serious case since it means an entire tip
about an unrelated topic (caramelization) is filed under a ganache-titled entry with no
indication at all that the subject has changed.

- Master Tip 190 title: "Caramelization and the Maillard Reaction, Part 1"
- tips.json: this content has NO entry of its own and NO title reflecting its topic — it is
  buried inside idx 296, which is tagged and titled entirely for ganache.

### Tip 191 — Caramelization and the Maillard Reaction, Part 2 (Maillard Reaction Explained)
**tips.json entry:** tail of idx 296 ("WHAT YOU NEED TO KNOW ABOUT GANACHE")
**Category:** MERGED WRONG (duplicate finding — same entry, same problem as Tip 190 above)

Confirmed via tags: idx 296's tags array includes both ganache-specific tags (`cocoa-butter`,
`whipping-cream`) AND `caramelization`, `maillard-reaction`, `glucose-syrup` — direct evidence
that unrelated topical content was merged into one entry.

### Tip 192 — Pectin vs Agar-Agar vs Gelatin — The Difference
**tips.json entry:** "PECTIN, AGAR-AGAR AND GELATIN. WHAT'S THE DIFFERENCE?" (idx 297)
**Category:** Match confirmed correct (title and content faithful; tips.json even preserves the "Russian version @ma_rusya_manko" line that master's own notes say was likely an extraction artifact — a minor curiosity, not a discrepancy worth flagging as a problem)

### Tip 193 — Sour Cream and Cream — Whipping Cream Types and Fat Content
**tips.json entry:** "SOUR CREAM AND CREAM – LET'S HACK THE ISSUE!" (idx 298)
**Category:** MERGED WRONG (with Tips 194, 195, 196, 197, 198, 199 — SEVEN tips fused into one entry)

This is the second mega-merge found in this batch, on the same scale as the ganache one. idx
298 begins with Tip 193's whipping-cream content and teaser ("I'll tell you in the continuation
of a series of posts about sour cream and cream"), then runs straight through with no
separators into:
- Tip 194 ("This time we will talk about sour cream. The name of this product is familiar to everyone speaking Slavic languages...")
- Tip 195 ("Can we work with homemade cream? I can't categorically say 'no'...")
- Tip 196 ("Why should we chill the whipping cream before whipping?...")
- Tip 197 ("Today I suggest talking about the difference between sour cream and crème fraîche...")
- Tip 198 ("Today let's figure out what's better to use for frosting — low-fat sour cream or crème fraîche...")
- Tip 199 ("Today we will find out what else can be used instead of sour cream in recipes...", ending "...you can safely replace it with Greek yogurt and kefir or buttermilk.")

tips.json idx 298 = master Tips 193 + 194 + 195 + 196 + 197 + 198 + 199 — an entire seven-part
educational series about sour cream, crème fraîche, and cream all fused into a single JSON
entry titled only for the first post in the series.

### Tip 194 — Sour Cream — Origins, Types, Quality, and Substitutes
**tips.json entry:** mid-section of idx 298
**Category:** MERGED WRONG (duplicate finding of the Tip 193 mega-merge — recorded once)

### Tip 195 — Homemade Cream — Can You Use It?
**tips.json entry:** mid-section of idx 298
**Category:** MERGED WRONG (duplicate finding — recorded once)

### Tip 196 — Chilling Whipping Cream Before Whipping, and Checking Quality at Home
**tips.json entry:** mid-section of idx 298
**Category:** MERGED WRONG (duplicate finding — recorded once)

### Tip 197 — Sour Cream vs Crème Fraîche — The Difference (Abroad Context)
**tips.json entry:** mid-section of idx 298
**Category:** MERGED WRONG (duplicate finding — recorded once)

### Tip 198 — Frosting Choice — Low-Fat Sour Cream vs Crème Fraîche
**tips.json entry:** mid-section of idx 298
**Category:** MERGED WRONG (duplicate finding — recorded once)

### Tip 199 — Sour Cream Substitutes — Greek Yogurt and Mascarpone-with-Cream
**tips.json entry:** tail of idx 298
**Category:** MERGED WRONG (duplicate finding — recorded once)

### Tip 200 — A Perfect Cheesecake — Myths vs Reality (Room Temperature Ingredients)
**tips.json entry:** "A PERFECT CHEESECAKE. MYTHS VS REALITY" (idx 299)
**Category:** Match confirmed correct (content complete and faithful, ends correctly at "...Its depth directly depends on how much you whipped the cheese mass.")

### Tip 201 — Cheesecake — Hot vs Cold Infusion Method, and Baking-Ring Myths
**tips.json entry:** "HOW TO MAKE A PERFECT CHEESECAKE — 2" (idx 300)
**Category:** MERGED WRONG (with Tip 202's content)

idx 300 contains Tip 201's full content (hot infusion method, baking-ring myths, unmolding
tips), but then continues directly into Tip 202's water-bath-temperature content ("ℹCheesecake
must be baked at low temperatures (not higher than 120 °C / 248 °F) with a water bath...")
without any separator, and Tip 202's content is itself then cut off mid-way (the tips.json
version stops after "...prevent it from being burnt" but omits nothing else — see Tip 202 entry
below for the rest, which continues into Tip 203's content too).

### Tip 202 — Cheesecake Baking Temperature — Water Bath Explained, Oven Modes
**tips.json entry:** tail of "HOW TO MAKE A PERFECT CHEESECAKE — 2" (idx 300, same entry as Tip 201)
**Category:** MERGED WRONG (three tips fused: 201 + 202 + start of 203)

idx 300 continues past Tip 202's full content directly into Tip 203's opening ("- Add the
flavouring directly to the cheese mass. 🔹️ What could it be?...ends with "...As for the cold
method, it is enough to add flavoring to the cream / milk and leave it overnight..." which is
the master's Tip 203 text, but STOPS before Tip 203's actual closing (the master's Tip 203 ends
identically at "...leave it overnight, or even better for a day, in the fridge." — so this part
matches, but it's still glued onto Tips 201+202 with no separation).

### Tip 203 — Cheesecake Flavoring — Adding to Cheese Mass, Infusing Cream/Milk (Cold Method)
**tips.json entry:** tail of idx 300 ("HOW TO MAKE A PERFECT CHEESECAKE — 2")
**Category:** MERGED WRONG (duplicate finding — recorded once; see Tip 201/202 entries above)

So tips.json idx 300 = master Tips 201 + 202 + 203, three distinct posts fused into a single
entry titled "HOW TO MAKE A PERFECT CHEESECAKE — 2."

### Tip 204 — Perfect Cheesecake Borders — Achieving a Clean Shortbread Crust
**tips.json entry:** "PERFECT BORDERS" (idx 301)
**Category:** Match confirmed correct (content complete and faithful)

### Tip 205 — Cheesecake — Room Temperature Ingredients Myth, Whipping/Cracks Myth
**tips.json entry:** "HOW TO MAKE A PERFECT CHEESECAKE — 3" (idx 302)
**Category:** Match confirmed correct (content complete and faithful)

### Tip 206 — Water Bath and Cheesecake — Over vs In
**tips.json entry:** "WATER BATH AND CHEESECAKE" (idx 303)
**Category:** Match confirmed correct (content complete and faithful)

### Tip 207 — A Perfect Cheesecake — Shortbread Crust Myths and Practical Tips
**tips.json entry:** "HOW TO MAKE A PERFECT CHEESECAKE — 4" (idx 304)
**Category:** Match confirmed correct (content complete and faithful — final tip in both master and this comparison range)

---

## CONFIRMED CORRECT MATCHES (no detail needed)

Tips 157, 158, 169, 173, 192, 200, 204, 205, 206, 207.

Additionally, the multi-part "About Tastes" series (Tips 159–165) and the "About Food Colorings"
Part 3 (Tip 157) were checked content-word-for-word and are faithfully preserved in tips.json —
however tips.json splits this series into many small entries keyed on inline sub-headers
("Sweet taste", "Salty taste", "TASTE PERCEPTION", "Piquancy", "AROMA", etc. — idx 264–280)
rather than the master's per-post grouping (Tips 159–165). This is a **structural/segmentation
difference, not a content-loss problem** — every sentence from the master text is present
somewhere in tips.json's idx 264–280 range, just chopped much finer than the master's post-level
granularity, and in a few cases (idx 266–269, idx 273–280) a subsequent post's opening lines
bleed into the tail of the prior sub-header's entry (e.ug. idx 269 "Bitter taste" ends with the
"part 3 / the beginning can be found by the hashtag..." intro to Tip 161 tacked on). Since no
content is lost or attributed to the wrong topic, and the master's own doc structure treats this
whole run as one continuous "About Tastes" series, this is flagged here for awareness but not
logged as a per-tip problem for each of the ~17 fragments — the fragmentation pattern itself
mirrors the same "split wrong" issue documented in detail above for Tips 168, 170, and 180.

The Food Colorings series (Tips 155–157, only 157 in this batch's range) shows the identical
fragmentation pattern (idx 256–262: "ABOUT FOOD COLORINGS" / "PART 2" / "Natural" / "Synthetic"
/ "PART 3" / "Water-soluble" / "Fat-soluble") — same non-problem, noted for consistency with the
adjacent batch's likely findings.

---

## tips.json entries with no obvious rebuilt-tip match

None found with certainty within this batch's search range. All tips.json entries examined in
the idx 250–309 range trace back to content in master Tips 154–207 (egg formulas, food
colorings, tastes, gelatin, frosting shelf life, cake coating, cheesecake, cream cheese,
ganache, caramelization/Maillard, pectin/agar/gelatin, sour cream/cream, and the final three
entries: idx 305 "Stabilizing Whipped Cream", idx 306 "How to Make Perfect Chocolate Drips", and
idx 307–309 "FLAVOR PAIRING. STRAWBERRY" / "Flavor Description" / "Aroma Profile" — these last
three/four entries (idx 305–309) do NOT correspond to any tip in this batch's assigned range
(157–207) and were not matched against the master text at all in this pass, since Tip 207 is
confirmed as the master's final tip (explicitly stated: "this is the final tip in the entire
six-batch corpus; the source document ends here"). **This is worth flagging to the
reconciliation step**: tips.json has at least 5 more entries (idx 305–309, "Stabilizing Whipped
Cream", "How to Make Perfect Chocolate Drips", "FLAVOR PAIRING. STRAWBERRY", "Flavor
Description", "Aroma Profile") appearing AFTER the content matching Tip 207, with no
corresponding rebuilt tip anywhere in the 207-tip master list. These may be content that exists
in the original source but was missed by all six rebuild batches, or they may be
hallucinated/unsourced content — this needs verification against the original source document
(`Patarimai_docx_source.txt`), which is outside this batch's scope but should be raised in the
final reconciliation pass.
