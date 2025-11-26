# Career-Code - Job Portal Frontend

A modern, enterprise-level job portal web application built with React, TypeScript, and TailwindCSS. Provides complete workflows for Candidates, recruiters, and Admins with real-time updates, beautiful UI, and robust authentication.

## Features

### For Candidates
- Browse and filter jobs by title, category, location, salary, and experience
- Apply for jobs with resume upload and cover letter
- Track application status (Applied → Shortlisted → Interview → Offered → Hired)
- Save favorite jobs for later
- Comprehensive dashboard with application insights
- Profile management

### For recruiters
- Post and manage job listings
- View and manage applicants
- Applicant pipeline management
- Analytics dashboard with job performance metrics
- Multi-recruiter support

### For Admins
- User management across all roles
- Job moderation and approval
- Platform analytics and insights
- System monitoring and reports

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + DaisyUI
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner
- **Authentication**: JWT (Access + Refresh Tokens)
- **API**: RESTful API integration

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running (see backend repository)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Career-Code
```

5. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/        # Shared UI components
│   ├── Navbar.tsx
│   ├── JobCard.tsx
│   ├── Modal.tsx
│   ├── Loader.tsx
│   └── ProtectedRoute.tsx
├── context/          # React context providers
│   └── AuthContext.tsx
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Jobs.tsx
│   ├── JobDetails.tsx
│   ├── SeekerDashboard.tsx
│   ├── recruiterDashboard.tsx
│   └── AdminDashboard.tsx
├── services/         # API services with TanStack Query
│   ├── jobService.ts
│   ├── applicationService.ts
│   └── userService.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   ├── api.ts
│   └── helpers.ts
└── App.tsx          # Main application component
```

## Authentication

The application uses JWT-based authentication with the following features:

- Secure token storage in localStorage
- Automatic token refresh
- Role-based access control
- Protected routes for each user type
- Automatic redirect on session expiry

## User Roles

1. **Candidate** - Browse jobs, apply, track applications
2. **recruiter** - Post jobs, manage applicants, view analytics
3. **Admin** - Manage users, moderate jobs, platform oversight

## API Integration

All API calls are handled through services in the `src/services/` directory using TanStack Query for:

- Automatic caching and background refetching
- Optimistic updates
- Error handling
- Loading states
- Request deduplication

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |
| VITE_APP_NAME | Application name | Career-Code |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Backend Repository

This frontend connects to the Career-Code backend API. Make sure the backend is running before starting the frontend.

Backend repository: https://github.com/Arifulit/job-portal-server

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
