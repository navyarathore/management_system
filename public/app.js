const API = '/api/students';

const form = document.getElementById('student-form');
const idInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const rollInput = document.getElementById('roll_no');
const courseInput = document.getElementById('course');
const gradeInput = document.getElementById('grade');
const emailInput = document.getElementById('email');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formError = document.getElementById('form-error');
const tbody = document.getElementById('students-body');
const searchInput = document.getElementById('search');

let searchTimer = null;

async function loadStudents(query = '') {
  const url = query ? `${API}?search=${encodeURIComponent(query)}` : API;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load students');
    const data = await res.json();
    renderRows(data);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">${err.message}</td></tr>`;
  }
}

function renderRows(rows) {
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">No students found.</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(s => `
    <tr data-id="${s.id}">
      <td>${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.roll_no)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${escapeHtml(s.grade || '')}</td>
      <td>${escapeHtml(s.email || '')}</td>
      <td>
        <div class="row-actions">
          <button class="small" data-action="edit" data-id="${s.id}">Edit</button>
          <button class="small danger" data-action="delete" data-id="${s.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function resetForm() {
  form.reset();
  idInput.value = '';
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Add Student';
  cancelBtn.hidden = true;
  formError.hidden = true;
  formError.textContent = '';
}

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;
  const payload = {
    name: nameInput.value.trim(),
    roll_no: rollInput.value.trim(),
    course: courseInput.value.trim(),
    grade: gradeInput.value.trim() || null,
    email: emailInput.value.trim() || null,
  };
  const id = idInput.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/${id}` : API;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data.error || (data.errors && data.errors.join(', ')) || 'Request failed';
      showError(msg);
      return;
    }
    resetForm();
    loadStudents(searchInput.value.trim());
  } catch (err) {
    showError(err.message);
  }
});

cancelBtn.addEventListener('click', resetForm);

tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === 'edit') {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) return;
    const s = await res.json();
    idInput.value = s.id;
    nameInput.value = s.name;
    rollInput.value = s.roll_no;
    courseInput.value = s.course;
    gradeInput.value = s.grade || '';
    emailInput.value = s.email || '';
    formTitle.textContent = `Edit Student #${s.id}`;
    submitBtn.textContent = 'Update Student';
    cancelBtn.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (action === 'delete') {
    if (!confirm('Delete this student?')) return;
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Failed to delete student.');
      return;
    }
    if (idInput.value === id) resetForm();
    loadStudents(searchInput.value.trim());
  }
});

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadStudents(searchInput.value.trim()), 200);
});

loadStudents();
