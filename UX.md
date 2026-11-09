# UX principles in Champ

Where each principle shows up in the app, so new screens can follow the same rules.

## Nielsen's usability heuristics

| Heuristic | In Champ |
|---|---|
| Visibility of system status | "Now speaking" bar on every screen; listening bars and "thinking" dots in the live lesson; streak, XP and flask level always visible; Voice & AI card shows exactly which voice and AI are active. |
| Match with the real world | Teachers talk like people, lessons are stories (a foggy hill, not "gradient descent"), daily goal is a flask that fills. |
| User control and freedom | Stop button and Esc interrupt any teacher instantly; mute switch; Undo after changing teacher; back on every onboarding step; sheets close by swipe, tap outside or Esc. |
| Consistency and standards | One button system (primary, soft, ghost, danger), one card style, one bottom-sheet pattern, standard iOS-style tab bar. |
| Error prevention | Destructive "Restart onboarding" asks first and names exactly what will be lost; API keys are checked before they are saved. |
| Recognition over recall | Suggestion chips in the live lesson; badges show progress toward the goal; laureate cards show prize and discovery up front. |
| Flexibility and efficiency | Talk, type, or hands-free mode; keyboard shortcuts (Esc); `?step=` deep links for testing. |
| Aesthetic and minimal design | One primary action per screen; secondary info in sheets. |
| Help users recover from errors | Mic blocked → automatic switch to typing; voice service down → browser voice; AI down → practice replies. Plain-language error messages. |
| Help and documentation | First-time coach mark ("Tap to stop me anytime"); every setting explains what it does in one line. |

## Laws of UX

- **Fitts's law**: big primary buttons at the bottom within thumb reach; the mic is the largest target in the lesson; icon buttons, Stop and mute are at least 44 × 44 px.
- **Hick's law**: onboarding asks one question per screen; the tab bar has five items.
- **Jakob's law**: tab bar, bottom sheets, toasts and switches behave like the iOS and Android apps people already use.
- **Doherty threshold (under 400 ms)**: every tap gets instant motion feedback; the teacher shows "thinking" at once; the next sentence's audio is fetched while the current one plays.
- **Goal-gradient & Zeigarnik effects**: flask fills toward the daily goal; badge progress bars; the next lesson is always one tap away.
- **Peak-end rule**: confetti at the daily goal, lesson end and every badge unlock (the badge is also announced out loud).
- **Von Restorff effect**: the Ask button is raised and coloured in the tab bar; the Stop button is the only white element in the dark speaking bar.
- **Aesthetic-usability effect**: hand-drawn characters and springy motion make the app feel friendly and forgiving.

## Accessibility

- Captions for everything a teacher says (and captions-only when muted).
- `aria-live` on captions, status and toasts so screen readers announce them; dialogs use `role="dialog"`/`alertdialog`.
- Visible keyboard focus ring (`:focus-visible`), Esc closes dialogs and stops speech.
- Honours the system "Reduce motion" setting (Framer Motion `reducedMotion="user"` plus CSS).
- Not yet audited: colour contrast of every muted label against WCAG AA, and full screen-reader passes on each screen.
