# Compare Batch 1 — Master Tips 001–052 vs. site/data/tips.json

Comparison of MASTER_rebuilt_tips.md (Tip 001–052) against the current site/data/tips.json
(310 entries, indices 0–309). Entries in this range of tips.json occupy roughly index 0–105.

## Overall structural finding

tips.json splits each master tip's sub-sections into many separate JSON entries (by heading),
which is expected/acceptable on its own. The real bug is that **the split points are wrong**:
tips.json entries routinely end mid-tip and the *next* master tip's opening content is appended
to the *previous* entry's `text` field, under the *previous* entry's title. This means most
"boundary" entries in tips.json are silently glued to unrelated adjacent tips. This is the same
family of bug as the confirmed "Cold Infusion" transition-paragraph bug, and it recurs
throughout this whole batch, not just at one seam.

---

## Problems found

### Tip 001 — Flavor Infusion (Parts 1–3)
Maps to tips.json indices 0 ("FLAVOR INFUSION: WHAT, WITH WHAT, AND HOW"), 1 ("COLD INFUSION"),
2 ("THE HOT METHOD"), 3 ("SECRETS OF THE HOT METHOD").

**Content mismatch (dropped list item):** In the "In ganaches" list, the master has three
liquid bases; tips.json index 0 drops the first one ("cream").
- Master: "In ganaches: 🔺 cream / 🔺 fruit purée / 🔺 water"
- tips.json (index 0): "In ganaches:\n\n- fruit purée\n- water" — **"cream" is missing entirely.**

**Split wrongly (transition paragraph misplaced):** The "Cold infusion" content is split from its
"hot infusion" transition. Index 1 ("COLD INFUSION") ends with a paragraph that actually belongs
to the next section: "Continuing to explore the topic of flavor infusion, today we'll look at the
hot method..." — that sentence is the intro to the HOT METHOD section (index 2 in tips.json /
part of master Tip 001), but it is trapped inside the "COLD INFUSION" entry, mislabeled as
"Part 3" inside index 1's text, while index 2 ("THE HOT METHOD") starts directly with "Many of
you have probably already guessed..." This is the same misplaced-transition-paragraph bug family
already confirmed for Cold Infusion elsewhere.

### Tip 002 — Factors That Affect Starch Functionality
**Merged wrongly:** tips.json index 4 (titled "FACTORS THAT AFFECT STARCH FUNCTIONALITY", i.e.
Tip 002) has ALL of Tip 002's content, but its `text` field also has the entirety of Tip 003
("STARCH. How does it work?") appended at the end with no title/heading break — Tip 003 has no
separate entry of its own.
- tips.json index 4 tail: "...gelatinization occurs so rapidly that the starch mixture may
  appear not to thicken at all.\nSTARCH. How does it work?\n\nThe process depends on the
  temperature setting..." (this second half is verbatim Tip 003 content, glued on).

### Tip 003 — Starch: How Does It Work?
**Missing as own entry / merged into Tip 002's entry.** No tips.json entry has "STARCH. How does
it work?" as its title; the content exists only appended inside index 4 (see above). Effectively
tips.json has fewer entries here than the master intends, with Tip 003 having no title of its own
in the data.

### Tip 004 — All About Starch: Types and Uses
**Merged wrongly:** Similarly, tips.json index 5 (titled "ALL ABOUT STARCH: TYPES AND USES", i.e.
Tip 004) has Tip 004's content correct, but Tip 005 ("THICKENING and GEL FORMATION...") is glued
onto the end of the same entry with no separate title.
- tips.json index 5 tail: "...preserved when thickened with instant starch.\nTHICKENING and GEL
  FORMATION. What's the difference?\n\nWe all use starch and gelatin..." (Tip 005 content glued on).

### Tip 005 — Thickening and Gel Formation: What's the Difference?
**Missing as own entry / merged into Tip 004's entry.** Same pattern as Tip 003 — content exists
but only as an unlabeled tail inside index 5's text, no own title.

### Tip 006 — Shelf Life of Frostings
**Merged wrongly:** tips.json index 6 (titled "Preparing frostings") contains all of Tip 006's
content, but the tail is glued directly into the start of Tip 007 ("Mascarpone vs. Cream Cheese"):
- tips.json index 6 tail: "...to several months at room temp (~23–50°C/~73–122°F).\nMascarpone vs.
  Cream Cheese: Key Differences\n\nDespite their similarities..." — Tip 007's opening two
  paragraphs and the "Mascarpone" sub-heading are trapped inside the Tip 006 entry.

