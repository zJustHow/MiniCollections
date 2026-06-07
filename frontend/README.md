# Mini Collections Frontend

React SPA built with [Vite](https://vite.dev/).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` / `npm run dev` | Dev server at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build → `build/` |
| `npm run build:backend` | Build and copy into `backend/src/main/resources/public/` for single-port deploy |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Development

From the repo root, `./dev.sh` starts Docker services, the Spring Boot backend (`:8080`), and the Vite dev server (`:3000`).

API requests from the browser are proxied to the backend (same behavior as the old CRA `setupProxy.js`):

- `fetch('/brands')` → backend
- Browser navigation to `/brands` → React Router

Ensure the backend is running on port 8080 when developing the frontend.
