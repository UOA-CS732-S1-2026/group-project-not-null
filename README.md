# UniDesk Backend

Student support ticket management system built with React, Node.js, Express, and MongoDB.

## Quick Start

### Prerequisites
- Node.js v24+
- npm
- MongoDB Atlas account

### Setup

1. Clone the repository:

git clone https://github.com/UOA-CS732-S1-2026/group-project-not-null.git
cd unidesk-backend

2. Install dependencies:

npm install

3. Create `.env` file (copy from `.env.example`):
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/unidesk
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
FRONTEND_URL=http://localhost:3000

4. Run the server:
npm run dev

Server runs on http://localhost:5000

## Project Structure

```text
.
├── frontend/                  (Frontend application)
│   ├── public/                (Static public assets)
│   ├── src/
│   │   ├── assets/            (Images, icons, fonts)
│   │   ├── components/        (Reusable UI components)
│   │   ├── hooks/             (Reusable React hooks)
│   │   ├── layouts/           (Page layout components)
│   │   ├── pages/             (Route-level screens)
│   │   ├── services/          (API client and backend calls)
│   │   ├── styles/            (Global styles and theme files)
│   │   ├── utils/             (Frontend helper functions)
│   │   ├── App.jsx            (Frontend app shell)
│   │   └── main.jsx           (Frontend entry point)
│   ├── index.html             (Frontend HTML entry)
│   └── package.json           (Frontend dependencies/scripts)
├── src/                       (Backend source)
│   ├── config/
│   │   └── database.js        (MongoDB connection)
│   ├── controllers/
│   │   ├── authController.js  (Authentication logic)
│   │   ├── ticketController.js (Ticket logic)
│   │   └── analyticsController.js (Analytics logic)
│   ├── middleware/
│   │   └── auth.js            (JWT verification)
│   ├── models/
│   │   ├── user.js            (User schema)
│   │   └── Ticket.js          (Ticket schema)
│   ├── routes/
│   │   ├── auth.js            (Auth endpoints)
│   │   ├── tickets.js         (Student ticket endpoints)
│   │   └── staff.js           (Staff endpoints)
│   └── utils/
│       └── tokenUtils.js      (Token helpers)
├── app.js                     (Express app setup)
├── server.js                  (Backend server entry point)
├── package.json               (Backend dependencies/scripts)
└── README.md
```

## Technologies

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **Password Security:** bcryptjs

## API Endpoints

See feature branch PRs for detailed endpoint documentation:
- `feature/backend-authentication` - Login/Register endpoints
- `feature/backend-student-tickets` - Ticket management endpoints
- `feature/backend-staff-management` - Staff features & analytics

## Environment Variables

| Variable | Description |
|----------|-------------|
| NODE_ENV | development/production |
| PORT | Server port (default 5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT tokens |
| JWT_EXPIRY | Access token expiry (default 7d) |
| REFRESH_TOKEN_EXPIRY | Refresh token expiry (default 30d) |
| FRONTEND_URL | Frontend URL for CORS |

## Team

Team Not Null - CS732 Group Project

## Getting Help

Check individual feature branch PRs for implementation details and API documentation.