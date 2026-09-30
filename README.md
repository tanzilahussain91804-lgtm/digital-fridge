# Digital Fridge

A MERN-stack food inventory & expense tracker.

## Structure
```
digital-fridge/
  backend/    Express + MongoDB API
  frontend/   React (Vite) app
```

## 1. Backend setup

```
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
MONGO_URI=mongodb://127.0.0.1:27017/digitalfridge
JWT_SECRET=replace_with_any_random_string
PORT=5000
```

Make sure MongoDB is running locally (or point MONGO_URI at Atlas), then:

```
npm run dev
```

Server runs at http://localhost:5000

## 2. Frontend setup

In a second terminal:

```
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173 (Vite's default port).

## Deployment

Before putting this online, three things need to change from local defaults —
these exist specifically so your database credentials and JWT secret can
never leak, and so your app only talks to itself:

1. **Never commit `.env`.** Both `backend/.gitignore` and
   `frontend/.gitignore` already exclude it — check `git status` before
   your first commit and confirm `.env` isn't listed as a tracked file.
2. **Frontend → backend URL.** `frontend/src/api/axios.js` now reads
   `VITE_API_URL` from the environment, falling back to
   `http://localhost:5000/api` for local dev. Set it on your hosting
   platform (or in `frontend/.env`, copied from `.env.example`) once you
   know your backend's live URL.
3. **Backend CORS.** `server.js` now reads `FRONTEND_URL` — set this on
   your hosting platform to your deployed frontend's exact URL so only
   your own app can call the API, not just anyone.

### Suggested free hosting setup

**1. Database — MongoDB Atlas** (atlas.mongodb.com)
- Create a free (M0) cluster.
- Database Access → add a user with a strong, generated password (not
  something guessable).
- Network Access → for a class project, "Allow access from anywhere"
  (0.0.0.0/0) is the usual simple option — just make sure your DB user's
  password is strong, since that password is the actual thing protecting
  your data.
- Copy the connection string — this becomes your production `MONGO_URI`.

**2. Backend — Render** (render.com)
- New Web Service → connect your GitHub repo → root directory `backend`
- Build command: `npm install` · Start command: `npm start`
- Add environment variables in Render's dashboard (never in code):
  `MONGO_URI`, `JWT_SECRET` (generate a long random string, not the
  example one), `FRONTEND_URL` (fill in after step 3), `PORT` is set
  automatically by Render.

**3. Frontend — Vercel or Netlify**
- Import your repo → root directory `frontend`
- Build command: `npm run build` · Output directory: `dist`
- Add environment variable `VITE_API_URL` = your Render backend URL + `/api`
- Once deployed, copy this frontend URL back into Render's `FRONTEND_URL`
  variable and redeploy the backend so CORS allows it.

### What to tell your professor / keep in mind

- Each user's data is private to their own account (enforced by JWT on
  every route) — someone else visiting the link can register their own
  account but can never see another user's inventory or expenses.
- Anyone with the link can create an account, since this is a public demo
  link with no invite system — normal for a class project, just don't be
  surprised if test accounts pile up.
- Use a throwaway email/password when demoing yourself — there's no
  reason to put a real personal password into a project database.

## 3. Using the app

1. Go to http://localhost:5173/register and create an account.
2. You're redirected to the Dashboard.
3. Add food items (Inventory → + Add Food) — choose Packaged or Fresh.
4. For packaged items, you can upload an image and click "Detect Expiry from
   Image" — right now this returns "not yet connected" and asks you to
   enter the date manually. It's a deliberate placeholder for a future
   upgrade: the route lives in `backend/routes/food.js` (`/detect-expiry`),
   isolated so real detection can be dropped in later without touching
   anything else in the app.
5. Add expenses under Expenses — the Dashboard chart updates automatically.
6. Manage a shopping list under Shopping List.

## Design

The UI uses a small custom design system rather than a component library:
- **Colors**: forest green primary (`#3E7C5C`), deep green sidebar (`#22402F`), warm paper background (`#F6F5F0`), amber for "expiring soon", paprika red for "expired" — all defined as CSS variables at the top of `frontend/src/App.css`
- **Type**: Fraunces (serif, for headings/numbers) + Inter (sans, for UI/body), loaded via Google Fonts in `index.html`
- **Layout**: fixed left sidebar (`components/Sidebar.jsx`) with icon nav (lucide-react), collapsing to a horizontal bar on mobile
- Stat numbers use a colored left-border accent instead of identical shadowed cards, so emphasis stays on the numbers themselves
- Every page reuses `components/PageHeader.jsx` and, where relevant, `components/StatStrip.jsx` for consistency

Every screen (Dashboard, Inventory, Expenses, Shopping List) is a real, working feature — no placeholder screens for things like recipes or reports were added.

## What's intentionally simplified vs. the original brief

- Images are stored as base64 directly in MongoDB (no Cloudinary) — same
  concept, fewer moving parts.
- No Tailwind — plain CSS in `frontend/src/App.css`, easy to read/edit.
- AI expiry detection is a placeholder for now (see above) — everything
  else in the app is fully functional today, not mocked.

## Build order this matches (from your syllabus)

1. Auth (JWT + bcrypt) — `backend/routes/auth.js`, `middleware/auth.js`
2. Food inventory CRUD — `backend/routes/food.js`, `frontend/src/pages/Inventory.jsx`, `AddFood.jsx`
3. Expiry status logic — computed in `Inventory.jsx`
4. Expenses CRUD + monthly aggregation + chart — `backend/routes/expenses.js`, `Dashboard.jsx`, `Expenses.jsx`
5. Shopping list CRUD — `backend/routes/shopping.js`, `ShoppingList.jsx`
6. AI route — `/detect-expiry` is a placeholder for now, ready to connect later