### Tip 007 — Mascarpone vs. Cream Cheese: Key Differences
**Split wrongly:** Tip 007's opening (intro + "Mascarpone" heading) is stuck at the tail of the
Tip 006 entry (index 6, see above), while the rest of Tip 007's content (all the mascarpone bullet
details onward) is in a separate entry titled "Origin: traditional Italian cheese" (index 7) that
starts mid-list with "- Fat content: 70–75%..." — i.e. the "Mascarpone" sub-heading and its very
first bullet ("🔸Origin: traditional Italian cheese") became the *title* of the next entry instead
of staying in the body, and the intro paragraph is orphaned in the wrong entry. Content is present
in total but split across two wrongly-divided/mistitled entries.

### Tip 008 — Why Baking Soda ≠ Baking Powder?
**Match, content-complete but heavily fragmented across entries** — indices 8 ("Baking soda"), 9
("Baking powder"), 10 ("Ammonium (ammonium carbonate)"), 11 ("Substitution"). The intro question
("Why baking soda ≠ baking powder? And how to know...") is retained (inside index 8). Content
matches; fragmentation into 4 entries is a structural difference but not a content-loss bug here
— counting as correct match at content level.

### Tip 009 — Why Does Crème Anglaise Turn Out Silky vs. Curdled?
Maps to tips.json index 12, title "Why Does Crème Anglaise Curdle? (Cooking Method)".
**Title mismatch:** tips.json's title diverges from the master's title/emphasis (master:
"Why does crème anglaise turn out silky vs. curdled?"; tips.json collapses this to "Why Does
Crème Anglaise Curdle? (Cooking Method)", dropping the "silky vs." framing). Body content matches
faithfully otherwise.

### Tip 010 — Butter: The Ideal (But Tricky) Fat
Maps to tips.json index 13, title "Butter: Advantages, Drawbacks, and Creaming Temperature".
**Title mismatch:** tips.json's title is a rewritten paraphrase, not derived from the source
heading (source has no such heading at all — it's freeform prose). Body content matches
faithfully.

### Tip 011 — Sugar: Caramelization and the Maillard Reaction
Maps to tips.json index 14. Title and content match faithfully. **Confirmed correct.**

### Tip 012 — Sugar: How It Works in Batter
Maps to tips.json indices 15 ("SUGAR: HOW IT WORKS IN BATTER"), 16 ("CREATING TENDER TEXTURES"),
17 ("RETAINING MOISTURE AND EXTENDING SHELF LIFE").
**Merged wrongly (major):** Index 17 ends with Tip 012's legitimate content ("...often used in
recipes where lasting freshness is important.") but then, with no title break, the ENTIRE Tip 013
(Caramel) is appended, followed immediately by the opening two lines of Tip 014 (Meringue
Stability intro) — all three tips' content packed into one entry under the title "RETAINING
MOISTURE AND EXTENDING SHELF LIFE".
- tips.json index 17 tail: "...often used in recipes where lasting freshness is important.\nHot
  Cream & Cool Nerves: Everything You Need To Know About Caramel\n\nCaramel can be
  temperamental...[all of Tip 013]...Nothing supernatural here—just a clear understanding of how
  caramel behaves at each stage.\n\nFactors affecting meringue stability: TEMPERATURE, DENSITY OF
  EGG WHITES, WHIPPING TIME\n\nLets put the final touches on our topic of Meringue"

### Tip 013 — Hot Cream & Cool Nerves: Everything About Caramel
**Missing as own entry.** No tips.json entry is titled for Tip 013; its full content exists only
as an untitled tail glued inside index 17 (see Tip 012 above). This is a genuine "missing" tip at
the entry level even though the text survives buried in the wrong entry.

### Tip 014 — Factors Affecting Meringue Stability: Temperature, Density, Whipping Time
Maps to tips.json indices 18 ("Temperature"), 19 ("Whipping time"), 20 ("Other factors").
**Split wrongly (intro orphaned):** The section intro/heading ("Factors affecting meringue
stability: TEMPERATURE, DENSITY OF EGG WHITES, WHIPPING TIME / Lets put the final touches on our
topic of Meringue") is not attached to index 18 at all — it is instead trapped at the very tail of
index 17 (see Tip 012/013 above), disconnected from its own section's content, which begins cold
at index 18 with "Egg whites straight from the fridge don't whip well." Otherwise the three
sub-sections (Temperature, Whipping time, Other factors/salt & whisk) are present and match.

### Tip 015 — Top 7 Tips for Baking Sponge Cakes
Maps to tips.json index 21 ("TOP 7 TIPS FOR BAKING SPONGE CAKES").
**Merged wrongly (tail):** Content of all 7 tips matches, but the entry's tail has the heading of
the NEXT tip (Tip 016) glued on with no break: "...Wrapping warm sponges traps too much moisture,
making the layers sticky later on.\nFactors Affecting Meringue Stability:" — this orphaned heading
belongs to Tip 016, not Tip 015.

### Tip 016 — Factors Affecting Meringue Stability: Fats & Acids
Maps to tips.json indices 22 ("LIPIDS"), 23 ("PRO TIP"), 24 ("ACID").
**Split wrongly (heading orphaned):** As noted above, the tip's own section heading ("Factors
Affecting Meringue Stability: FATS & ACIDS") is stranded at the tail of index 21 (Tip 015's
entry) rather than leading into index 22. Body content of LIPIDS/PRO TIP/ACID sections is present
and matches.

### Tip 017 — Factors Affecting Meringue Stability: Sugar
Maps to tips.json indices 25 ("Factors Affecting Meringue Stability: SUGAR"), 26 ("USEFUL TIPS").
**Merged wrongly (tail):** Content matches through the "Sugar syrup also adds a satiny shine..."
line and through the two USEFUL TIPS bullets, but then, with no break, the entirety of Tip 019
("10 Critical Mistakes...") is appended to index 26's text, followed immediately by the entirety
of Tip 018 ("How Liquid Egg Whites Turn Into Foam...") — three tips glued into one entry.
- tips.json index 26 tail: "...allowing it to fully dissolve between additions\n\n- Since sugar
  slows down whipping...beer foam stage\n10 Critical Mistakes a Beginner Pastry Chef Might
  Make\n\n- Pouring sugar over the eggs...[all 9 items]...Have you ever wondered how liquid egg
  whites turn into foam during whipping?\n\n[all of Tip 018]"

### Tip 018 — How Liquid Egg Whites Turn Into Foam During Whipping
**Missing as own entry.** Full content is present but only as an untitled tail buried inside
index 26 (see Tip 017 above) — no tips.json entry carries this as its own title/entry.

### Tip 019 — 10 Critical Mistakes a Beginner Pastry Chef Might Make
**Missing as own entry.** Same as above — content (all 9 bullet items, matching master's
9-vs-title-says-10 anomaly faithfully preserved) exists only as an untitled middle chunk inside
index 26 (see Tip 017 above), sandwiched between Tip 017's tail and Tip 018's content.

### Tip 020 — Poor Cake Texture? Creaming the Butter: Simple Rules
Maps to tips.json index 27, title "CREAMING THE BUTTER: SIMPLE RULES".
**Title mismatch (minor):** tips.json drops the "Poor Cake Texture?" hook from the title, keeping
only "CREAMING THE BUTTER: SIMPLE RULES". Body content matches faithfully. Confirmed correct at
content level; noting title truncation only.

### Tip 021 — A Whisk, a Paddle, or a Dough Hook? (Parts 1–3, incl. Creaming Method)
Maps to tips.json indices 28 ("A WHISK, A PADDLE, OR A DOUGH HOOK?"), 29 ("WHISK").
**Content mismatch (truncated, anomaly correctly preserved):** Master flags this tip as ending
mid-thought ("...becomes a game changer…") with a likely missing continuation. tips.json index 29
faithfully reproduces this same truncation — text ends identically at "...becomes a game
changer…" with nothing following. This matches the master's known anomaly, not a new bug.
**However**, tips.json's index 29 ("WHISK") text glues together THREE of the master's labeled
parts (Part 1 intro is in index 28, then Part 2 and Part 3 both dumped into index 29 with only
inline "Part 2" / "Part 3" markers, no separate titled entries) — the PADDLE section discussion
and creaming-method explanation that logically deserves its own heading is merged under the
"WHISK" title. This is a merge/mistitle issue: content headed "PADDLE" mid-text is not its own
entry and sits under a "WHISK"-titled entry.

### Tip 022 — How to Work with Shortcrust Pastry Effectively (Parts 1–2)
Maps to tips.json index 30. Content and title match faithfully across both parts (Part 1 and
Part 2 correctly concatenated in sequence with a "Part 2" marker, matching master's own two-part
structure). **Confirmed correct.**

### Tip 023 — How to Make Cut Cake Slice Look Unforgettable
Maps to tips.json indices 31–35 (intro + four sub-tips). Content and titles match faithfully.
**Confirmed correct** (fragmentation into sub-entries is faithful to the numbered-list structure).

### Tip 024 — Guidelines for Storing, Sweetening, and Mixing Heavy Whipped Cream
Maps to tips.json indices 36 ("SWEETENING"), 37 ("WHIPPING AND MIXING"), 38 ("STORAGE").
**Split wrongly (intro orphaned):** The tip's own intro ("Guidelines for Storing, Sweetening, and
Mixing Heavy Whipped Cream / Continuing our discussion...") is stranded at the tail of index 35
(Tip 023's last sub-entry, "4. CONTRASTING FILLINGS"), not attached to index 36 where the actual
Sweetening content begins cold with "The classic method for sweetening...". Sub-section content
(Sweetening/Whipping and Mixing/Storage) itself matches.

### Tip 025 — Top Tips for Whipping Cream
**Merged wrongly / missing as own entry.** No tips.json entry is titled for Tip 025. Its full
content (including the master's own flagged numbering anomaly — "2." followed directly by "4."
with no "3.") is glued onto the tail of index 38 ("STORAGE", Tip 024's last sub-entry), with no
title break: "...store it in the refrigerator.\nTop Tips for Whipping Cream\n\n- Heavy whipped
cream is not only one of the most popular frostings..." The numbering gap anomaly ("2. Keep It
Cool" directly followed by "4. Right Tools, Right Speed", no "3.") is faithfully preserved from
the master, confirming this is the same source content, just wrongly merged into Tip 024's entry.

### Tip 026 — Tempering Gelatin: A Step-by-Step Guide
**Missing as own entry.** No tips.json entry is titled for this tip. Its full content is glued,
untitled, into the same index-38 blob described under Tip 025 above, immediately following Tip
025's content with only a paragraph break: "...Correctly whipped cream will ensure stable volume
and the ideal final texture in your mousse.\nTempering Gelatin: A Step-by-Step Guide\n\nYou asked
for it, and here it is..."

### Tip 027 — Common Mistakes When Working with Mousses
**Content mismatch (dropped list item) + missing as own entry.** Also buried untitled inside the
index-38 blob (after Tip 026's content), with NO title break: "...cocoa butter was at the proper
temperature and did not crystallize during mixing.\nCommon Mistakes When Working with
Mousses\n\nMousses generally consist of three key components:\n\n- Aerator..." — note the first
listed component is **missing**: master lists "✔️ Base (such as crème anglaise...)" as the FIRST
of three components, but tips.json's version jumps straight to "- Aerator (such as egg foam or
whipped cream)" — the "Base" bullet is dropped entirely, even though the intro text still says
"three key components" while only two are listed.

### Tip 028 — Sponge Cake Defects and How to Avoid Them
Maps to tips.json indices 39 ("1. SPONGE CAKES COLLAPSE..."), 40 ("2. CAKE TOP CRACKS..."), 41
("3. UNEVEN FORM:"). **Split wrongly (intro orphaned):** The intro ("Sponge Cake Defects and How
to Avoid Them / Thank you for your comments...") is stranded at the tail of the index-38 blob
(after Tip 027's content, see above), not attached to index 39. The three defect sub-sections
themselves match content faithfully.

### Tip 029 — Avoid Doing This When Working with Frosting
Maps to tips.json index 42 ("AVOID DOING THIS WHEN WORKING WITH FROSTING") plus indices 43–46
(the four specific mistakes). Title and content match faithfully across all five entries.
**Confirmed correct.**

### Tip 030 — The Four Ingredient Function Categories in Cake Recipes
Maps to tips.json index 46's tail (untitled) plus indices 47 ("Moisturizers"), 48 ("Dryers").
**Split wrongly (intro + first two categories orphaned):** The tip's intro and its first two
ingredient categories ("Tougheners or Stabilizers" and "Softeners or Tenderizers") are appended,
untitled, to the tail of index 46 ("SEPARATED BUTTERCREAM", the last sub-entry of Tip 029):
"...improper proportions of fat and water needed to achieve a perfect emulsion.\nDid you know that
the ingredients in every cake recipe can be categorized into four main groups...\n- Tougheners or
Stabilizers:\n...\n- Softeners or Tenderizers:\n..." Only the last two categories (Moisturizers,
Dryers) get their own titled entries (47, 48). Content itself is present and matches; the
structural split point is wrong.

### Tip 031 — Flour Theory: Protein, Starch, and Damaged Starch Granules
**Missing as own entry.** No tips.json entry is titled for this tip. Its full content is appended
untitled to the tail of index 48 ("Dryers", Tip 030's last sub-entry): "...requires a
corresponding increase in softeners.\nHave been delving into the theory of flour for a
while.\n\nI have known about the power and importance of gluten (protein)..." Content matches the
master verbatim, just missing its own entry/title.

### Tip 032 — How to Cover a Cake with Crumbs Neatly
Maps to tips.json index 49. Title and content match faithfully. **Confirmed correct.**

### Tip 033 — 2 Secret Ingredients for the Perfect Carrot Sponge
Maps to tips.json indices 50 ("2 SECRET INGREDIENTS..."), 51 ("THE FIRST SECRET INGREDIENT"), 52
("AND THE SECOND SECRET INGREDIENT"). Title and content match faithfully across all three.
**Confirmed correct.**

### Tip 034 — 4 Primary Ways in Which Fat Contributes to Leavening
Maps to tips.json index 53. Title and content match faithfully. **Confirmed correct.**

### Tip 035 — Flavor Combinations Featuring Citrus Fruits
Maps to tips.json index 54. Title and content match faithfully (all five citrus pairings
present). **Confirmed correct.**

### Tip 036 — How to Make Puff Pastry for Pies Tender
Maps to tips.json index 55. Title and content match faithfully. **Confirmed correct.**

### Tip 037 — Determining the Doneness of Honey Cake Layers
Maps to tips.json indices 56 ("DETERMINING THE DONENESS..."), 57 ("CAKES FROM STIFF OR SOFT HONEY
DOUGH"), 58 ("CAKES FROM LIQUID HONEY DOUGH...").
**Content mismatch (structure/labels lost, causing ambiguity):** The master clearly labels each
bullet under each honey-dough type with "🔸 Properly baked / 🔸 Underbaked / 🔸 Overbaked"
sub-headers before each description. tips.json indices 57 and 58 strip ALL of these sub-headers
(not just the emoji, the entire label text), leaving four/three unlabeled paragraphs in a row with
no indication which paragraph describes "properly baked" vs. "underbaked" vs. "overbaked" — e.g.
index 57 reads "have a consistent golden or caramel color\n\n[...]\n\nappear flat, resembling
pancakes...\n\nresult in excessive dryness..." with no way to tell these apart without the
original labels. This is a genuine loss of meaning, not cosmetic — a reader cannot tell which
honey-dough symptom corresponds to which baking outcome.

### Tip 038 — The Physics of Flaky Puff Pastry Formation During Baking
Maps to tips.json index 59. Title and content match faithfully. **Confirmed correct.**

### Tip 039 — Flavor Pairing: Coconut
Maps to tips.json index 60. Content matches faithfully (all pairing categories and both featured
combinations present). **Confirmed correct** (title rendered as "FLAVOR PAIRING. COCONUT" matches
master's own title).

### Tip 040 — Blue Spots Between Honey Cake Layers and Filling
Maps to tips.json index 61. Title and content match faithfully. **Confirmed correct.**

### Tip 041 — A Formula for Simple Yet Stylish Cake Decoration
Maps to tips.json index 62. Content matches faithfully, including the "Sart"→ preserved typo
("3. Sart the formation of the wreath...") — note the master's own merged version silently
corrected this typo to "Start", but tips.json still has the original "Sart" typo. This is not a
bug in tips.json (it's just unedited raw source text) but worth flagging since it means tips.json
here is actually closer to raw source than master's cleaned-up version. **Confirmed correct**
(no discrepancy against the underlying source, just noting the divergence from master's polish).

### Tip 042 — Functions of Fats in Baking, Part 1: Impact on Softness and Tenderness
Maps to tips.json index 63 ("FUNCTIONS OF FATS IN BAKING"). Content matches faithfully through
Part 1, and the entry correctly continues into "part 2" transition text at the tail (which
belongs to Tip 043). **Confirmed correct** for Tip 042's own content.

### Tip 043 — Functions of Fats in Baking, Part 2: Providing Flakiness (Puff Pastry Varieties)
Maps to tips.json indices 64 ("PROVIDING FLAKINESS"), 65 ("VARIETIES OF PUFF PASTRY BY PREPARATION
METHOD"). **Split wrongly (intro orphaned):** Tip 043's actual lead-in text ("Exploring the
intricacies of baking is a must...Let's begin examining the second function of fats in baking.")
is stranded at the tail of index 63 (Tip 042's entry) rather than at the head of index 64. Content
of "PROVIDING FLAKINESS" and "VARIETIES..." themselves match faithfully.

### Tip 044 — Functions of Fats in Baking, Part 3: The Main Rule for Achieving Perfect Puff Pastry
**Missing as own entry.** No tips.json entry is titled for Tip 044. Its content ("part 3 / The
main rule for achieving perfect puff pastry is as follows...") is appended untitled to the tail of
index 65 ("VARIETIES OF PUFF PASTRY BY PREPARATION METHOD", Tip 043's second sub-entry), with no
title break. Content itself matches the master verbatim.

### Tip 045 — Multi-Layer Cheesecakes: 3 Rules You Should Know
Maps to tips.json index 66. Title and content match faithfully. **Confirmed correct.**

### Tip 046 — How and Why to Drain Sour Cream
Maps to tips.json index 67. Title and content match faithfully (including the "President" brand
punchline). **Confirmed correct.**

### Tip 047 — All About Cake Fillings: Coulis, Confit, Compote
Maps to tips.json indices 68 ("ALL ABOUT CAKE FILLINGS"), 69 ("COULIS"), 70 ("CONFIT"), 71
("COMPOTE"). Title and content match faithfully across all four. **Confirmed correct.**

### Tip 048 — Cake Fillings, Part 3: Caramel — Dry, Fruit, Creamy and Salty
Maps to tips.json index 72 ("CARAMEL: DRY, FRUIT, CREAMY AND SALTY").
**Merged wrongly (tail):** Content of Tip 048 itself matches faithfully through "...I almost
forgot to mention that this post also goes by another name:", but then, with only a "part 4"
marker (no title break), the ENTIRE opening of Tip 049 (Curd) is appended to the same entry:
"part 4\n\nCoulis, compote, caramel, confit... What other fillings can we explore for cakes?
Naturally, curd comes to mind." This intro line belongs to Tip 049, not Tip 048's entry.

### Tip 049 — Cake Fillings, Part 4: Curd
Maps to tips.json indices 73 ("DEFINITION"), 74 ("MAIN INGREDIENTS"), 75 ("COOKING PROCESS"), 76
("CURD VS CUSTARD"), 77 ("HOW TO MAKE YOUR CURD SPECIAL"), 78 ("IMPORTANT POINTS REGARDING
CURDS"). **Split wrongly (intro orphaned):** As noted above, Tip 049's own opening line is
stranded in Tip 048's entry (index 72) instead of leading its own first sub-entry. All the
labeled sub-sections (Definition, Main Ingredients, Cooking Process, Curd vs Custard, How to Make
Special, Important Points) are present and match content faithfully.

### Tip 050 — Cake Fillings, Part 5: Crémeux
**Missing as own entry / merged wrongly.** No tips.json entry is titled for Tip 050. Its content
is appended untitled to the tail of index 78 ("IMPORTANT POINTS REGARDING CURDS", Tip 049's last
sub-entry): "...opt for farm-fresh egg yolks\npart 5\nIt's been a while since we delved into the
world of cake fillings...[all of Tip 050 about Crémeux]...infusing the cream / milk with lavender
or lemongrass..." followed immediately, still with no title break, by the opening of Tip 051
("part 6 / #marusya_about_fillings / Coulis, confit, compote, caramel, curd, crémeux..."). Three
distinct tips' content (049 tail already covered, 050 whole, and 051's intro) all sit inside one
tips.json entry titled "IMPORTANT POINTS REGARDING CURDS", which is misleading — that title has
nothing to do with crémeux.

### Tip 051 — Cake Fillings, Part 6: Ganache and Mousse
Maps to tips.json indices 79 ("GANACHE"), 80 ("MOUSSE"). **Split wrongly (intro orphaned):** Tip
051's own intro ("part 6 / Coulis, confit, compote, caramel, curd, crémeux – what other options
exist...") is stranded inside index 78 (see Tip 050 above) instead of leading into index 79.
Content of the GANACHE and MOUSSE sections themselves matches faithfully.

### Tip 052 — Forming the Perfect Cheesecake Crust: Bottom & Shape (Using a Bent Spoon)
Maps to tips.json index 81, title "FORMING THE PERFECT CHEESECAKE CRUST: STEP-BY-STEP GUIDE".
**Merged wrongly:** Tip 052's own content (bottom-shaping with bent spoon, including both "insider
tip" bullets about crust thickness and the 57%/43% crumb ratio) matches faithfully through
"...while 43% are used for the bottom (I use 240 g and 180 g)." But then, with NO title or
paragraph-break signal beyond a single newline, the ENTIRE Tip 053 ("What's a perfect cheesecake
for you?" reader-engagement post) is appended to the same entry:
- tips.json index 81 tail: "...(I use 240 g and 180 g)\nWhat's a perfect cheesecake for you? What
  attracts you the most in this dessert?\n\nA creamy cheesecake mass or a crunchy base?..."
  (all of Tip 053 follows, unbroken, inside an entry titled as a crust-forming guide).

This is exactly the kind of multi-part-series merge error the assignment flagged as a known risk
pattern — Tip 052 is itself flagged in the master as being out of sequence relative to Tip 055
(the "sides" tip), and here it also absorbs an entirely unrelated tip (053) into its JSON entry.

---

## Confirmed correct matches (content faithful, no action needed)

Tip 008, Tip 011, Tip 022, Tip 023, Tip 029, Tip 032, Tip 033, Tip 034, Tip 035, Tip 036, Tip 038,
Tip 039, Tip 040, Tip 041, Tip 042 (own content only), Tip 045, Tip 046, Tip 047.

(Tips 009, 010, 020 are content-correct but flagged separately above for minor title-wording
divergence from the master title.)

---

## Summary of problem categories in this batch

- **Missing as own entry (content exists only buried/untitled inside a wrong neighboring
  entry):** Tips 003, 005, 013, 018, 019, 025, 026, 027 (partial), 031, 044, 050
- **Merged wrongly (one entry's `text` improperly contains another tip's content):** Tips 001
  (list item dropped, not a merge but noted with it), 002, 004, 006, 012, 015/016 boundary, 017,
  024/025/026/027/028 chain (index 38 blob), 029/030 boundary, 030/031 boundary, 042/043 boundary,
  048, 049/050/051 chain, 052/053 boundary
- **Split wrongly (one tip's content/intro wrongly separated and stranded in the wrong entry):**
  Tips 001 (Cold/Hot transition), 007, 014, 016, 021 (Whisk/Paddle conflation), 024, 028, 030,
  043, 049, 051
- **Content mismatch (real information lost, not just structural):** Tip 001 (dropped "cream"
  bullet in ganaches list), Tip 027 (dropped "Base" component bullet), Tip 037 (all
  Properly-baked/Underbaked/Overbaked labels stripped, creating ambiguity)
- **Title mismatch (minor wording drift, content intact):** Tips 009, 010, 020

## Key takeaway

Nearly every tip in the 001–052 range that belongs to a labeled multi-part series (Parts 1-3,
1-2, 1-6, etc.) or sits at a series boundary has its transition/intro paragraph glued to the
WRONG neighboring entry, and several tips exist in tips.json only as untitled buried content
inside an unrelated entry. This confirms the "Cold Infusion"-style bug is systemic across this
whole batch, not an isolated incident — the parser is consistently splitting tips one paragraph
too early or too late at almost every series boundary.
