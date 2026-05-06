# Student Resource Sharing Platform (SRSP)

A MERN stack web app for sharing academic resources.

## Prerequisites
- Node.js v16+
- MongoDB running locally on port 27017

## Setup & Run

### 1. Backend
```bash
cd server
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev
```
Server runs on http://localhost:5000

### 2. Frontend (new terminal)
```bash
cd client
npm start
```
App opens at http://localhost:3000

## Features
- Register / Login (JWT auth)
- Upload files (PDF, DOCX, etc.) with title, subject, department, category
- Browse & search resources
- Filter by department and category
- Download files (tracks download count)
- Rate resources (1–5 stars)
- Comment on resources
- Delete your own uploads

## Project Structure
```
├── server/
│   ├── models/       # User, Resource schemas
│   ├── routes/       # auth, resources API
│   ├── middleware/   # JWT auth guard
│   ├── uploads/      # Stored files
│   └── index.js
└── client/
    └── src/
        ├── pages/    # Home, Login, Register, Upload, MyResources
        ├── components/ # Navbar, ResourceCard
        └── context/  # AuthContext
```
"# Studen_resource_sharing_platform" 
"# Studen_resource_sharing_platform" 
