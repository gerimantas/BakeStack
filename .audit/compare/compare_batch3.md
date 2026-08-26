# Compare Batch 3 — Master Tips 105–156 vs site/data/tips.json

Audit pass only. No fixes applied. Master source: `.audit/rebuild/MASTER_rebuilt_tips.md`, Tips 105–156.
tips.json has no per-tip IDs; entries referenced below by 0-based array index and title.

## PROBLEMS FOUND

### 1. Tip 106 — "Why Do You Need to Sift the Flour?" — SPLIT WRONGLY
Master keeps the "💡 Lifehack from Marusya" paragraph as the closing part of the same post as the sifting-reasons list. tips.json splits it into its own standalone title-entry, disconnected from its parent post.
- tips.json main body: index 169, title "WHY DO YOU NEED TO SIFT THE FLOUR?" — ends at the 4-bullet "cups instead of grams" reason.
- tips.json orphaned tail: index 170, title "Lifehack from Marusya" — text: *"If the flour you are using is fairly fresh and does not contain any lumps, in most cases you can skip sifting..."*
- Master: single unified post ending with this same lifehack line.
Not lost content, but wrongly presented as an unrelated, title-worthy standalone tip.

### 2. Tip 119 — "Infusion — Hot Method and Its Secrets" — SPLIT WRONGLY (opening sentence orphaned)
Master body opens with: *"Continuing to delve into the topic of infusion, today we take into account the hot method, that I use quite often when developing recipes."* This sentence is misfiled into the END of a different, unrelated tips.json entry.
- Orphaned location: index 196, title "FUNCTIONS OF SALT IN BAKING AND MAKING DESSERTS" — its text ends with a stray "part 3" heading followed by the above sentence, even though that entire entry is otherwise about salt (Tip 117/118 content).
- Tip 119's actual body (hot method description + secrets) appears separately as index 197 "HOT METHOD" and index 198 "HOT METHOD SECRETS", but starts abruptly with "Many of you, probably, have guessed..." — missing its own transition sentence.

