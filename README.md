# Career-Code Job Portal Client

A modern role-based job portal frontend built with React, TypeScript, and Vite. The application supports complete workflows for candidates, recruiters, and administrators, including authentication, job discovery, job posting, application management, and admin oversight.

## Table of Contents

1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Tech Stack](#tech-stack)
4. [Architecture and Folder Structure](#architecture-and-folder-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Authentication and Authorization](#authentication-and-authorization)
9. [API Integration](#api-integration)
10. [Deployment](#deployment)
11. [Quality and Maintenance](#quality-and-maintenance)
12. [Troubleshooting](#troubleshooting)
13. [Backend Reference](#backend-reference)
14. [Contributing](#contributing)
15. [License](#license)

## Overview

Career-Code is a production-focused frontend for a job portal platform with three major user roles:

- Candidate: browse jobs, apply with resume, track progress, manage profile
- Recruiter: post jobs, review applicants, manage hiring pipeline
- Admin: manage users, moderate platform data, monitor system-level activity

The project is optimized for maintainability with TypeScript typing, component-based design, API service abstraction, and query-based data fetching.

## Core Features

### Candidate Experience

- Explore jobs with search and filtering
- View detailed job pages
- Apply to jobs with resume upload and cover letter
- Track application status lifecycle
- Save and manage preferred jobs
- Access candidate dashboard and profile pages

### Recruiter Experience

- Create and manage job posts
- Review candidate applications
- Update application statuses (shortlist/interview/hired/rejected)
- View recruiter-specific dashboard insights

### Admin Experience

- Monitor user activity by role
- Access user management and moderation tools
- View high-level platform metrics and analytics pages

## Tech Stack

- Framework: React 18
- Language: TypeScript 5
- Build Tool: Vite 5
- Routing: React Router DOM 7
- Data Fetching/Cache: TanStack Query 5
- Styling: Tailwind CSS 3
- Forms and Validation: React Hook Form, Zod
- HTTP Client: Axios
- Animation: Framer Motion
- UI Utilities: Radix UI primitives, Lucide icons, Sonner toasts

## Architecture and Folder Structure

```text
src/
	components/        Reusable UI and layout components
		auth/            Authentication-related components
		config/          Runtime configuration helpers
		layout/          Main layout, navbar, dashboard layout
		providers/       Theme/providers wiring
		theme/           Theme control and previews
		ui/              Shared UI primitives
	context/           React context (auth/theme)
	hooks/             Reusable hooks
	lib/               Shared library utilities
	pages/             Route-level pages grouped by feature/role
		admin/
		Application/
		Candidate/
		Job/
		Recruiter/
		status/
		public/
	routes/            Route definitions and sidebar route items
	services/          API integration and TanStack Query hooks
	types/             Global TypeScript types
	utils/             Generic utilities and helpers
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- Running backend API server

### Installation

1. Clone the repository.

```bash
git clone <your-repository-url>
cd job-portal-client
```

2. Install dependencies.

```bash
npm install
```

3. Create a local environment file.

```bash
cp .env.example .env
```

If `cp` is unavailable on Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

4. Set environment variables (see section below).

5. Run the app.

```bash
npm run dev
```

Default local URL: `http://localhost:5173`

## Environment Variables

The client currently uses `VITE_API_BASE_URL` in runtime code.

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Optional variables can be added if your deployment/build setup requires them, but only include variables that are actively used in the client code.

## Available Scripts

- `npm run dev`: start local development server
- `npm run build`: build optimized production bundle
- `npm run preview`: preview the production build locally
- `npm run lint`: run ESLint checks
- `npm run typecheck`: run TypeScript type checks (`tsc --noEmit`)

## Authentication and Authorization

Authentication is token-based and managed through context and API utilities.

- Login and registration flows for multiple roles
- Persistent auth state using local storage
- Protected route handling by role
- Role-based dashboard and page access

Current role naming convention in the client:

- `candidate`
- `recruiter`
- `admin`

## API Integration

API access is organized in the `src/services` layer and built on Axios + TanStack Query.

- Centralized request logic and error handling
- Query caching and invalidation for responsive UI updates
- Mutations for application, profile, and job workflows

## Deployment

### Production Build

```bash
npm run build
```

Build artifacts are generated in the `dist` directory.

### Vercel

This repository includes `vercel.json`. Typical deployment flow:

```bash
vercel
```

For production:

```bash
vercel --prod
```

Make sure environment variables are configured in the Vercel project settings.

## Quality and Maintenance

Recommended pre-merge checks:

```bash
npm run typecheck
npm run lint
npm run build
```

Good practices followed by this client:

- Feature-oriented page grouping
- Strong typing in shared domain models
- Reusable UI primitives and consistent service layer patterns

## Troubleshooting

### App cannot connect to API

- Verify `VITE_API_BASE_URL` value
- Confirm backend server is running
- Check CORS settings on backend

### Build or type errors

- Run `npm install` again if dependency graph changed
- Run `npm run typecheck` to isolate TS issues
- Ensure Node version is compatible with Vite/TypeScript

### Blank page after deploy

- Check environment variables in host dashboard
- Confirm SPA routing rewrite rules are configured

## Backend Reference

Backend repository:

- https://github.com/Arifulit/job-portal-server

Start backend first, then run this client.

## Contributing

1. Fork the repository
2. Create a branch from `main`
3. Make focused, testable changes
4. Run lint, typecheck, and build locally
5. Open a pull request with a clear summary

## License

MIT License
