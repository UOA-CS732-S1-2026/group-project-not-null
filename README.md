# UniDesk

UniDesk is a full-stack student support ticketing system built for a university helpdesk workflow. It allows students to raise support queries, staff to manage and resolve tickets, and admins to approve staff accounts and oversee ticket operations.

## Deployment

- **Frontend:** [https://group-project-not-null-xrw8.vercel.app](https://group-project-not-null-xrw8.vercel.app)
- **Backend:** [https://group-project-not-null.onrender.com/api](https://group-project-not-null.onrender.com/api)



## Project Overview

UniDesk supports three user roles:

- `Student`: create tickets, track progress, view responses, and attach an optional image
- `Staff`: view department-relevant tickets, manage status, add notes, and resolve cases
- `Admin`: approve staff registrations, manage staff accounts, and assign tickets

The project includes a React frontend, an Express/MongoDB backend, JWT-based authentication, AI-assisted priority suggestion, archived ticket handling, and GridFS-backed image attachments.

## Core Features

### Student features

- Register and sign in
- Create a support ticket with:
  - title
  - category/department
  - urgency level
  - description
  - optional image attachment up to `25 MB`
- View ticket details and student-facing staff updates
- Track ticket status from open to resolved
- View ticket history on the dashboard

### Staff features

- Staff dashboard with queue, urgent tickets, analytics, and activity
- Department-based ticket visibility
- View full ticket details
- Assign tickets
- Update ticket status
- Add internal notes for staff
- Add student-visible notes
- Resolve and reopen tickets
- View archived tickets
- View student image attachments in a preview modal

### Admin features

- Approve or reject pending staff registrations
- Activate/deactivate staff accounts
- Promote staff to admin
- View all staff and users
- View and assign tickets
- Access archived tickets

### Automation and support logic

- AI-assisted priority suggestion during ticket creation
- Automatic escalation of unresolved tickets after 3 days
- Automatic archiving of resolved tickets after 24 hours
- Email notification on ticket creation

## Tech Stack

### Frontend

- React
- React Router
- Vite
- Vitest
- Testing Library

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- MongoDB GridFS for image attachments
- JWT authentication
- Jest + Supertest
- Nodemailer

## Repository Structure

```text
.
├── frontend/                  Frontend app
│   ├── src/
│   │   ├── components/        Reusable UI components
│   │   ├── pages/             Route-level pages
│   │   ├── services/          API helpers and mappers
│   │   └── __tests__/         Frontend tests
│   └── package.json
├── src/                       Backend app
│   ├── config/                Database configuration
│   ├── controllers/           Route controller logic
│   ├── middleware/            Auth middleware
│   ├── models/                Mongoose models
│   ├── routes/                Express routes
│   ├── services/              Business logic and background jobs
│   └── utils/                 Shared backend utilities
├── docs/                      Project documents
├── app.js                     Express app setup
├── server.js                  Backend server entry point
└── README.md
```

## Prerequisites

- Node.js `20+` recommended
- npm
- MongoDB database

## Environment Setup

### Backend `.env`

Create a root `.env` file based on `.env.example`.

Required variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
FRONTEND_URL=http://localhost:5173
NVIDIA_API_KEY=your-nvidia-api-key
EMAIL_USER=your-email-address
EMAIL_PASS=your-email-app-password
```

Notes:

- `FRONTEND_URL` should match your Vite dev server URL
- `NVIDIA_API_KEY` is used for AI priority suggestion
- `EMAIL_USER` and `EMAIL_PASS` are used for ticket email notifications

### Frontend `.env.local`

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation

### 1. Install backend dependencies

```bash
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the Project

### Start the backend

From the project root:

```bash
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## Test and Build Commands

### Backend

```bash
npm test
```

### Frontend tests

```bash
cd frontend
npm run test:run
```

### Frontend production build

```bash
cd frontend
npm run build
```

### Manual archive job

From the project root:

```bash
npm run archive:run
```

## Main Routes

### Frontend routes

- `/` landing page
- `/sign-in`
- `/sign-up`
- `/dashboard`
- `/tickets/new`
- `/tickets/:ticketId`
- `/staff/tickets`
- `/archive`
- `/admin`
- `/admin/tickets`
- `/admin/archive`

### Backend API routes

- `/api/auth/*`
- `/api/tickets/*`
- `/api/staff/*`
- `/api/admin/*`
- `/api/triage-priority`

## Attachments

UniDesk supports optional image attachments on student ticket creation.

- Supported: image MIME types such as PNG, JPEG, and WebP
- Max size: `25 MB`
- Storage: MongoDB GridFS
- Access: authorized users only

Only attachment metadata is stored on the `Ticket` document. The image itself is stored separately in GridFS to avoid MongoDB document size limits.

## Testing Status

The repository currently includes frontend tests for key pages and flows, including:

- sign in
- sign up
- dashboard
- create ticket
- view ticket
- staff dashboard
- admin tickets page

## Git Workflow

The team should continue to use a feature-branch workflow with regular, fine-grained commits.

Recommended workflow:

1. Create a branch for each feature or fix
2. Make small, focused commits with clear messages
3. Open a pull request into `dev`
4. Review and test before merging
5. Merge completed work into the shared integration branch

This aligns with the assignment expectation that every team member demonstrates personal contribution through regular commits.

## Wiki Expectations

The project wiki should include:

- weekly meeting minutes
- task breakdowns
- task ownership by team member
- progress updates and decisions

## Team

`Not Null`  
University of Auckland CS732 group project
