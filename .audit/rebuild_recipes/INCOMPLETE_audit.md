# INCOMPLETE_audit — independent read-audit of the 32 `is_complete: false` recipes

**Method:** every recipe's source line range in `Receptai_docx_source.txt` was pulled with `Read`
and read top to bottom by eye — no regex sweep, no count-based heuristic, per the `recipes-audit`
skill's central rule. Each recipe's entry in `recipes_export.json` was then read side by side to
confirm the JSON captured what the source actually has. The MASTER note's standing claim
("the ingredient list below is complete; only some instruction steps are missing") was treated as
a hypothesis to test, not a fact.

**Read-only run.** Nothing was edited. Findings only.

---

## recipe-038 — Almond Tea Cake with Almond Streusel
**Source lines:** 1640-1693
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Almond streusel (4 lines); Tea cake batter (10 lines). Plus the
header-style equipment lead-in at line 1654 ("for this recipe, you'll need two 21x11 cm rectangular
molds, h = 11 cm") — equipment, not an ingredient; export carries it as the first step.
**Instruction sections in source:** METHOD → Streusel (2 steps); Tea cakes (3 steps).
**What is missing:** Both ingredient sections have method headings, so nothing is orphaned at
section level — but the Tea cakes method stops after the batter is mixed (line 1691). There is no
depositing-into-molds step, no streusel-topping step, and no bake temperature/time, even though
line 1654 names the molds and the recipe's whole premise is a streusel-topped baked loaf. The
streusel is made and chilled but never used.
**MASTER note agrees?** yes — it says exactly "missing the instructions for baking the tea cake and
topping it with the streusel."

## recipe-039 — Sour Cherry Confit Cheesecake
**Source lines:** 1694-1741
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Chocolate crust (8); Cream cheese layer (6, incl. the
non-numeric "zest of one lemon"); Sour cherry confit (3).
**Instruction sections in source:** METHOD → Cheesecake crust only (3 steps + 1 chef tip).
**What is missing:** Cream Cheese Layer and Sour Cherry Confit have full ingredient lists and no
method steps at all. Also no assembly/bake/chill step for the cheesecake as a whole. Text ends
mid-recipe at line 1740 ("Add soft butter (2) and milk, and mix thoroughly.") and the next line is
the following recipe's title.
**MASTER note agrees?** yes.

## recipe-040 — Cottage Cheese and Berry Crumble Pie
**Source lines:** 1742-1792
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Shortcrust base (6); Cottage cheese and berry filling (8, incl.
the unquantified "bilberries or blueberries"); Meringue (4).
**Instruction sections in source:** METHOD → Shortcrust base (3 steps); Filling (1 step + tip).
**What is missing:** Meringue has ingredients and no method. No assembly step (lining the mold with
the chilled dough, grating the frozen half over the top), no bake temperature or time. The filling
method itself stops after "mix thoroughly until smooth" with no mention of where the berries go.
**MASTER note agrees?** yes.

## recipe-041 — Apricot Roulade
**Source lines:** 1793-1837
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Classic sponge cake (7); Apricot jam (3); Cream cheese frosting (3).
**Instruction sections in source:** METHOD → Sponge cake only (4 steps + 1 tip).
**What is missing:** Apricot Jam and Cream Cheese Frosting have ingredients but no method steps, and
there is no roulade rolling/assembly/chilling step. Sponge method ends at the bake (line 1836).
**MASTER note agrees?** yes.

## recipe-042 — Apricot Honey Cake
**Source lines:** 1838-1888
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Honey cakes (6); Apricot coulis (3); Sour cream frosting (4);
Frosting for coating (3).
**Instruction sections in source:** METHOD → Cake layers only (4 steps + 1 tip).
**What is missing:** Apricot Coulis, Sour Cream Frosting and Frosting for Coating all have full
ingredient lists and zero method steps. No layering/assembly/decoration step either — the last step
(line 1887) only says to grind the scraps into crumbs "to decorate the cake," a decoration whose
application is never described.
**MASTER note agrees?** yes.

## recipe-043 — Chocolate Honeycomb
**Source lines:** 1889-1921
**Classification:** STEPS_MISSING
**Ingredient sections in source:** One unnamed block under the lead-in "You will need:" — 5
ingredient lines (white chocolate (1), white chocolate (2), Mycryo™ powder, titanium dioxide,
fat-soluble color) plus a 6th line that is equipment, not an ingredient: "🍯 Silikomart Miel 8
silicone mold" (line 1907).
**Instruction sections in source:** "Method:" — 4 steps, each with a tip.
**What is missing:** No step ever pours, fills, scrapes, sets, or unmolds the chocolate. The recipe
ends the instant the chocolate is tempered and colored, so the honeycomb decoration is never
actually formed. Separately — and this is a genuine content gap, not just a formatting one — the
**Mycryo™ powder (2 g) is listed as an ingredient and is used in no step at all.** Mycryo is the
tempering agent; the seeding step (line 1920) tempers with callets instead. So the missing
instructions include at least one step that would have consumed a listed ingredient.
**MASTER note agrees?** partly — it names only the missing "pour/fill the mold" step and calls this
one "closer to a natural instruction-list ending than the other gaps." It does not note the unused
Mycryo™ ingredient, which is stronger evidence of a real gap than the note allows. Ingredient list
itself is complete, so the classification still stands.

## recipe-044 — Sour Cream Cake
**Source lines:** 1922-1966
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Sour cream cake layers (9); Chocolate icing (4); Vanilla sour
cream frosting (3).
**Instruction sections in source:** Sour cream cake layers only (4 steps). Note: there is no
standalone "METHOD" header in this recipe — the method begins directly at the "✔️ Sour cream cake
layers" heading on line 1957. Not a defect, just a format variation.
**What is missing:** Chocolate Icing and Vanilla Sour Cream Frosting have ingredients and no
method. No assembly step. Also worth noting: the layer method (line 1959) works with only 1 egg,
75 g sugar, 5 g vanilla and 150 g sour cream — one third of the listed quantities — implying the
batter is made in three batches, but the source never says so, and the poppy seeds and raisins
listed in the ingredients are never mentioned in any step (only the walnuts are, line 1961).
**MASTER note agrees?** partly — it correctly names the two missing frosting/icing sections and the
assembly, but does not mention that poppy seeds and raisins are listed and never used. Same shape
of finding as recipe-043: the ingredient list is complete, but more of the method is missing than
the note describes.

## recipe-046 — Strawberry Mojito Zephyr
**Source lines:** 2002-2058
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Baked Apples (1 line: "1000–1500 g green apples"); Strawberry–Lime
Jam (6); Strawberry Mojito Zephyr (8, incl. "zest of one lime"); Sprinkling (2).
**Instruction sections in source:** Baked Apples (2 steps + tip); Strawberry–Lime Jam (2 steps).
**What is missing:** The Zephyr section itself — the actual dessert — has 8 ingredients and no
method: no albumin whipping, no agar syrup cooking, no piping, no drying. The Sprinkling section
(icing sugar + cornstarch) also has no method. Text ends at line 2057 with the jam cooled to
30–35 °C.
**MASTER note agrees?** yes (it also correctly flags the "ECIPE" dropped-letter artifact in the title
as an extraction bug, not missing content — confirmed by reading line 2002).

## recipe-047 — Quiche with Salmon and Gorgonzola
**Source lines:** 2059-2100
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Quiche crust (6); Filling (3); Sauce (3, incl. the unquantified
"salt and pepper to taste").
**Instruction sections in source:** Crust only (4 steps + 3 tips).
**What is missing:** Filling and Sauce have ingredients and no method — the broccoli is never
blanched, the salmon never portioned, the egg/sour-cream sauce never mixed. No final assembly or
bake step for the filled quiche. Text ends at the blind-baked crust (line 2098).
**MASTER note agrees?** yes.

## recipe-048 — Brownie Bonbons
**Source lines:** 2101-2142
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Brownie (8); Dark chocolate ganache (2).
**Instruction sections in source:** Brownie (5 steps); Dark chocolate ganache (1 step).
**What is missing:** Every listed ingredient section does have a method, and every listed ingredient
is used — this is the least-incomplete of the 32. What is absent is the finishing sequence the
title requires: cutting/portioning the brownie, forming the bonbons, and coating/dipping them
(the tempered-shell step a "bonbon" implies). The ganache is made and never applied.
**MASTER note agrees?** yes — it flags exactly this and describes it as "possibly incomplete,"
which matches what the text shows.

## recipe-050 — Panettone with Candied Tangerine
**Source lines:** 2174-2229
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Candied tangerines (5); Rum soaked dried fruits (4); Bread
starter (4); Panettone dough (9, incl. the unquantified "lemon zest").
**Instruction sections in source:** Candied tangerines (4 steps); an **unlabeled** Rum-soaked-dried-
fruits step at line 2223 (sitting inside the candied-tangerine block with no heading of its own —
a format trap; it is a real method step, correctly attributed in the export); Bread starter (1 step
+ tip).
**What is missing:** Panettone Dough — the main dough, 9 ingredients — has no method at all. No
mixing, no gluten development, no first or second proof, no butter incorporation, no shaping into
paper molds, no bake, no upside-down cooling. This is the largest single method gap in the set
relative to the recipe's difficulty.
**MASTER note agrees?** yes (and records that two independent batch agents stopped at the identical
point, which is good corroboration that this is a source gap and not a batch-seam artifact).

## recipe-052 — Cottage Cheese Casserole
**Source lines:** 2256-2289
**Classification:** STEPS_MISSING
**Ingredient sections in source:** One unsectioned block of 10 lines (raisins, cottage cheese,
baking powder, salt, sour cream, semolina, whole eggs, caster sugar, vanilla paste, fresh berries
for decoration).
**Instruction sections in source:** One unsectioned block of 5 steps (lines 2277-2284) plus a
sugar-quantity tip.
**What is missing:** Everything after "Add the raisins and mix again" — mold preparation, filling,
bake temperature and time, cooling, and the berry decoration named in the ingredients. The source
itself says why: line 2286, "Swipe the carousel to read the continuation⬅️". This is the author
deliberately deferring the rest to a carousel image, not an extraction failure.
**MASTER note agrees?** yes — it cites the same "Swipe the carousel" line as the proof.

## recipe-054 — Chocolate Napoleon Cake with Sour Cherries and Coconut
**Source lines:** 2318-2367
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Chocolate shortcrust pastry (6); Chocolate Diplomat cream (8);
Sour cherry sauce (3); Coconut ganache (3).
**Instruction sections in source:** Shortcrust pastry layers only (3 steps).
**What is missing:** Diplomat Cream, Sour Cherry Sauce and Coconut Ganache — 14 ingredients between
them — have no method at all. And the shortcrust method itself is cut short: the last step (line
2366) only rolls the dough out; the layers are never baked and never trimmed, and the cake is never
assembled. So even the one section that has a method has an incomplete one.
**MASTER note agrees?** yes on the three missing sections; it does not spell out that the
shortcrust method also stops before baking. Minor under-statement, same classification.

## recipe-055 — Chocolate Cupcakes with Salted Caramel
**Source lines:** 2368-2421
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Cupcake batter — the header carries the serving count
"~ 10–12 pcs (50–60 g each)" (8 ingredients); Salted caramel (5); Dark chocolate ganache (2);
Chocolate cream cheese frosting (4).
**Instruction sections in source:** Batter (4 steps); Salted caramel (1 step, cut off).
**What is missing:** The Salted caramel method breaks off mid-process at line 2418 — sugar is on
the heat and cream is warming, but the caramelisation, the butter/cream/salt additions and the
cooling are never described. Dark Chocolate Ganache and Chocolate Cream Cheese Frosting have
ingredients and no method. No filling/piping/assembly step for the cupcakes. The recipe ends
abruptly with a call-to-action paragraph (line 2420).
**MASTER note agrees?** yes.

## recipe-056 — Wild Berry Cake
**Source lines:** 2422-2493
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Vanilla sponge (9); Wild berry compote (6); Wild berry mousse (8);
Vanilla cream cheese frosting (4); Vanilla milk soak (3); Buttercream for coating (4).
**Instruction sections in source:** Sponge only (5 steps).
**What is missing:** Five of the six sections — Compote, Mousse, Cream Cheese Frosting, Milk Soak,
Buttercream for Coating, 25 ingredients in total — have no method at all, and there is no assembly
or decoration step. Only the sponge is fully described (through slicing into three layers).
**MASTER note agrees?** yes.

## recipe-059 — Cottage Cheese Stollen
**Source lines:** 2566-2618
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Spiced Dried Fruits (4); Roasted Nut Halves (2); Dough (13,
including the two flour splits (1)/(2) and the two butter splits (1)/(2)).
**Instruction sections in source:** Spiced dried fruits (2 steps); Roasted nut halves (2 steps);
Dough (1 step, cut off).
**What is missing:** The Dough method stops at line 2617 after creaming butter (1) with sugar and
adding the eggs. Never described: adding the cottage cheese, vanilla, zests and lemon juice; adding
flour (1) + baking powder or flour (2); folding in the dried fruits and nuts; shaping the two
stollens; baking; and the classic butter (2) brush + sugar dusting finish. Butter (2), flour (2),
cottage cheese, zests, lemon juice, vanilla powder, the dried fruits and the nuts are all listed
and never used by any surviving step.
**MASTER note agrees?** yes ("instructions stop mid-Dough process (after adding eggs one at a
time)").

## recipe-060 — Upside-Down Banana Pie
**Source lines:** 2619-2678
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Dry caramel-coated bananas (3); Batter (10, incl. "zest of one
orange").
**Instruction sections in source:** Dry caramel-coated bananas (6 steps + a mold tip); Batter (1
step, cut off).
**What is missing:** The Batter method breaks off at line 2677 having only combined the dry
ingredients in the mixer bowl. The oil and water are never added, the batter is never poured over
the caramelised bananas, and there is no bake temperature, bake time, or the inversion step the
title depends on.
**MASTER note agrees?** yes.

## recipe-063 — Honey Cake with Sea Buckthorn Curd
**Source lines:** 2745-2794
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Honey Dough (7 ingredients across 6 lines — **line 2763 packs two
ingredients onto one line**: "1 tsp. lemon juice or 1/3 tsp. citric acid 🔸 600 g all-purpose flour".
A line-counting check would read 6 ingredients here; reading it gives 7. The export split it
correctly.); Sea Buckthorn Curd (4); Sour Cream Frosting (3); Sour Cream Frosting for Coating (3).
**Instruction sections in source:** Honey dough (4 steps); Sea Buckthorn Curd (1 step, cut off).
**What is missing:** The curd method stops after sieving the sea-buckthorn puree — the sugar,
butter and yolks are never cooked into a curd. Sour Cream Frosting and Sour Cream Frosting for
Coating have ingredients and no method. No assembly step.
**MASTER note agrees?** yes.

## recipe-064 — Banana Cupcakes with Rum
**Source lines:** 2795-2851
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Batter — header carries the serving count "~18–20 pcs. 45–50 g
each" (13 ingredients); Banana Caramel (8); Banana Caramel–Rum Frosting (3).
**Instruction sections in source:** Batter (5 steps).
**What is missing:** Banana Caramel and Banana Caramel–Rum Frosting have ingredients and no method.
Also, the Batter method itself stops at line 2850 with the batter mixed — no depositing into liners,
no bake temperature or time. So the gap is slightly larger than "two sections missing."
**MASTER note agrees?** partly — it says "instructions stop at end of Batter section," which is
literally true but reads as if the Batter is complete. The Batter method is itself missing its
deposit-and-bake steps. Classification unchanged.

## recipe-065 — Charity Lemon-Poppy Seed Cupcake
**Source lines:** 2852-2903
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Batter — header carries the serving count "~12 pcs, 50-60 g each"
(9 ingredients, incl. "zest of 3 lemons"); Lemon Curd (5); Frosting (7).
**Instruction sections in source:** Batter (3 steps).
**What is missing:** Lemon Curd and Frosting have ingredients and no method. The Batter method also
stops after mixing (line 2902) — no depositing into liners, no bake, no filling-the-cupcake step.
**MASTER note agrees?** partly — same shape as recipe-064: the note names only Lemon Curd and
Frosting, but the Batter's deposit/bake steps are also absent.

## recipe-066 — Hazelnut-Chocolate Cupcakes
**Source lines:** 2904-2956
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Crumble (4); Batter — header carries the count "~28-30 pcs."
(11 ingredients); Ganache (5).
**Instruction sections in source:** Crumble (2 steps + tip); Batter (5 steps, complete through
baking and cooling).
**What is missing:** Only the Ganache — 5 ingredients (milk chocolate, hazelnut paste, two cream
splits, mascarpone) — has no method, and there is no piping/decorating step. This is the second
most nearly-complete of the 32: the Batter section here genuinely runs all the way through the bake
(line 2955), unlike its sibling cupcake recipes above.
**MASTER note agrees?** yes — and it usefully observes that an equivalent ganache method appears
earlier in the document (#21, #37, #49, #53), so this may be an intentional cross-reference rather
than a true gap.

## recipe-067 — Raspberry-Lemon Cupcakes
**Source lines:** 2957-3002
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Batter — header carries the count "~ 12-14 pcs. ~60 g each"
(9 ingredients, incl. "zest of two lemons"); Lemon Curd (5); Frosting (2).
**Instruction sections in source:** Batter (4 steps + a fan-oven tip) — complete through baking and
cooling.
**What is missing:** Lemon Curd (5 ingredients) and Frosting (2 ingredients) have no method, and
there is no filling/piping/assembly step. The Batter itself is complete.
**MASTER note agrees?** yes.

## recipe-068 — Apricot-Amaretto Cheesecake
**Source lines:** 3003-3053
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Crust (4); Cream cheese layer (7, incl. "zest of one orange");
Decoration (5). Plus the equipment lead-in at line 3015 ("you'll need a cake ring d = 22-24 cm,
h = 6 cm") — metadata, not an ingredient.
**Instruction sections in source:** Crust (3 steps); Cream cheese layer (2 steps, through the bake).
**What is missing:** Decoration — fresh apricots, sugar, rum, Amaretto, almond flakes — has
ingredients and no method. Also no chilling/stabilising step after the bake and no unmolding step.
**MASTER note agrees?** yes.

## recipe-069 — Strawberry-White Chocolate-Vanilla Cupcakes
**Source lines:** 3054-3115
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Batter — header carries the count "~20-22 pcs" (9 ingredients);
Strawberry marmalade (4); Frosting (6).
**Instruction sections in source:** Batter (7 steps + 2 chef tips) — complete through baking;
Strawberry marmalade (1 step, cut off).
**What is missing:** The marmalade method breaks off mid-step at line 3114 (puree heated, pectin/
sugar sprinkled in) with no boil, no lemon juice addition, no cooling/setting. The Frosting has 6
ingredients and no method at all, and there is no filling/piping/assembly step.
**MASTER note agrees?** yes.

## recipe-070 — Banana Tea Cake with Dates and Nuts
**Source lines:** 3116-3177
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Tea Cake (13); Caramel-Banana Sauce (8); Buttercream for
decoration (4). Plus the equipment line 3160 ("2 rectangular molds ~22x9 cm, h=10 cm") — equipment,
sitting unlabeled after the Buttercream block; a format trap, correctly not treated as an
ingredient.
**Instruction sections in source:** Tea cakes (5 steps + a no-alcohol tip).
**What is missing:** Caramel-Banana Sauce and Buttercream have ingredients and no method. The Tea
cake method also stops after the batter is poured into the molds (line 3174) with no bake
temperature or time. Source line 3176 states the reason outright: "See the continuation of the
recipe in the photo carousel ⏩" — an author-side omission.
**MASTER note agrees?** yes (it quotes the same carousel line).

## recipe-071 — Caramel and Strawberry Honey Cake
**Source lines:** 3178-3231
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Cake Layers (7); Strawberry Confit (4); Caramel Frosting (3);
Cream Cheese Frosting (4).
**Instruction sections in source:** Cake Layers only (5 steps, complete through baking and trimming).
**What is missing:** Strawberry Confit, Caramel Frosting and Cream Cheese Frosting — 11 ingredients
— have no method. No assembly, no crumb coating, no decoration, despite step 4 explicitly reserving
a scrap layer "which will later be needed for making crumbs" (line 3228) — those crumbs are never
used by any surviving step.
**MASTER note agrees?** yes.

## recipe-072 — Mango and Passion Fruit Individual Cheesecakes
**Source lines:** 3232-3276
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Cheesecake base (5); Cream cheese layer (7); Topping (5). Plus
the equipment lead-in at line 3244 ("I used 9 rings d=9 cm, h=5.5 cm") — this is effectively the
`servings` value (9 individual cheesecakes) folded into a prose sentence, a format trap.
**Instruction sections in source:** Cheesecake base (4 steps + a shortcrust tip).
**What is missing:** Cream Cheese Layer and Topping — 12 ingredients — have no method at all, and
there is no bake, chill, or unmolding step. Text ends after freezing the bases.
**MASTER note agrees?** yes.

## recipe-073 — Easter Cake — Kulich with Egg Yolks
**Source lines:** 3277-3315
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Preferment — introduced by the prose lead-in "So, for the
preferment you need:" rather than an emoji header (4 lines); For the dough — introduced by "For the
dough:" (10 lines, incl. "preferment" itself as the first item and the unquantified "raisins,
candied fruits, dried fruits, orange zest and lemon zest soaked in rum - to taste (I have ~ 300 g)").
Both are format traps: no emoji section header, plain prose lead-ins.
**Instruction sections in source:** A dried-fruit-soaking step at line 3308 (written as a bullet
inside the ingredient block, no heading — another trap; the export correctly promoted it to a step);
"Making the preferment:" (1 step + a fresh-yeast tip).
**What is missing:** The entire main dough process — mixing, kneading, butter incorporation, first
and second proof, folding in the soaked fruits, filling the kulich molds, baking, and the glaze —
is absent. Only the preferment is described.
**MASTER note agrees?** yes. (It says "Preferment instructions cut off mid-step"; on my reading the
preferment step is actually a complete single instruction ending with the doubling-in-volume
proof — the far bigger gap, the whole main dough, the note names correctly.)

## recipe-074 — Cupcake with Guinness Beer and Baileys Liqueur
**Source lines:** 3316-3370
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Batter (9); Frosting with Baileys (3); Soaking (1 line: 120 g
Baileys liqueur); Chocolate ganache (2). Plus the serving lead-in at lines 3324-3325 ("for 12
cupcakes* / * I advise you to immediately prepare a double portion") — a `servings` value written
as prose above the sections, another format trap.
**Instruction sections in source:** Batter (5 steps + an oven-mode tip, complete through baking);
Frosting with Baileys (2 steps, cut off).
**What is missing:** The Frosting section's second step (line 3369) makes holes in the cupcakes but
never says what goes in them — the Soaking section (120 g Baileys) has no method, and neither does
the Chocolate ganache. No piping or final decoration step.
**MASTER note agrees?** yes.

## recipe-075 — Banana and Chocolate Cheesecake
**Source lines:** 3371-3424
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Base (6, including "3 big bananas" — note these bananas sit in
the *Base* section but are clearly a layer on top of the crust, not part of the crumb mixture);
Cream Cheese Layer (5); Dark Chocolate Ganache with Banana (3); Milk Chocolate Ganache (2). Plus
the equipment lead-in at line 3387 ("Cake ring d = 22-24 cm, h = 6-8 cm").
**Instruction sections in source:** Base (3 steps + a crumble tip).
**What is missing:** Cream Cheese Layer, Dark Chocolate Ganache with Banana and Milk Chocolate
Ganache — 10 ingredients — have no method at all. No bake, no chill, no unmolding, no decoration.
Additionally, the **3 big bananas listed in the Base section are never used by any surviving step**
— the base method (lines 3419-3421) only handles walnuts, biscuits, cocoa, sugar and butter, so
even the one section that has a method does not consume all of its own ingredients.
**MASTER note agrees?** partly — the note names the three missing sections correctly but does not
record that the Base's own instructions are also incomplete (the bananas are orphaned). Same
classification, larger gap than stated.

## recipe-077 — Egg Yolk and Butter Tea Cake
**Source lines:** 3472-3514
**Classification:** STEPS_MISSING
**Ingredient sections in source:** One unsectioned block of 12 lines (butter through raisins), plus
the unlabeled trailing equipment line 3500 ("2 rectangular molds ~22x10 cm") — a format trap, and
equipment rather than an ingredient. The export drops it entirely; defensible but worth noting.
**Instruction sections in source:** One unsectioned block of 5 steps + 3 substitution tips.
**What is missing:** The method ends the moment the flour is mixed in (line 3513). The **nuts
(100 g) and raisins (100 g) are listed and never used by any step**, and there is no filling of the
molds, no bake temperature, and no bake time — for a two-loaf tea cake whose molds are explicitly
specified.
**MASTER note agrees?** yes — it names exactly this ("missing the instructions for incorporating the
nuts and raisins and for baking the tea cake (no temperature or time given)").

## recipe-078 — Raffaello Zephyr
**Source lines:** 3515-3557
**Classification:** STEPS_MISSING
**Ingredient sections in source:** Apple jam (4); 'Raffaello' zephyr (11). Format note: this recipe
interleaves — the Apple jam ingredients are immediately followed by the Apple jam method, *then* the
zephyr ingredients, *then* the zephyr method. There is no single "METHOD" divider.
**Instruction sections in source:** Apple jam (4 steps, complete through cooling to 30-35 °C);
'Raffaello' zephyr (4 steps + 2 tips, cut off).
**What is missing:** The zephyr method breaks off at line 3556 with the syrup cooked to 108-110 °C.
Never described: pouring the syrup into the whipping jam-albumin mass, whipping to stiffness,
piping the zephyr halves, drying/stabilising, sandwiching, and the finishing coat. The **white
chocolate (120 g), desiccated coconut (40 g) and roasted blanched almonds (40 g) — the three
ingredients that actually make it a "Raffaello" — are listed and used by no surviving step.**
**MASTER note agrees?** yes — the note names the missing "final molding and coating in coconut and
almonds" explicitly.

---

## Summary

**Audited:** all 32 of 32.

### Counts per classification

| Classification | Count | Recipes |
|---|---:|---|
| STEPS_MISSING | 32 | all of them |
| INGREDIENTS_MISSING | 0 | — |
| BOTH | 0 | — |
| ACTUALLY_COMPLETE | 0 | — |

**The MASTER claim holds on its central point.** Across all 32, every ingredient section named in
the source carries a full, readable ingredient list; nothing is truncated mid-list, and no section
header appears with an empty body. The `is_complete: false` flag is correct in all 32 cases, and
in every case what is missing is instruction steps, never ingredients. The export JSON faithfully
mirrors the source in every entry checked, including the format traps (the two-ingredients-on-one-
line at source 2763 in recipe-063, the prose section lead-ins in recipe-073, the unlabeled
rum-soaked-fruits method step at source 2223 in recipe-050, and the range-preserving `amount: null`
convention).

### Where my reading DISAGREES with the MASTER note

None of these change a classification — all six are the same shape: **the MASTER note understates
how much of the method is missing.** Each names some missing sections but describes a surviving
section as complete when it is not, or misses that a listed ingredient is orphaned.

1. **recipe-043 (Chocolate Honeycomb)** — the note calls this "closer to a natural instruction-list
   ending" and only lightly flags it. But **Mycryo™ powder (2 g) is a listed ingredient used by no
   step**; the tempering is done by callet seeding instead. That is a missing step that would have
   consumed an ingredient, so the gap is more definite than "possibly incomplete."
2. **recipe-044 (Sour Cream Cake)** — the note names the missing Chocolate Icing / Vanilla Sour
   Cream Frosting / assembly, but omits that **poppy seeds (75 g) and golden raisins (75 g) are
   listed and used by no step** (only the walnuts are). The layer method also silently works in
   one-third quantities without ever saying the batter is made in batches.
3. **recipe-054 (Chocolate Napoleon)** — the note names the three missing filling sections but
   presents the shortcrust as done. **The shortcrust method itself stops at rolling out** — the
   layers are never baked or trimmed.
4. **recipe-064 (Banana Cupcakes with Rum)** and **recipe-065 (Lemon-Poppy Seed Cupcake)** — both
   notes say instructions "stop at end of Batter section," implying the batter is complete. In both,
   **the Batter method has no depositing-into-liners step and no bake temperature or time.** (By
   contrast, recipes 066, 067, 069 and 074 genuinely do carry their batter through the bake — so
   this is a real difference between these recipes, not a uniform pattern.)
5. **recipe-075 (Banana and Chocolate Cheesecake)** — the note names the three missing layers but
   presents the Base as complete. **The 3 big bananas listed in the Base section are used by no
   step**; the base method handles only walnuts, biscuits, cocoa, sugar and butter.

### Secondary observations (not disagreements)

- **Orphaned-ingredient signal.** Six recipes list an ingredient that no surviving step consumes:
  043 (Mycryo™), 044 (poppy seeds, raisins), 059 (butter (2), flour (2), cottage cheese, zests,
  lemon juice, vanilla, fruits, nuts), 071 (the reserved crumb layer), 075 (3 bananas), 077 (nuts,
  raisins), 078 (white chocolate, coconut, almonds). This is the most reliable independent
  confirmation that steps are missing — it is derived from the source's own internal consistency
  rather than from a section-header comparison, and it is exactly the class of evidence a
  section-count check cannot produce.
- **Three degrees of incompleteness** are visible in this set, and the single `is_complete` boolean
  flattens them: (a) a whole named section has zero steps (most recipes); (b) a section's steps
  break off mid-process (046 jam is fine but 055 caramel, 059 dough, 060 batter, 063 curd, 069
  marmalade, 078 zephyr all break mid-step); (c) all sections have steps but the final
  assembly/finishing is absent (048, and arguably 066). If a future pass wants to prioritise which
  recipes are worth reconstructing, (c) is nearly usable as-is and (a) is not.
- **Author-declared gaps.** Two recipes state in the source itself that the rest lives in a photo
  carousel: recipe-052 (line 2286) and recipe-070 (line 3176). These are authorial omissions, not
  docx-extraction failures, and they corroborate the MASTER's carousel theory for the rest.
- **Dropped-letter extraction artifact** confirmed at source lines 2002 ("ECIPE FOR STRAWBERRY
  MOJITO ZEPHYR"), 2368 ("ECIPE FOR CHOCOLATE CUPCAKES...") and 3116 ("ANANA TEA CAKE..."). These
  are cosmetic title damage, not missing content, and are already corrected in MASTER and the export.
- **Equipment lines inside ingredient blocks** appear in 038 (line 1654), 043 (line 1907, the
  Silikomart mold), 068 (line 3015), 070 (line 3160), 072 (line 3244), 075 (line 3387) and 077
  (line 3500). Handling is inconsistent in the export — 038 carries its mold note as a step, 043
  and 077 drop theirs. Not a correctness defect for this audit's question, but a consistency item
  if equipment is ever surfaced on the site.
