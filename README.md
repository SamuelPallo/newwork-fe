
# newwork-fe

## Quick Start

**Local development:**
```powershell
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Docker:**
```powershell
docker build -t newwork-fe .
# If you start the backend in Docker, run both containers with --network <network-name> (e.g. newwork)
# Example: docker run -p 3000:3000 --network newwork newwork-fe
# If you connect to a backend running locally, just run:
docker run -p 3000:3000 newwork-fe
```
Open [http://localhost:3000](http://localhost:3000)

## Architecture Notes

- **React 18 + Vite + TypeScript** for fast, modern SPA development
- **Chakra UI + Tailwind CSS** for accessible, responsive design
- **React Router v6** for route-based navigation
- **TanStack React Query** for server state and optimistic updates
- **Zustand** for lightweight local state (auth, role)
- **React Hook Form** for robust form handling
- **JWT authentication** with role-aware UI and protected routes
- **API calls** are abstracted in `/src/api` and use JWT for security
- **Role-based UI:** Employees, managers, and admins see different features and data
- **Feedback, absence, and user management** flows are separated by role and permissions
- **Mobile responsive and accessible** by design

## Backend Connection

API requests are routed as follows:
- **Docker:** Frontend uses `http://newwork-backend:8081` for API calls (if backend is running in Docker on the same `newwork` network)
- **Local development:** Frontend uses `http://localhost:8081` for API calls
If you run the backend in Docker, ensure it is started with the network name `newwork` and container name `newwork-backend`. Both containers must be on the same network for connectivity.

## Improvements with More Time

- Add full test coverage (unit, integration, e2e)
- Refine error handling and loading states across all pages
- Add more granular role/permission management
- Improve accessibility (ARIA, keyboard navigation)
- Add user onboarding and help features
- Refactor for even more reusable components and hooks
- Add CI/CD pipeline and production deployment scripts
- Add internationalization (i18n)
- Optimize bundle size and performance

## Troubleshooting

- If you see blank pages after login, check backend connection and JWT validity
- For CORS issues, ensure your backend allows requests from the frontend origin
- If you change backend endpoints, update the proxy and API paths in the frontend code

---

For details, see code comments and folder structure. Contributions and suggestions welcome!
