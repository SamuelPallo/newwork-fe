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
- Node.js (v18+ recommended)
- npm (v9+ recommended)

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
