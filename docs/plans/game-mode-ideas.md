# Future game modes

Research date: October 11, 2026. Content sources are the Official TF2 Wiki.

The app already has Weapon, Weapon 2, Map, Cosmetic, and Unusual. These ideas
prioritize broad player appeal, puzzle depth, replayability, and variety added to
those modes. The ranking is a product judgment, not a measurement of demand.

| Rank | Mode            | Player value                                  | Status                 |
| ---- | --------------- | --------------------------------------------- | ---------------------- |
| 1    | TF2 Connections | Reasoning across familiar TF2 content         | Proposed               |
| 2    | Who said it?    | Accessible dialogue recognition and TF2 humor | Initial implementation |
| 3    | Taunt           | Recognizing animations and props              | Proposed               |
| 4    | Sound           | Testing familiarity with gameplay audio       | Proposed               |
| 5    | Achievement     | Icons, wordplay, and gameplay knowledge       | Proposed               |
| 6    | Kill feed       | Short challenges using familiar HUD icons     | Proposed               |
| 7    | War Paint       | Pattern recognition for collectors            | Proposed               |
| 8    | Mann's mystery  | Character and comic puzzles for lore fans     | Proposed               |

## 1. TF2 Connections

Show 16 named items. Find four groups of four with shared connections. Allow four
mistakes and offer a "one away" hint for selections containing three members of a
group. Connections can use item sets, shared mechanics, release updates, or War
Paint collections.

Example group: Soda Popper, Winger, Atomizer, and Bonk Boy belong to The #1 Fan
item set. Mix weapons and cosmetics so recognizing an item does not immediately
reveal the connection.

This adds the most puzzle depth and supports spoiler-free board sharing. Start
with hand-curated boards. Check every board for alternate complete solutions;
overlapping relationships can make automatically generated puzzles unfair.

