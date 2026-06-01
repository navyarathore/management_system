# Student Management System

Simple CRUD app for managing student records.

**Stack:** Node.js + Express + SQLite (better-sqlite3) + static HTML/CSS/JS frontend.

## Features

- Add, view, edit, delete students
- Live search across name, roll number, course, and email
- REST API + decoupled static frontend
- Persistent SQLite storage with unique roll number constraint
- Input validation (server + client)

## Setup

```bash
cd management_system
npm install
npm start
```

Open http://localhost:3000

For auto-reload during development:

```bash
npm run dev
```

## REST API

Base URL: `http://localhost:3000/api/students`

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| GET    | `/api/students`     | List all students (optional `?search=<query>`) |
| GET    | `/api/students/:id` | Get one student              |
| POST   | `/api/students`     | Create a new student         |
| PUT    | `/api/students/:id` | Update a student (partial)   |
| DELETE | `/api/students/:id` | Delete a student             |

### Student schema

```json
{
  "id": 1,
  "name": "Asha Rao",
  "roll_no": "CS21-045",
  "course": "B.Tech CSE",
  "grade": "A",
  "email": "asha@example.com",
  "created_at": "2026-06-01 10:00:00"
}
```

Required on create: `name`, `roll_no`, `course`. `roll_no` must be unique.

### Example: create

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Rao","roll_no":"CS21-045","course":"B.Tech CSE","grade":"A","email":"asha@example.com"}'
```

### Example: update

```bash
curl -X PUT http://localhost:3000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"grade":"A+"}'
```

### Example: delete

```bash
curl -X DELETE http://localhost:3000/api/students/1
```

## Project Structure

```
management_system/
├── server.js          # Express app + REST routes
├── db.js              # SQLite connection + schema
├── package.json
├── public/            # Static frontend
│   ├── index.html
│   ├── style.css
│   └── app.js
└── students.db        # Auto-created on first run
```
