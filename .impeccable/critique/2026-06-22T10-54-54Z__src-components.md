---
target: src/components
total_score: 20
p0_count: 0
p1_count: 2
timestamp: 2026-06-22T10-54-54Z
slug: src-components
---
#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good notifications, but some async actions lack clear loading states. |
| 2 | Match System / Real World | 2 | Cyberpunk theme is fun but leans heavy into jargon ("Transmission", "Protocol"). |
| 3 | User Control and Freedom | 3 | Navigation is clear, escape paths from modals are present. |
| 4 | Consistency and Standards | 2 | Minigames have inconsistent styling (gradients, side-borders) compared to the dashboard. |
| 5 | Error Prevention | 2 | Basic form validation exists, but destructive actions could use better guardrails. |
| 6 | Recognition Rather Than Recall | 3 | Icons and labels are generally clear. |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts detected for power users. |
| 8 | Aesthetic and Minimalist Design | 1 | Overwhelming visual noise: too many glows, gradient text, and heavy borders. |
| 9 | Error Recovery | 2 | Error messages exist but can be abrupt. |
| 10 | Help and Documentation | 1 | Lack of contextual onboarding for complex features. |
| **Total** | | **20/40** | **Acceptable** |

#### Anti-Patterns Verdict

**LLM assessment**: The interface screams "AI generated" due to the excessive use of gradient text on headings, thick side-tab borders on cards, and tacky bounce animations. While the Cyberpunk theme is ambitious, the execution relies too heavily on overlapping glows and borders, creating a high visual noise floor.

**Deterministic scan**: The detector found 12 specific issues across 7 files:
- 4 instances of "Gradient text" (`Homework.jsx`, `BattleshipGame.jsx`, `ConnectFourGame.jsx`, `TicTacToe.jsx`)
- 4 instances of "Side-tab accent border" (`Curriculum.jsx`, `ConnectFourGame.jsx`)
- 2 instances of "Bounce or elastic easing" (`Homework.jsx`, `ShootEmUp.jsx`)
- 1 instance of "Gray text on colored background" (`BlockBlastGame.jsx`)
- 1 instance of "Border accent on rounded element" (`ConnectFourGame.jsx`)

**Visual overlays**: No reliable user-visible overlay is available (CLI scan used as fallback).

#### Overall Impression
The ambition of the Cyberpunk theme is commendable, but it's currently drowning in visual clutter and textbook AI tells. Simplifying the typography and removing the cheap tricks (gradients, bounce animations) will instantly elevate the professionalism of the app.

#### What's Working
- **Cohesive Palette**: The recent standardization of the `#08050f` background and neon accents (`#99eedd`, `#d966ff`) provides a solid foundation.
- **Component Structure**: The dashboard layout and sidebar navigation are well-organized and responsive.

#### Priority Issues
- **[P1] Visual Noise & Gradient Text**: Headings use `bg-clip-text` with gradients, which looks cheap and is a massive AI tell.
  - **Why it matters**: It undermines the premium Cyberpunk aesthetic, making it look like a template.
  - **Fix**: Replace all gradient text with solid neon colors (e.g., `#d966ff` or `#99eedd`).
  - **Suggested command**: `$impeccable quieter`
- **[P1] AI Structural Tells (Side Borders & Bounce)**: Thick `border-l-4` side-tabs and `animate-bounce` are littered across components.
  - **Why it matters**: These patterns immediately signal lazy AI generation and distract from the content.
  - **Fix**: Remove side-tab borders entirely and replace bounce easing with smooth exponential transitions.
  - **Suggested command**: `$impeccable shape`
- **[P2] Contrast Violations**: Gray text on a colored background (`bg-red-600`) in BlockBlast.
  - **Why it matters**: Fails accessibility standards and is hard to read.
  - **Fix**: Change text to white or a very light shade of the background color.
  - **Suggested command**: `$impeccable colorize`
- **[P2] Lack of Keyboard Accelerators**: The app requires heavy mouse interaction.
  - **Why it matters**: Power users (Seniors/Admins) will find repetitive tasks frustrating.
  - **Fix**: Add basic keyboard shortcuts (e.g., `Esc` to close modals, `Enter` to submit).
  - **Suggested command**: `$impeccable harden`

#### Persona Red Flags

**Alex (Power User)**:
- No keyboard shortcuts for navigating the dashboard or closing modals.
- Forced to click through multiple screens for repetitive tasks like grading or messaging.

**Jordan (First-Timer)**:
- Overwhelmed by the jargon ("Transmission", "Protocol").
- High cognitive load from overlapping glowing borders; doesn't know where to look first.

#### Minor Observations
- The "SystemAlert" component has a nice design but the bounce animation on entrance might feel a bit unpolished compared to a spring.

#### Questions to Consider
- Does every panel need a glowing border, or could we reserve glows strictly for interactive/active states?
- Would solid, crisp typography communicate the Cyberpunk theme better than gradients?
