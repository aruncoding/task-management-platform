# Team Project & Task Management Platform

## Overview

This project is a lightweight Team Project & Task Management Platform inspired by Jira/Trello. It allows teams to create projects, manage members with project-based roles (Admin, Manager, Member), and collaborate through task management.

The backend is built with Node.js, Express.js, and MySQL using a layered architecture (Routes → Controllers → Services → Models). It includes JWT authentication with refresh tokens, project-scoped role-based authorization (RBAC), project and task management, comments, activity logging, validation, and security best practices.

The frontend is built with React and provides authentication, protected routes, project management, a Kanban-style task board, member management, and task details with comments and activity history.

The primary focus of this project is clean architecture, secure API design, proper database normalization, and maintainable code.

## Technology Used

### Backend

* Node.js
* Express.js
* Sequelize ORM
* JWT (Access & Refresh Token Authentication)
* bcrypt
* Joi
* Helmet
* express-rate-limit

### Frontend

* React.js
* React Router
* Axios
* Vite

### Database

* MySQL

### Caching

* Node-Cache

### Development Tools

* Git & GitHub
* npm


## Features

* User authentication with JWT access and refresh tokens.
* Project-based Role-Based Access Control (Admin, Manager, Member).
* Create, update, delete, and manage projects.
* Add, remove, and manage project members.
* Create, assign, update, and delete tasks.
* Task status management using a Kanban-style board.
* Task comments and activity history tracking.
* Input validation, secure authentication, and rate limiting.

## Project Setup

### 1. Clone the Repository

A- Clone the repository and navigate to the project directory.

git clone https://github.com/aruncoding/task-management-platform.git
cd task-management-platform


### 2. Backend Setup

A- Navigate to the **backend** directory and run the following command "npm install" to install all project dependencies (this will create the `node_modules` folder)

B- Copy the .env.example file, rename it to .env, and update the environment variables with your local configuration before running the application.

C- Start the backend server: npm run dev

Note: Database migrations are executed automatically when the backend server starts. No separate migration command is required.

---

### 3. Frontend Setup

## Frontend Setup

A- Navigate to the **frontend** directory and install all project dependencies using "npm i" command (this will create the `node_modules` folder).

B- Copy the `.env.example` file, rename it to `.env`, and update the environment variables with your local configuration.

C- Start the development server: npm run dev

Once both the backend and frontend servers are running, open the application in your browser using the frontend URL displayed in the terminal (typically `http://localhost:5173`).




