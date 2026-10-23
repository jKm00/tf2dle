---
name: ux-designer
description: >
  UX principles for building polished user-facing frontend work — pages, components,
  forms, flows, dialogs, lists. Use this skill whenever you create or modify anything
  a user will see or interact with, or when the user asks to make something feel
  polished, add loading/empty/error states, build or fix a form, handle a destructive
  action, reduce cognitive load, or improve accessibility. These are UX principles,
  not visual design guidelines: they apply to every design system, style and brand.
---

# UX Designer

Polish is the sum of small things. Every point below holds regardless of visual style — apply them all.

## Consistency

Many points below leave a choice open — how required fields are marked, how errors are worded, which actions get undo, how long a transition runs. Whenever there's a choice, check what the app already does and follow it. Only decide fresh when there is no precedent, then apply that decision everywhere. Users learn a pattern once; two reasonable conventions side by side are worse than either one applied consistently.

## Cognitive load

- **Meet existing expectations** (Jakob's Law). Users spend most of their time in other apps and arrive expecting yours to behave the same way. Put familiar things where they're already looked for, per device — a cart sits top-right on web and within thumb reach on mobile. Core flows like cart and checkout get zero friction and zero surprises; spend originality on the parts that aren't load-bearing.
- **Fewer choices at a time** (Hick's Law). Decision time grows with the number and complexity of options. Group and sequence them rather than presenting everything at once — the goal is fewer choices per step, not fewer capabilities.
- **Progressive disclosure**. Show what's needed right now and keep the rest one step away. Caveat: never bury a primary action so deep it needs a tutorial to find.
- **Absorb the complexity** (Tesler's Law). Complexity doesn't disappear, it only moves. Every burden the system can carry — sensible defaults, inference, doing the tedious step for them — is one the user doesn't.

## States

Every screen has four: **success**, **loading**, **empty** and **error**. Success always gets built; the other three are where polish is won or lost.

### Loading

Show a skeleton that mirrors the layout of the real content.

> **Note**: A skeleton out of sync is worse than no skeleton — it shifts the layout on load. Match the final layout exactly.

- Delay the skeleton by a beat so fast responses never show one. A skeleton that appears and vanishes inside a second makes the app feel slower than no skeleton at all.
- Never hold a screen hostage to its slowest request. Render each section as its data arrives, keeping indicators only on what's still pending.
- For actions rather than page loads, put the feedback on the trigger: disable it, show inline progress, make double-submission impossible.

### Empty

- **No content yet** — the first thing most users see, so it matters most. Say what will appear here and give one clear call to action. E.g. a projects page with none created: "No projects yet" + "Create your first project". Where getting started genuinely takes several steps, a short wizard beats a lone button.
- **Happy empty** — empty is the desired state. Make it feel earned; this is the one place a little delight is justified. E.g. "Inbox all clear. Time for a coffee break", with an illustration or animation worth arriving at.

### Error

- Answer three things: what happened, why, and what the user can do about it.
- Never render backend, database or stack-trace detail in production. Behind a dev flag, fine.
- Scope the error to what actually failed. One dead section must not blank a page whose other data loaded fine — degrade gracefully around it.
- Failed loads get a retry; failed actions keep the user's input.

## Feedback

Every interaction gets a visible response immediately, even when the result takes longer.

**Success**: match the weight of the action. Finishing a signup or a purchase can carry a full success screen and some celebration; completing a todo should strike it through and fade it out of the list, nothing more. Where the outcome is self-evident — landing on the project you just created — that _is_ the feedback, so don't stack a toast on top of it. The one unacceptable option is nothing at all, leaving the user asking "did that go through?"

**Failure**: always explicit, and shown next to the thing that failed — the form, the row, the button that was clicked. A toast alone is too easy to miss and disconnects the error from its cause.

**Optimistic updates**: where an action nearly always succeeds and is cheap to reverse — toggling a favourite, checking off a task, reordering a list — apply the change instantly and reconcile in the background. Skip it when failure is likely or a silent rollback would confuse the user, and always surface the revert if one happens.

## Animations & transitions

Subtle enough to go unnoticed — the user should only feel their absence, as a vague sense that something is missing. An animation you clearly notice is too much. Keep them short, ease-out, and on cheap properties (transform/opacity). Respect `prefers-reduced-motion`.

## Forms

- Break long forms into logical groups or steps rather than one flat wall of equally-weighted fields. Grouping shows how much is left and turns one intimidating task into several small ones.
- Mark required vs optional explicitly — `*` on required or `(optional)` on optional, never both: mixing them makes an unmarked field ambiguous.
- Hold submit until every required field is filled, and make what's missing visible on the page. A disabled button with no explanation is its own dead end.
- Validate on the client for fast feedback. Validate on blur, not on every keystroke.
- Show strict requirements (password rules, formats, limits) up front instead of letting the user guess and fail.
- On submit, highlight every invalid field with its message beside it. On long forms, scroll to and focus the first invalid one.
- Write validation messages for the end user, not for debugging.
- **Never clear the form.** Preserve what the user typed through validation errors, failed submits and back-navigation. Retyping everything is the most punishing thing a form can do.
- Label every input (a placeholder is not a label). Use correct input types and `autocomplete` so mobile keyboards and password managers work.

## Destructive actions

- Confirm before destroying.
- Label the specific action, never the abstraction: "Delete this project?" with "Delete project" / "Keep project" — not "Are you sure? Yes/No".
- Where the action is cheap to reverse, prefer a short-lived undo over a confirmation dialog. Judge per case; not every action needs it.

## Accessibility

- Everything reachable and operable by keyboard alone, in a logical tab order — for assistive tech and power users alike.
- Visible focus indicator on every interactive element. Never remove the outline without replacing it.
- Dialogs and modals: trap focus, close on Escape, return focus to the trigger.
- Give icon-only controls accessible names.
- Never rely on colour alone to carry meaning.
