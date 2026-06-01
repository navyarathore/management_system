const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validateStudent(body, { partial = false } = {}) {
  const errors = [];
  const required = ['name', 'roll_no', 'course'];
  for (const field of required) {
    if (partial) {
      if (field in body && (typeof body[field] !== 'string' || body[field].trim() === '')) {
        errors.push(`${field} must be a non-empty string`);
      }
    } else if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  }
  for (const field of ['grade', 'email']) {
    if (field in body && body[field] !== null && typeof body[field] !== 'string') {
      errors.push(`${field} must be a string or null`);
    }
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('email is not valid');
  }
  return errors;
}

app.get('/api/students', (req, res) => {
  const search = (req.query.search || '').trim();
  let rows;
  if (search) {
    const like = `%${search}%`;
    rows = db.prepare(`
      SELECT * FROM students
      WHERE name LIKE ? OR roll_no LIKE ? OR course LIKE ? OR email LIKE ?
      ORDER BY id DESC
    `).all(like, like, like, like);
  } else {
    rows = db.prepare('SELECT * FROM students ORDER BY id DESC').all();
  }
  res.json(rows);
});

app.get('/api/students/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Student not found' });
  res.json(row);
});

app.post('/api/students', (req, res) => {
  const errors = validateStudent(req.body);
  if (errors.length) return res.status(400).json({ errors });
  try {
    const stmt = db.prepare(`
      INSERT INTO students (name, roll_no, course, grade, email)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      req.body.name.trim(),
      req.body.roll_no.trim(),
      req.body.course.trim(),
      req.body.grade ? req.body.grade.trim() : null,
      req.body.email ? req.body.email.trim() : null
    );
    const created = db.prepare('SELECT * FROM students WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'roll_no already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Student not found' });

  const errors = validateStudent(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ errors });

  const merged = {
    name: req.body.name?.trim() ?? existing.name,
    roll_no: req.body.roll_no?.trim() ?? existing.roll_no,
    course: req.body.course?.trim() ?? existing.course,
    grade: 'grade' in req.body ? (req.body.grade ? req.body.grade.trim() : null) : existing.grade,
    email: 'email' in req.body ? (req.body.email ? req.body.email.trim() : null) : existing.email,
  };

  try {
    db.prepare(`
      UPDATE students
      SET name = ?, roll_no = ?, course = ?, grade = ?, email = ?
      WHERE id = ?
    `).run(merged.name, merged.roll_no, merged.course, merged.grade, merged.email, req.params.id);
    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'roll_no already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', (req, res) => {
  const info = db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Student not found' });
  res.status(204).send();
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Student Management System running at http://localhost:${PORT}`);
});
