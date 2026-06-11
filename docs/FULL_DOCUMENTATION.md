# Full Documentation — Career-Code Job Portal Client

## 1. Introduction
Career-Code Job Portal Client is a role-based frontend application for a job portal platform.  
It supports end-to-end flows for candidates, recruiters, and administrators using a modern React + TypeScript stack.

## 2. Objectives
- Provide an intuitive job search and application experience
- Enable recruiters to manage job postings and applicants efficiently
- Offer administrative visibility and moderation capabilities
- Keep the codebase maintainable through typed and modular architecture

## 3. System Scope
This repository contains the client-side application only.  
Backend APIs are consumed through configured service modules.

Backend reference: `https://github.com/Arifulit/job-portal-server`

## 4. Core Functional Modules

### 4.1 Authentication and Authorization
- Login and registration for multiple roles
- Persistent authentication state
- Role-based route protection
- Role-scoped dashboards and navigation

### 4.2 Candidate Module
- Browse and filter jobs
- View job details
- Submit job applications
- Track application status progression
- Manage profile-related screens

### 4.3 Recruiter Module
- Create job posts
- Edit and manage active posts
- Review candidate applications
- Update candidate progression in hiring pipeline

### 4.4 Admin Module
- Access platform-level dashboards
- Monitor users and activity
- Support moderation and oversight workflows

## 5. Technical Stack
- **Framework:** React 18
- **Language:** TypeScript 5
- **Bundler/Dev Server:** Vite
- **Routing:** React Router DOM
- **Server State:** TanStack Query
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **UI/UX Utilities:** Framer Motion, Radix UI, Lucide, Sonner

## 6. Project Structure
```text
src/
  components/      Shared and feature UI components
  context/         Global context providers (auth/theme)
  hooks/           Reusable custom hooks
  lib/             Shared utilities and helpers
  pages/           Route-level pages grouped by role/feature
  routes/          Router configuration and route metadata
  services/        API request logic and query hooks
  types/           Shared TypeScript type definitions
  utils/           Generic app utilities
```

## 7. Environment Configuration
The client uses runtime environment variables through Vite.

### Required
- `VITE_API_URL`: Base URL for backend API requests

## 8. Local Setup
1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Start development server

```bash
npm install
npm run dev
```

## 9. Available NPM Scripts
- `npm run dev` — start local development server
- `npm run build` — create production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint checks
- `npm run typecheck` — run TypeScript checks (`tsc --noEmit`)

## 10. API Integration Approach
- Centralized API access through `src/services`
- Request/response handling with Axios
- Async state management with TanStack Query
- Cache invalidation patterns for responsive UI

## 11. Routing Strategy
- Public and protected routes are separated
- Role-based access is enforced by route guards/wrappers
- Dashboard and functional pages are grouped by user role

## 12. UI and State Patterns
- Reusable components in `components/ui`
- Feature and role-specific screens in `pages/*`
- Context for cross-cutting state
- Query hooks for remote state

## 13. Build and Deployment

### Build
```bash
npm run build
```

### Deployment
- `vercel.json` is included for Vercel deployment support
- Configure runtime environment variables in hosting dashboard

## 14. Quality and Validation
Recommended validation sequence before release:
```bash
npm run typecheck
npm run lint
npm run build
```

## 15. Troubleshooting

### Cannot connect to backend
- Confirm `VITE_API_URL`
- Verify backend server status
- Check backend CORS configuration

### Type or lint errors
- Reinstall dependencies
- Run `npm run typecheck` and `npm run lint` separately for diagnosis

### Blank page after deployment
- Verify deployed environment variables
- Confirm SPA route fallback/rewrites are configured correctly

## 16. Security and Reliability Notes
- Do not hardcode credentials in frontend code
- Keep role checks consistent across protected routes
- Validate form inputs with schema-based validation
- Handle API errors gracefully to avoid broken user flows

## 17. Maintenance Guidelines
- Keep service layer changes typed and centralized
- Prefer reusable UI primitives over ad-hoc component duplication
- Maintain role-based separation in pages and navigation
- Update documentation whenever introducing new features or flows

