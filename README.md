# Student Management System

Project made as a part of xebia internship drive.

A small web app I put together to manage student records. Nothing fancy — you can add students, edit them, delete them, and search through the list. It runs locally with a single command.

I went with Node + Express on the backend and plain HTML/CSS/JS on the frontend because I wanted to keep the moving parts to a minimum. SQLite handles storage so there's no separate database to install or configure.

## What's inside

- A REST API for student records (create, read, update, delete)
- A static frontend that talks to that API
- A live search box that filters by name, roll number, course, or email
- Form validation on both ends so you don't end up with empty or duplicate records
- A unique constraint on roll numbers — the API returns `409` if you try to reuse one

## Running it locally

You'll need Node 18 or newer. Then:

```bash
cd management_system
npm install
npm start
```

That starts the server on port 3000. Open http://localhost:3000 in your browser and you should see the UI.

If you're poking at the code, `npm run dev` uses Node's built-in `--watch` flag, so the server restarts when you save a file.

The SQLite database file (`students.db`) is created automatically the first time the server starts. It lives next to `server.js`. Delete it if you ever want a clean slate.

## The API

Everything lives under `/api/students`. Here's the shape of it:

| Method | Path                   | What it does                            |
|--------|------------------------|-----------------------------------------|
| GET    | `/api/students`        | List all students.                      |
| GET    | `/api/students/:id`    | Fetch one student by ID                 |
| POST   | `/api/students`        | Create a new student                    |
| PUT    | `/api/students/:id`    | Update a student                        |
| DELETE | `/api/students/:id`    | Remove a student                        |

A student record looks like this:

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

`name`, `roll_no`, and `course` are required when creating. `grade` and `email` are optional. The server will reject invalid email formats and empty strings.

### A few curl examples

Create:

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Rao","roll_no":"CS21-045","course":"B.Tech CSE","grade":"A","email":"asha@example.com"}'
```

Update just the grade (PUT accepts partial bodies):

```bash
curl -X PUT http://localhost:3000/api/students/1 \
  -H "Content-Type: application/json" \
  -d '{"grade":"A+"}'
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/students/1
```

Search:

```bash
curl "http://localhost:3000/api/students?search=asha"
```

## How the code is laid out

```
management_system/
├── server.js          
├── db.js              
├── package.json
├── public/            
│   ├── index.html    
│   ├── style.css
│   └── app.js         
├── students.db        
└── README.md
```

I kept the backend in a single `server.js` on purpose. With only one resource and five routes, splitting it into controllers and routers felt like overkill. If this ever grew (more entities, auth, reporting), I'd break it up then.

