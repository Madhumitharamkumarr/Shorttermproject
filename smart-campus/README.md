# PrepNPlace: Smart Placement & Interview Collaboration System

A complete full-stack MERN web application featuring a stunning Glassmorphism UI using Vanilla CSS.

## Features Included:
- **Role-Based Auth**: Admin and Student logins with JWT.
- **Student Profile**: Mandatory rich data collection on signup, with visual dashboard and PDF download simulation.
- **Admin Dashboard**: Analytics counter, Student listing, Company management.
- **Company & Applications**: Apply to companies and track application progress (Aptitude, Tech, HR).
- **Notifications**: System announcements with "Interested/Not Interested" mandatory responses.
- **Preparation Module**: Mock company-wise coding tests with simulation editor and quizzes.
- **Discussion Forum**: Post questions, reply, and upvote (Stack Overflow style).

## Requirements:
- Node.js (v16+)
- MongoDB (running locally on port 27017)

## Instructions to Run:

### 1. Database Initialization
From the root directory (`d:\Stpd\smart-campus`), navigate to the backend and import the dummy data:
```bash
cd backend
npm install
npm run data:import
```

The seeder script will populate the database with:
- **Admin**: `admin@prepnplace.com` / `admin123`
- **Student**: `student1@prepnplace.com` / `student123`
- **Dummy Data**: Companies, Mock Tests, etc.

### 2. Run the Backend API
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:5000`

### 3. Run the Frontend App
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```
The Vite React app will start on its specified local port (usually `http://localhost:5173`).

### 4. Testing the application
- Open the frontend URL in your browser.
- Login using the **Student** credentials to view the Student Dashboard, apply to companies, take mock tests, and visit the forum.
- Click on the "Profile" tab to simulate the PDF download feature.
- Login using the **Admin** credentials to view the Analytics dashboard and administrative controls.

## Design
Built using a custom CSS architecture utilizing Glassmorphism parameters (`backdrop-filter`) and animated gradients to deliver a very modern, unique, and premium look.
