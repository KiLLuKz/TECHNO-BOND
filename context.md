# 🚀 Technology 8th Gen - Project Context

Welcome to the **Technology 8th Gen** repository. This document serves as the primary context guide for developers and AI agents working on this project. It outlines the technology stack, project structure, and strict coding guidelines that MUST be followed to maintain the project's premium quality and high performance.

## 🛠️ 1. Tech Stack
- **Framework**: React + Vite (Single Page Application)
- **Styling**: Tailwind CSS (Utility-first, no inline styles unless absolutely necessary for dynamic math)
- **Animations**: Framer Motion (Strictly used for all enter/exit and interaction animations. *Note: `animate.css` was intentionally removed to reduce bloat.*)
- **Backend/Database**: Supabase (Used for Authentication, Role Management, and Leaderboards)
- **Routing**: `react-router-dom` (Configured with `React.lazy` and `Suspense` for code splitting)
- **Game Engine**: Native HTML5 Canvas + `requestAnimationFrame` (Used for high-performance mini-games like Shoot'em Up)

---

## 🎨 2. Design & UI/UX Guidelines (Strict)
This project is NOT a standard, boring corporate site. It is a highly interactive, Sci-Fi/Cyberpunk themed web application. 
**Failure to maintain a "Premium and Dynamic" feel is unacceptable.**

- **Color Palette**: 
  - Background: Deep Void (`#060412`)
  - Primary Accents: Neon Cyan (`#7ecfff` / `#4ECDC4`), Neon Gold (`#ffe066`), and Deep Purple (`#d966ff` / `#4f2ec3`).
  - *Rule*: Never use generic browser colors (plain red, blue, green). Always use glowing, harmonious colors with drop shadows to create a "Neon" effect.
- **Typography**: `Orbitron` for headings and sci-fi elements. `Rajdhani` or `Inter` for highly readable body text.
- **Micro-animations**: Every button, modal, and page transition must feel alive. Use `framer-motion` to add hover effects (`whileHover={{ scale: 1.05 }}`) and smooth mount/unmount transitions (`AnimatePresence`).

---

## ⚡ 3. Performance & Architecture Guidelines
- **Code Splitting (Lazy Loading)**: Any new Dashboard screen or Minigame MUST be imported using `React.lazy()` in `App.jsx`. Do not add heavy imports to the initial bundle.
- **Canvas Game Optimization**: 
  - Never use React `useState` inside a 60FPS `requestAnimationFrame` loop unless updating the HUD. 
  - Use `useRef` to hold the game state (`gameState.current`) to prevent React from re-rendering the DOM on every frame.
  - Always support dynamic screen scaling (`devicePixelRatio` and responsive Virtual Height calculation) so games look perfect on both Mobile and 4K monitors.
- **Clean Code**: Keep components modular. If a component grows too large, extract its sub-components. Do not install new `npm` libraries without checking if the functionality can be built natively.

---

## 📂 4. Project Structure (High-Level)
```text
src/
 ├── components/
 │    ├── MiniGames/            # Canvas games (ShootEmUp, BlockBlast, ConnectFour, etc.)
 │    ├── Welcome.jsx           # Landing page (Static import for fast initial load)
 │    ├── Verify.jsx            # Authentication page
 │    ├── J_Dashboard.jsx       # Junior Role Dashboard
 │    ├── S_Dashboard.jsx       # Senior Role Dashboard
 │    └── AdminDashboard.jsx    # Admin Dashboard
 ├── App.jsx                    # Main Router & Suspense Boundary
 ├── supabaseClient.js          # Supabase connection
 ├── index.css                  # Global Tailwind imports
 └── main.jsx                   # React entry point
```

> **To any AI Assistant reading this:** 
> When asked to create a new feature, refer to this `context.md` first. Ensure your UI looks lumnious and futuristic, and ensure your React code is highly optimized.
