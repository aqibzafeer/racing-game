# Road Club

A React + Vite driving game with procedural Three.js vehicles, selectable roads and weather, landscape mobile controls, and free ride, race, and open-roam modes.

## Run locally

Requires Node.js 20.19+ or 22.12+ (use a supported LTS release).

    npm install
    npm run dev

Open the local URL printed by Vite. The game now runs through Vite; opening index.html directly is not supported.

## Production

    npm run build
    npm run preview

Deploy the generated dist/ directory to any static web host. All models and textures are procedural; no remote model downloads are required.

## Checks

    npm test
    npm run format:check

The browser tests cover lobby navigation, paint and vehicle changes, driving distance, pause/resume, and mobile landscape behavior. Tests use installed Microsoft Edge on Windows. On other platforms, run npx playwright install chromium once before testing.

## Project structure

- src/App.jsx: React application and game lifecycle.
- src/components/: JSX lobby, driving HUD, stage, and dialogs.
- src/game/startGame.js: driving simulation, navigation, input, audio, and renderer.
- src/game/: procedural vehicle, world, and weather modules.
- src/styles/: game styles and responsive overrides.
- tests/game.spec.js: browser regression checks.
- legacy/: unchanged backup of the original standalone game.

React owns the interface structure and engine lifetime. The engine updates the canvas and high-frequency HUD values directly to avoid rerendering the React tree every animation frame. It releases listeners, animation frames, audio, and rendering resources on unmount. React Strict Mode is enabled in development.

React 19.3.0, React DOM 19.3.0, Vite 8.3.0, and the React plugin 6.1.1 were selected from npm's stable latest tags during migration. Three.js remains at 0.169.0 to preserve the existing game's rendering behavior. Exact package versions are recorded in package-lock.json.
"# racing-game" 
