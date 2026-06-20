# AI Agent Guidelines for "Technology 8th Gen" Workspace

Whenever you are working in this workspace, you **MUST** strictly follow the guidelines below:

1. **Read the Context**: If you need deep context about the project structure, please refer to the `context.md` file in the root of the workspace.
2. **Tech Stack Constraints**: 
   - Use **React**, **Tailwind CSS**, and **Framer Motion** (`animate.css` is strictly forbidden).
   - Use **Supabase** for database and auth.
   - Use **HTML5 Canvas** (`useRef` + `requestAnimationFrame`) for game logic.
3. **Aesthetics (CRITICAL)**: 
   - This is a Sci-Fi/Cyberpunk themed app. **DO NOT** create boring, standard corporate UI. 
   - Use dark backgrounds (e.g. `#060412`) and neon glowing accents (`#7ecfff`, `#ffe066`, `#d966ff`).
   - Every interactive element must have a micro-animation (e.g., hover scale, glowing shadows).
4. **Performance Rules**: 
   - Enforce **Code Splitting**: All new heavy components or routes must be loaded via `React.lazy()` and `<Suspense>`.
   - **Canvas Optimization**: Do not use `useState` inside a 60FPS Canvas loop; use `useRef` to bypass React's render cycle for game logic.
