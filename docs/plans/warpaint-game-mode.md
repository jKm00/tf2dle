# War Paint game mode

Status: playable prototype implemented at `/game-modes/warpaint`.

## Implemented prototype

- Hints unlock after submitted guesses, following the schedule below. Shortlist and collection cards count down with "Unlocks in X guesses" and use primary styling when unlocked. Image zoom changes have no explanatory card.
- Stats, completion, and sharing use the number of guesses, like the other game modes.
- The shortlist uses a date-seeded order and prefers distractors from the same collection or grade.
- The default crop targets the upper painted canvas, away from the transparent border and spray cans. Entries can override it with an optional normalized `crop` containing `x`, `y`, `width`, and `height`.
- Guess history and unlocked clues persist locally until the next daily puzzle. Players can keep guessing after the final reveal.
- The searchable picker and guess history show item thumbnails. The late shortlist uses names only and replaces the picker when it unlocks.

Individual crop selection and distractor quality still need playtesting across the dataset.

## Goal

Build a daily visual puzzle where players identify a War Paint from progressively clearer images. Collectors can solve it through recognition; other players can use image hints, guess feedback, and a late shortlist to work toward the answer.

Recognising a design should help even when the player cannot remember its exact name. The mode should reward solving with fewer clues without requiring players to know all 163 War Paint names.

This expands on the [War Paint idea in the game mode plan](game-mode-ideas.md#7-war-paint).

## Available data and images

The scraped dataset contains 163 War Paints across 16 collections. Each record includes:

- `name`
- `image`
- `collection`
- `grade`
- `wear`
- `releaseDate`
- `link`

`image` stores the image ID independently of the display name. The corresponding file is `<image>.png`; image paths are not stored in the dataset.

All downloaded references use Factory New wear. They are full-resolution item previews showing a canvas and spray cans, rather than flat texture sheets. The canvases can contain several different pattern areas, and the can caps provide additional colour clues. There is transparent space around each item.

Examples inspected include Anodized Aloha, Miami Element, Smissmas Sweater, and Spectrum Splattered.

## Daily game loop

1. Everyone receives the same daily War Paint and initial crop.
2. Players select a name through a searchable answer picker consistent with the other game modes.
3. Each incorrect guess advances the reveal and provides brief metadata feedback.
4. Later guesses unlock a shortlist and a collection hint, grouped below the image. The shortlist replaces the searchable picker.
5. Players can continue guessing after the final hint. There is no hard failure at that point.

The challenge is to solve with fewer guesses. Stats and shared results use the guess count.

## Hint progression

| After this many guesses | What the player sees                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| 0                       | A small, enlarged crop containing a meaningful piece of the pattern   |
| 1                       | A larger crop around the same area                                    |
| 2                       | The painted canvas, including its different pattern areas             |
| 3                       | The full item image, including the spray cans                         |
| 4                       | A shortlist of six possible names                                     |
| 5                       | The collection, with incompatible shortlist choices visibly ruled out |

These stages are a prototype proposal, not a fixed difficulty specification. Each stage should add information that helps players make an informed guess.

Keep earlier clues connected to later ones. Expand around the initial crop instead of jumping to unrelated parts of the image.

## Initial crop selection

Choose the initial crop per War Paint rather than taking a random crop from the whole PNG.

The crop should:

- Contain enough of a motif to support recognition.
- Leave useful details for subsequent reveals.
- Avoid transparent space, spray cans, and generic solid-colour areas.
- Remain readable when enlarged on a mobile screen.

Add optional normalized crop coordinates to each entry. These describe the crop independently of image display size and allow individual paints to receive appropriate starting clues. The field name and exact shape are still to be decided.

Use the same crop and progression for everyone playing a given daily puzzle.

## Answer picker and shortlist

Use searchable names with item thumbnails as the primary answer input. Thumbnails also appear beside previous guesses so players can compare the designs they have tried.

The late shortlist helps players who recognise the appearance but cannot remember its name. For example, someone may recognise Miami Element's pink-and-teal design from a weapon without knowing what to search for.

Shortlist rules:

- Show six names, including the correct answer.
- Use names only, without full-image thumbnails.
- Choose plausible distractors, preferably with similar grades or collections.
- Avoid a set where one name obviously describes the visible pattern and the others are unrelated.
- Keep the choices and their order consistent for the shared daily puzzle.
- When the collection hint appears, visibly rule out incompatible choices rather than silently removing them.

Keep the shortlist name-only so it helps players recall names without adding six full-image choices to the page.

Distractor selection needs prototyping. The current metadata can narrow candidate pools, but it does not describe visual similarity.

## Wrong-guess feedback

Give a compact message beneath each incorrect guess:

- Same collection.
- Same grade.
- Same collection and grade.
- Different collection and grade.

For example, guessing Mosaic when the answer is Miami Element tells the player that they have found the right collection.

Keep the image as the main puzzle. A large attribute-comparison table would add little with the available metadata. Wear is identical across every reference, so it is not a useful guessing attribute.

Feedback uses text and the same correct/incorrect background colours as the other game modes. The image stays in its own neutral column; only the name and feedback receive the result colour. Unlocked hints use the same primary styling as unusual and cosmetic hints.

## Collection hints and difficulty

Collection hints vary in strength. Saxton Select and Mann Co. Events each contain only one paint in the scraped dataset, so revealing those collections effectively gives away the answer.

That is acceptable as a final assist, but these collections should not appear as early hints.

Review visually similar paints and variants during crop selection. Difficulty should come from identifying the design, not from a crop that hides its distinguishing details.

## Completion

After a correct guess, show:

- The full item image and War Paint name.
- The player's result, showing the number of guesses.

The reveal should help players learn an unfamiliar War Paint so they can recognise it in a future puzzle.

## First prototype

Implement the smallest playable version with:

- The crop progression.
- Searchable name selection.
- Compact feedback on incorrect guesses.
- The late name shortlist and collection hint.

Try a small selection of distinctive paints alongside several visually similar ones before committing to the final reveal stages.

Observe whether players can make an informed guess at each stage. If they repeatedly submit random names until the full image appears, improve the initial crops or progression.

Also check whether players who recognise a design can use the shortlist to recover its name, whether the enlarged crops remain readable on mobile, and whether metadata feedback makes similar paints easier to distinguish.

## Open decisions

- Exact crop sizes and the final number of reveal stages.
- How to generate and review plausible daily distractors.
- Whether each stage is useful across the full dataset, including singleton collections and similar variants.
