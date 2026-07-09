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

## Backend Overview

Auth works with two tokens. Access token is short-lived and goes in the response body. Refresh token is longer lived and goes in an httpOnly cookie so the frontend JS can't read it. When the access token expires the client hits /auth/refresh and gets a new pair silently. Passwords are hashed with bcrypt before saving, nothing plaintext anywhere.

Authorization is all server-side, not just hidden in the UI. There are three middleware layers — one checks if you're logged in, one checks if you're a member of the project, one checks if you have the right role (admin or manager). If any of these fail the request stops there.

Creating a project automatically adds the creator as an admin in the same transaction, so there's never a project with no owner.

For tasks I covered the full lifecycle — create, edit, move between statuses, reassign, delete. Status changes and reassigns both write an activity log entry in the same transaction so the audit trail is always in sync. Task listing supports filtering by status, assignee, priority, search by title, pagination and sorting — all done in SQL.

Comments work on a per-task basis. Every comment also logs an activity entry.

Input is validated with Joi on every route. Helmet is added for headers, rate limiting on auth routes, and Sequelize handles query parameterization so no raw SQL anywhere.

## Project Setup

### 1. Clone the Repository

A- Clone the repository and navigate to the project directory.

git clone https://github.com/aruncoding/task-management-platform.git
cd task-management-platform


### 2. Backend Setup

A- Navigate to the **backend** directory and run the following command "npm install" to install all project dependencies (this will create the `node_modules` folder)

B- Copy the .env.example file, rename it to .env, and update the environment variables with your local configuration before running the application.

```
NODE_ENV=development
PORT=3001
DATABASE_TYPE=mysql
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=
DATABASE_NAME=task_management_dev
JWT_ACCESS_SECRET=changeme_access_secret
JWT_REFRESH_SECRET=changeme_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

C- Start the backend server: npm run dev

Note: Database migrations are executed automatically when the backend server starts. No separate migration command is required.

D- To seed the database with demo data, run the following command: npm run seed

Note: To undo all seeders and remove demo data, run the following command: npm run seed:undo

---

### 3. Frontend Setup

## Frontend Setup

A- Navigate to the **frontend** directory and install all project dependencies using "npm i" command (this will create the `node_modules` folder).

B- Copy the `.env.example` file, rename it to `.env`, and update the environment variables with your local configuration.

C- Start the development server: npm run dev

Once both the backend and frontend servers are running, open the application in your browser using the frontend URL displayed in the terminal (typically `http://localhost:5173`).


## Database Design

The schema has 6 tables. The goal was to keep it normalized — no duplicated data, everything connected through foreign keys, and sensible ON DELETE behaviour so the database stays consistent without needing manual cleanup.

**users** — The base table. Stores name, email (must be unique), and a bcrypt password hash. No plaintext password is ever stored. An `is_active` flag is there so accounts can be disabled without deleting them.

**projects** — Each project has a name, an optional description, and an `owner_id` pointing to the user who created it. The owner is always an admin member of the project. If the owner's user account is deleted, the project is cascade-deleted too.

**project_members** — This is the join table between users and projects. It stores which user belongs to which project and what role they have (admin, manager, or member). The combination of `project_id` and `user_id` is unique, so a user can only appear once per project. Roles are per-project, meaning the same user can be a manager on one project and just a member on another.

**tasks** — Tasks belong to a project. Each task has a title, description, status (todo / in_progress / review / done), priority (low / medium / high / urgent), an optional assignee, an optional due date, and a `position` integer used for ordering within a status column. `created_by` and `updated_by` track who last touched the task. If the project is deleted, tasks are cascade-deleted. If the assignee's account is deleted, `assignee_id` is set to NULL (not cascade-deleted) so the task itself is not lost.

**task_comments** — Simple table. Each row is one comment on one task, written by one user. If the task or the user is deleted, the comment is cascade-deleted.

**activity_log** — An append-only log of things that happen inside a project. Every significant action (task created, status changed, reassigned, comment added) writes a row here with the actor's user id, the action name, and a JSON metadata field for any extra details like the old and new status. The `task_id` column is nullable so project-level events can also be logged without needing a task.

All foreign key columns have explicit ON DELETE behaviour defined. Cascades are used where the child data is meaningless without the parent (tasks without a project, comments without a task). SET NULL is used where the child should survive the parent being deleted (a task should not disappear just because the assignee left the team).

## Indexes and Why

* `users.email` — unique index, login always queries by email so this needs to be fast. Also enforces no duplicate accounts at the DB level.

* `projects.owner_id` — FK to users, indexed so listing a user's projects doesn't scan the whole table.

* `project_members.(project_id, user_id)` — composite unique index. The membership check ("is this user in this project?") hits both columns every request. Unique constraint also stops the same user being added twice.

* `tasks.(project_id, status)` — composite index for the board query which always filters on both. Without this the board would scan all tasks on every load.

* `tasks.assignee_id` — needed for filtering by assignee and for the ON DELETE SET NULL cascade to work without a full scan.

* `tasks.due_date` — for the background job that finds overdue or due-soon tasks. Range queries on dates are slow without this.

* `task_comments.task_id` — every task detail page loads all comments for that task. Simple FK index.

* `activity_log.project_id` — activity feed filters by project. This table gets large over time so the index matters.