### 3. Tip 120 — "Why Add Salt to Desserts — Functions 5-8" — MERGED WRONGLY (no title entry at all)
Tip 120 has **no standalone title entry** in tips.json. Its entire content (functions 5 through 8: balances sweetness, releases juices, shelf life, sodium intake) is silently appended, with no heading, to the end of index 198 ("HOT METHOD SECRETS" — which is Tip 119's content).
- Master Tip 120 starts: *"5. Balances sweetness / Salt helps to balance the taste of products with a pronounced sweetness..."*
- tips.json index 198 tail: same text appears directly after "Did you learn something new for yourself today?" (Tip 119's closing line) with zero separation — reads as if the hot-infusion post randomly continues into salt functions 5-8.

### 4. Tip 129 — "Infusion: The Ins and Outs" — CONTENT MISMATCH (dropped list item: "cream")
Master's "In ganaches:" bullet list has 3 items: cream, fruit puree, water.
tips.json index 216 "WHAT CAN ONE INFUSE?" only has 2 items — **"cream" is missing**:
> tips.json: "In ganaches: - fruit puree - water"
> Master: "In ganaches: 🔺 cream 🔺 fruit puree 🔺 water"

### 5. Tip 130 — "Infusion — Popular Flavorings and the Cold Method" — CONTENT MISMATCH (dropped list item: "Cold")
Master's infusion-methods enumeration lists 4 methods: Cold, Hot, Decoction, Vacuum.
tips.json index 217 (title "Vanilla (pod/paste/extract)", itself a mistitled fragment of Tip 130) lists only 3 — **"Cold" is missing** from the enumeration, even though the Cold Method section itself survives intact two entries later (index 218 "COLD METHOD"):
> tips.json: "Now let's proceed to the most interesting part - infusion methods. They are: - Hot - Decoction - Vacuum"
> Master: "🔺 Cold 🔺 Hot 🔺 Decoction 🔺 Vacuum"

Also note: the entry titled "Vanilla (pod/paste/extract)" is a mis-derived title — that phrase is just the first bullet of Tip 130's flavorings list, not a real heading; the list item text is consumed as the title and doesn't appear in the body.

### 6. Tip 131 ("Flavor Pairing: Apricot") + Tip 132 ("Pectin NH Nappage — Q&A") — MERGED WRONGLY
Two completely unrelated master tips (a fruit flavor-pairing post and a pectin-thickener Q&A) are merged into a single tips.json entry with no separation.
- index 219, titled "FLAVOR PAIRING. APRICOT", contains the full Tip 131 body **and then continues directly into Tip 132's Q&A content** ("Pectin NH Nappage / There are plenty of articles about pectins...") with no heading, title, or paragraph break between them — just runs from "dairy products - goat cheese, cottage cheese, Greek yogurt" straight into "Pectin NH Nappage".
- Tip 132 has **no title entry of its own**; its continuation spills into index 220, misleadingly titled "Spanish Sosa" (itself just a stray bullet fragment: master reads "✅ Spanish Sosa / ✅ French Louis Francois" as two brand-name bullets under "Which brands... do I prefer?" — tips.json turns the first bullet into a title and drops it from the body text, so index 220's body starts with only "- French Louis Francois").

### 7. Tips 135, 136, 137 — MERGED WRONGLY / NO TITLE ENTRIES (major structural bug)
Four consecutive, distinct master tips (134 "Why It Can Curdle," 135 "Correct Temperature Measurement," 136 "Complete Cooking Instructions," 137 "5 Problems and Solutions") collapse into a cascading merge:
- index 221 "CRÈME ANGLAISE FROM A TO Z" = Tip 133 (complete) **+ Tip 134's opening sentence** ("part 2 / I received an interesting question: How can one cook crème anglaise to 82°C...") tacked onto the end with no title of its own.
- index 222 "Yolk" = Tip 134's composition/lecithin section only.
- index 223 "Why Does Crème Anglaise Curdle? Reasons and Fixes" = Tip 134's remaining "Sugar" section, **then Tip 135 in full** (temperature measurement / induction stove / probe thermometer, "part 3"), **then Tip 136 in full** ("Part 4" — complete step-by-step cooking instructions), **then Tip 137 in full** ("5 Problems When Making Crème Anglaise..." — all 5 problems/solutions) — all four sub-topics run together in one entry with zero heading breaks between them.
- **Tips 135, 136, and 137 have no title entries anywhere in tips.json.** All of their content is present somewhere (nothing appears deleted on inspection), but it is undiscoverable as distinct tips — a user or any list/search feature keyed on titles would never surface "Complete Cooking Instructions" or "5 Problems" as their own items.
- Quote from tips.json index 223 showing two master tips running together with no break: *"...Then cover the crème anglaise with cling film touching the surface."* [end of Tip 137, and end of entry 223] — compare to how it silently began: *"...Solution: If you have an induction stove, use a glass deep fry/candy thermometer / Part 4 / Complete cooking instructions / 1️⃣ Whisk the egg yolks..."* — Tip 135 to Tip 136 transition with no title, just a bare "Part 4" line.

### 8. Tips 147, 148 — MERGED WRONGLY / NO TITLE ENTRIES
Same pattern as #7. Master Tip 146 ("Pectin FX, Acid-Free, Slow Set") ends, then Tip 147 ("Methods of Adding Pectin to a Mixture") and Tip 148 ("How Much Pectin to Use") both run into the same tips.json entry with no titles of their own.
- index 245, titled "Slow set pectin — 2" (that title actually belongs to Tip 146's content), contains: end of Tip 146 → "part 6" (Tip 147's full 3-methods content: pre-dissolve in water, pre-dissolve in syrup, mix with sugar) → "part 7" (Tip 148's full content: the 60:1:1 ratio, sucrose vs. fructose density, etc.) — all concatenated with only bare "part 6"/"part 7" text markers, no real headings.
- Verified no other entry anywhere in tips.json contains phrases unique to Tip 147 ("Pre-dissolve pectin in boiling water") or Tip 148 ("Scientists consider the ratio 60") — confirming this content exists ONLY inside the misleadingly-titled "Slow set pectin — 2" entry.

### 9. Tip 153 — "Things We Need to Know About Eggs, Part 5 (Egg Disinfection)" — MINOR CONTENT MISMATCH (unwanted noise line retained)
Master's rebuild note explicitly says the line "Russian version @ma_rusya_manko" (a cross-promotion/attribution line for a Russian-language duplicate account) was deliberately omitted from the master body as non-baking noise. tips.json did NOT strip this line — it survives in the site data:
> tips.json index 252: *"The beginning can be found by hashtag #marusya_likbez / Russian @ma_rusya_manko / Today we will talk about the disinfection of eggs..."*
This is a genuine discrepancy versus the clean master text (tips.json is "worse" here, not corrupted, but the master's intended clean version doesn't match what's live).

### 10. Tip 155 — "About Food Colorings, Part 1" — CONTENT MISMATCH: FLAGGED WAR/CHARITY CONTENT LEAKED INTO SITE DATA
This is the specific item flagged for special attention. Master deliberately EXCLUDED an opening passage referencing the Bucha massacre (Ukraine war) and a charity-sale fundraising note, on the grounds that it is off-topic, non-baking, real-world sensitive content that must not appear in site-facing tip text. Confirmed: **this passage IS present, verbatim, in tips.json.**
- tips.json index 256, title "ABOUT FOOD COLORINGS", text begins:
> *"part 1 / Bucha / The whole world saw it and was horrified ... / I made a conscious decision not to share photo and video materials that can easily lead to severe mental trauma. / There's already more than enough sensitive content in all the news feeds… / Unfortunately, the dead can no longer be helped. We are doing everything in our power to help the living — we continue to work, no matter how unbearably difficult it is now. / The report on the funds raised for charity, as previously, will be posted in the stories. We express our deepest gratitude to everyone who took part in the sale. / Do you use food colorings?..."*
- Master body (correctly) starts directly at "Do you use food colorings?" with no preceding war/charity content.
This confirms the off-topic passage was NOT filtered out by the original parsing pipeline and currently ships live in `site/data/tips.json`. Requires human decision per the master's flag — noted here as instructed, not fixed.

## NOTES ON NON-BUGS (verified, not flagged as problems)

- **Tips 113/114/115 (salt varieties sub-series)** and **Tips 122–125 (agar series)**: content is split across many small per-heading tips.json entries (e.g., "TABLE SALT", "ROCK SALT", "SEA SALT" / "Quality", "Gel strength", "Agar", "Gelatin", "Pectin", "Corn Starch"), but all master text is verifiably present somewhere in the corresponding entries — this is tips.json's normal one-entry-per-heading granularity, not content loss or wrongful merging. Treated as correct.
- **Tips 110 & 112 (8 Types of Butter, Parts 2 and 1 respectively)**: both preserved as separate entries (index 174 = Tip 110, index 182 = Tip 112, titled "— 2" only because it's the second occurrence of the identical title string) with all 8 sub-butter-types intact as their own entries. Matches master's own note about this being a source ordering quirk, not a parsing bug.
- **Tip 113's Ukraine-fundraiser opening paragraph**: master explicitly keeps this text as part of Tip 113's real body (unlike Tip 155's excluded passage). Confirmed present in tips.json index 187 exactly as in master — correct, not a discrepancy.

## CONFIRMED CORRECT MATCHES (content verified faithful, no further detail needed)

Tips 105, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118 (bridging fragment, faithfully reproduced albeit awkwardly", see #2/#3 above for what leaks in beside it), 121, 122, 123, 124, 125, 126, 127, 128, 133 (content faithful; see #7 for the trailing sentence issue), 138, 139, 140, 141, 142, 143, 144, 145, 146, 149, 150, 151, 152, 153 (content faithful aside from #9), 154, 156.