Sources: [Item sets](https://wiki.teamfortress.com/wiki/Item_sets),
[War Paint collections](https://wiki.teamfortress.com/wiki/War_Paint#War_Paint_Collections).

## 2. Who said it?

Identify the speaker of a partially revealed voice-line transcript. Reveal more
words after each wrong guess. Offer the full transcript and original audio after
solving. Use five quotes per day so the small speaker pool still produces a
satisfying session. Fewer wrong guesses means fewer hints used.

Example: "Less talk, more fight!" is a Soldier response. Prefer distinctive lines
and exclude generic lines spoken by several characters. Add non-player
characters such as the Administrator, Miss Pauling, and Merasmus as the curated
pool grows. Text-first play works without sound; audio is a reward, not required
to solve the puzzle.

### Initial implementation

- Route and storage key: `who-said-it`.
- Five different speakers per daily challenge, selected once and stored in the
  database. Everyone receives the same quotes, with a UTC daily reset.
- A curated server-only quote dataset records stable IDs, exact Wiki transcripts,
  speaker names, audio URLs, and source pages. Eight speaking mercenaries and the
  Administrator form the initial speaker pool. Pyro's muffled transcripts are
  excluded from this first pool; Miss Pauling and Merasmus are future additions.
- Each quote starts with roughly one quarter of its words. Wrong guesses reveal
  another quarter, until the full quote is visible. A wrong speaker cannot be
  guessed again for that quote, but is available again in the next round.
- The server validates the submitted guess history, computes the active round
  and hint level, and reveals answer/audio/source data only for solved quotes.
- Progress, streaks, and total-guess statistics use the existing local-storage
  and shared game-engine patterns. Only completion of all five quotes counts as
  a daily win, including in admin metrics and community completion counts.
- Solved quotes remain available for replaying audio. Sharing reports the total
  guesses and a spoiler-free row for each quote. Yesterday's five speakers appear
  in the footer.
- Audio remains linked to Wiki-hosted files. Browser playback errors provide a
  direct file link. No live Wiki fetch is needed to generate or validate a game.

Maintain existing quote IDs when editing the dataset because saved daily
challenges reference them. Review new lines for duplicates, impersonations,
speaker names that give away the answer, and unused content before adding them.

Sources: [Responses](https://wiki.teamfortress.com/wiki/Responses) and the linked
class and non-player-character response pages.

## 3. Taunt

Guess an equippable special taunt from a cropped still. Wrong guesses reveal a
short silent animation, then more of the prop, eligible classes, or a longer
animation. Example: a chair or umbrella close-up eventually reveals Engineer's
Rancho Relaxo.

Motion makes this distinct from Cosmetic and Unusual. Prefer animation clues to
backpack thumbnails. Wiki articles provide names, class eligibility,
descriptions, images, and demonstration references. Consistent short clips may
need preparation.

Sources: [Taunts](https://wiki.teamfortress.com/wiki/Taunts),
[Rancho Relaxo](https://wiki.teamfortress.com/wiki/Rancho_Relaxo).

## 4. Sound

Identify a weapon, building, or event from a short sound. Wrong guesses reveal a
longer clip and a category hint. Label weapon and event rounds clearly.

Examples include Dead Ringer uncloaking, Rainblower firing, a Sentry Buster
appearing, and the revenge cue. This rewards experience from actual matches
without requiring knowledge of obscure item names.

Exclude shared sounds or accept every valid answer. The Wiki's Weapon sounds
category listed 46 files at research time, including variants and unused
content, not 46 distinct weapon puzzles. Add event sounds to broaden the pool.

Sources: [Weapon sounds](https://wiki.teamfortress.com/wiki/Category:Weapon_sounds),
[Audio cues](https://wiki.teamfortress.com/wiki/Audio_cues).

## 5. Achievement

Guess an achievement from its icon. Reveal its category and then its requirement
after wrong guesses. Example: "Trick an opposing Medic into healing you" describes
Master of Disguise.

The Wiki listed 520 achievements including milestones at research time. Exclude
milestones and start with multiple-choice answers because players may know the
requirement without remembering the exact name. The icons and jokes offer
variety, though achievement names are less familiar than everyday game content.

Source: [Achievements](https://wiki.teamfortress.com/wiki/Achievements).

## 6. Kill feed

Identify the weapon, taunt, or environmental hazard from a kill-feed icon. A set
of five icons fits the short recognition loop. Include reflected projectiles and
taunt kills to expand beyond another weapon puzzle.

This uses content players regularly see in matches, but overlaps with the two
existing weapon modes. Some icons represent multiple weapons; accept all valid
answers or exclude those icons.

Source: [Kill icon](https://wiki.teamfortress.com/wiki/Kill_icon).

## 7. War Paint

Guess a War Paint from a cropped pattern. Gradually reveal the full canvas, then
the collection as a later hint. Examples include Smissmas Sweater, Miami Element,
and Spectrum Splattered.

This appeals to collectors and Cosmetic players, but introduces less variety
than the higher-ranked modes. Use a consistent reference image and wear level so
random pattern placement does not determine difficulty.

Source: [War Paint](https://wiki.teamfortress.com/wiki/War_Paint).

## 8. Mann's mystery

Identify a TF2 character, organization, or comic from increasingly clear clues.
After solving, give a short explanation and a Wiki link. Possible subjects
include Saxton Hale, Miss Pauling, the Mann family, and individual comics.

Start as a weekly puzzle. The audience is narrower and each puzzle requires
editorial work. Source each clue set to a specific article; the Wiki describes
comic continuity as loose, so avoid presenting conflicting interpretations as
unambiguous facts.

Source: [Comics](https://wiki.teamfortress.com/wiki/Comics).

## Suggested release order

Connections offers the most depth if regular curation is practical. Who said it?
is the strongest simpler release. Add animation-based Taunt after those. Revisit
the ranking using completion rates, repeat visits, and player feedback after
launching.
