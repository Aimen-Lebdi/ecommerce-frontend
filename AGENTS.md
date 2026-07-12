# AGENTS.md — Workspace agent guidance

Purpose
- Short, canonical instructions for AI coding agents working on this repository. Link-first: more details live in the project's README.

Quick Start (for agents)
- Install: run `npm install`.
- Dev: run `npm run dev` to start Vite.
- Build: run `npm run build`.
- Lint: run `npm run lint`.

What this project is
- Vite + React + TypeScript frontend (see [package.json](package.json)).
- Uses Redux Toolkit (`src/features/*`), React Router, Tailwind, and Socket.io client.

Key places to inspect
- Project root: [package.json](package.json) — scripts and deps.
- Vite config: [vite.config.ts](vite.config.ts)
- TypeScript config: [tsconfig.json](tsconfig.json)
- Source: [src/](src/) — main application code.
- Features (RTK slices/apis): [src/features/](src/features/)
- UI primitives: [src/components/ui/](src/components/ui/)
- Routes and pages: [src/routes/](src/routes/) and [src/pages/](src/pages/)
- API clients: [src/utils/axiosInstance.ts](src/utils/axiosInstance.ts) and `*API.ts` files under features.
- i18n: [src/i18n/index.ts](src/i18n/index.ts) and [src/locales/](src/locales/)
- Socket helpers: [src/socket/](src/socket/)

Conventions and tips for agents
- Feature files: API files are named `*API.ts` and state slices `*Slice.ts` inside `src/features/`.
- Keep UI primitives in `src/components/ui/` and page-specific components under `src/components/client/` or `src/components/admin/`.
- Prefer small, focused PRs that change one feature or UI area.
- Follow the project's ESLint rules (`eslint.config.js`) before committing.
- Do not commit secrets or environment values.

Testing & CI
- Unit tests: `vitest` + `@testing-library/react` (see `devDependencies` in [package.json](package.json)).
- End-to-end tests: repository includes `cypress` as a devDependency.

If anything here is unclear, ask for details before making behavioral changes.

