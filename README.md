# newwork-fe

## Frontend Architecture

- **Framework:** React 18 + TypeScript
- **Bundler:** Vite
- **Routing:** React Router v6
- **Server State:** TanStack React Query
- **Local State:** Zustand (lightweight)
- **Forms:** React Hook Form
- **UI:** Tailwind CSS + Chakra UI
- **Authentication:** JWT (in-memory or httpOnly cookie)
- **Role-aware UI:** Hide/show fields based on user role
- **Accessibility:** Mobile responsive, accessible

## Folder Structure

```
src/
  api/        # API call wrappers
  components/ # Reusable UI components
  pages/      # Route-based pages
  hooks/      # Custom hooks (useAuth, useUser, useFeedback)
  services/   # Token service, integrations
  styles/     # Tailwind and custom styles
  utils/      # Utility functions
```

## Key Components
- ProfileCard
- ProfileEditor
- FeedbackComposer (with AI button)
- FeedbackList
- AbsenceForm
- AbsenceList
- TeamDirectory

## Getting Started

### Prerequisites


### Backend Connection

This frontend expects a backend API (Spring Boot, Node, etc.) running locally or remotely. By default, API requests to `/api` are proxied to `http://localhost:8080` using Vite's dev server proxy.

**To change the backend URL:**
Edit `vite.config.ts`:
```ts
// vite.config.ts
server: {
  proxy: {
   '/api': 'http://localhost:8081', // Change to your backend URL
  },
},
```

**Environment variables:**
Create a `.env` file to override Vite defaults if needed:
```
VITE_API_URL=http://localhost:8081
```

**Troubleshooting:**
- If you see blank pages after login, check backend connection and JWT validity.
- For CORS issues, ensure your backend allows requests from the frontend origin.
- If you change backend endpoints, update the proxy and API paths in the frontend code.

### Setup
1. **Install dependencies:**
   ```powershell
   npm install
   ```
2. **Start development server:**
   ```powershell
   npm run dev
   ```
3. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Running with Docker

You can run the frontend in a Docker container (no Node/npm required on host):

1. **Build the Docker image:**
   ```powershell
   docker build -t newwork-fe .
   ```
2. **Run the container:**
   ```powershell
   docker run -p 3000:3000 newwork-fe
   ```
3. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## Quick Start for Newcomers

You can start the UI in two ways:

### 1. With npm (local dev)
```powershell
npm install
npm run dev
```
Then visit [http://localhost:3000](http://localhost:3000)

### 2. With Docker (no local Node/npm needed)
```powershell
docker build -t newwork-fe .
docker run -p 3000:3000 newwork-fe
```
Then visit [http://localhost:3000](http://localhost:3000)

---

### Recommended VS Code Extensions
- Tailwind CSS IntelliSense
- Chakra UI VS Code
- ES7+ React/Redux/React-Native snippets

### Project Scripts
- `npm run dev` — Start local dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

### Notes
- Authentication is handled via JWT in memory or httpOnly cookie. Use `Authorization: Bearer <token>` for API calls.
- Role-aware UI: Sensitive fields/actions are hidden for non-managers.
- Optimistic updates: Feedback is added before server confirmation (React Query).
- Inline editing, confirm dialogs, and accessibility are prioritized.

---

For more details, see code comments and folder structure. Replace placeholder components with real implementations as needed.
