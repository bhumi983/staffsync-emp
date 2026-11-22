// --- DOM Elements: Employee & Directory ---
const form = document.getElementById('employee-form');
const formHeading = document.getElementById('form-heading');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const empIdInput = document.getElementById('emp-id');
const nameInput = document.getElementById('emp-name');
const emailInput = document.getElementById('emp-email');
const deptInput = document.getElementById('emp-dept');
const roleInput = document.getElementById('emp-role');
const salaryInput = document.getElementById('emp-salary');
const statusInput = document.getElementById('emp-status');

const searchInput = document.getElementById('search-input');
const filterDept = document.getElementById('filter-dept');
const tbody = document.getElementById('employee-tbody');
const emptyState = document.getElementById('empty-state');
const resetDemoBtn = document.getElementById('reset-demo-btn');

const statTotal = document.getElementById('stat-total');
const statActive = document.getElementById('stat-active');
const statLeave = document.getElementById('stat-leave');
const statPayroll = document.getElementById('stat-payroll');

// --- DOM Elements: Auth, Admin POV & Forgot Password ---
const authModal = document.getElementById('auth-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const openLoginBtn = document.getElementById('open-login-btn');
const bannerLoginBtn = document.getElementById('banner-login-btn');
const logoutBtn = document.getElementById('logout-btn');

const currentRolePill = document.getElementById('current-role-pill');
const viewerBanner = document.getElementById('viewer-banner');
const workspaceGrid = document.getElementById('workspace-grid');
const adminFormPanel = document.getElementById('admin-form-panel');
const adminOnlyEls = document.querySelectorAll('.admin-only');

const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const demoPassHint = document.getElementById('demo-pass-hint');

const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const openForgotBtn = document.getElementById('open-forgot-btn');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const forgotForm = document.getElementById('forgot-form');
const forgotStep1 = document.getElementById('forgot-step-1');
const forgotStep2 = document.getElementById('forgot-step-2');
const forgotEmailInput = document.getElementById('forgot-email');
const verifyEmailBtn = document.getElementById('verify-email-btn');
const forgotError = document.getElementById('forgot-error');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const resetError = document.getElementById('reset-error');

// --- Initial Data ---
const defaultEmployees = [
  { id: 101, name: 'Rohan Verma', email: 'rohan.v@staffsync.in', dept: 'Engineering', role: 'Frontend Developer', salary: 55000, status: 'Active' },
  { id: 102, name: 'Priya Nair', email: 'priya.n@staffsync.in', dept: 'HR', role: 'Talent Acquisition Lead', salary: 48000, status: 'Active' },
  { id: 103, name: 'Kabir Mehta', email: 'kabir.m@staffsync.in', dept: 'Finance', role: 'Accounts Executive', salary: 42000, status: 'On Leave' },
  { id: 104, name: 'Sneha Kulkarni', email: 'sneha.k@staffsync.in', dept: 'Design', role: 'UI/UX Designer', salary: 50000, status: 'Active' }
];

const defaultAdminAccount = {
  email: 'admin@staffsync.in',
  password: 'admin123'
};

let employees = JSON.parse(localStorage.getItem('staffsync_employees')) || defaultEmployees;
let adminAccount = JSON.parse(localStorage.getItem('staffsync_admin_creds')) || defaultAdminAccount;
let isAdminLoggedIn = localStorage.getItem('staffsync_admin_session') === 'true';

function saveEmployees() {
  localStorage.setItem('staffsync_employees', JSON.stringify(employees));
}

function saveAdminCreds() {
  localStorage.setItem('staffsync_admin_creds', JSON.stringify(adminAccount));
}

function setAdminSession(active) {
  isAdminLoggedIn = active;
  localStorage.setItem('staffsync_admin_session', active ? 'true' : 'false');
  if (!active) resetFormMode();
  applyRolePOV();
  renderTable();
}

function applyRolePOV() {
  demoPassHint.textContent = adminAccount.password;

  if (isAdminLoggedIn) {
    currentRolePill.textContent = 'Admin POV (Full Access)';
    currentRolePill.className = 'role-pill admin-pill';
    viewerBanner.classList.add('hidden');
    workspaceGrid.classList.remove('viewer-layout');
    openLoginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    adminOnlyEls.forEach(el => el.classList.remove('hidden'));
  } else {
    currentRolePill.textContent = 'Viewer Mode (Read-Only)';
    currentRolePill.className = 'role-pill viewer-pill';
    viewerBanner.classList.remove('hidden');
    workspaceGrid.classList.add('viewer-layout');
    adminFormPanel.classList.add('hidden');
    openLoginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    adminOnlyEls.forEach(el => el.classList.add('hidden'));
  }
}

// --- Auth Modal Controls ---
function openModal(mode = 'login') {
  authModal.classList.remove('hidden');
  loginError.classList.add('hidden');
  forgotError.classList.add('hidden');
  resetError.classList.add('hidden');

  if (mode === 'forgot') {
    showForgotView();
  } else {
    showLoginView();
  }
}

function closeModal() {
  authModal.classList.add('hidden');
  loginForm.reset();
  forgotForm.reset();
}

function showLoginView() {
  authTitle.textContent = 'Admin Sign In';
  authSubtitle.textContent = 'Sign in to manage employees, salaries, and records.';
  loginForm.classList.remove('hidden');
  forgotForm.classList.add('hidden');
  loginError.classList.add('hidden');
}

function showForgotView() {
  authTitle.textContent = 'Reset Admin Password';
  authSubtitle.textContent = 'Verify your registered admin email to set a new password.';
  loginForm.classList.add('hidden');
  forgotForm.classList.remove('hidden');
  forgotStep1.classList.remove('hidden');
  forgotStep2.classList.add('hidden');
  forgotError.classList.add('hidden');
  resetError.classList.add('hidden');
  forgotEmailInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
}

openLoginBtn.addEventListener('click', () => openModal('login'));
bannerLoginBtn.addEventListener('click', () => openModal('login'));
closeModalBtn.addEventListener('click', closeModal);
openForgotBtn.addEventListener('click', showForgotView);
backToLoginBtn.addEventListener('click', showLoginView);

authModal.addEventListener('click', (e) => {
  if (e.target === authModal) closeModal();
});

// Login Handler
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const enteredEmail = loginEmailInput.value.trim().toLowerCase();
  const enteredPass = loginPasswordInput.value;

  if (enteredEmail === adminAccount.email.toLowerCase() && enteredPass === adminAccount.password) {
    loginError.classList.add('hidden');
    closeModal();
    setAdminSession(true);
  } else {
    loginError.textContent = 'Invalid admin email or password.';
    loginError.classList.remove('hidden');
  }
});

// Forgot Password Step 1: Verify Email
verifyEmailBtn.addEventListener('click', function () {
  const email = forgotEmailInput.value.trim().toLowerCase();
  if (!email) {
    forgotError.textContent = 'Please enter the registered admin email.';
    forgotError.classList.remove('hidden');
    return;
  }

  if (email === adminAccount.email.toLowerCase()) {
    forgotError.classList.add('hidden');
    forgotStep1.classList.add('hidden');
    forgotStep2.classList.remove('hidden');
  } else {
    forgotError.textContent = 'No admin account found with that email.';
    forgotError.classList.remove('hidden');
  }
});

// Forgot Password Step 2: Save New Password
forgotForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const pass1 = newPasswordInput.value;
  const pass2 = confirmPasswordInput.value;

  if (pass1.length < 6) {
    resetError.textContent = 'Password must be at least 6 characters long.';
    resetError.classList.remove('hidden');
    return;
  }

  if (pass1 !== pass2) {
    resetError.textContent = 'Passwords do not match.';
    resetError.classList.remove('hidden');
    return;
  }

  adminAccount.password = pass1;
  saveAdminCreds();
  demoPassHint.textContent = adminAccount.password;
  resetError.classList.add('hidden');
  alert('Password updated successfully. Please sign in with your new password.');
  showLoginView();
  loginEmailInput.value = adminAccount.email;
});

logoutBtn.addEventListener('click', () => {
  setAdminSession(false);
});

// --- Employee & Directory Logic ---
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatINR(num) {
  return '₹' + Number(num).toLocaleString('en-IN');
}

function updateStats() {
  const total = employees.length;
  const active = employees.filter(e => e.status === 'Active').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;
  const payroll = employees.reduce((sum, e) => sum + Number(e.salary), 0);

  statTotal.textContent = total;
  statActive.textContent = active;
  statLeave.textContent = onLeave;
  statPayroll.textContent = formatINR(payroll);
}

function renderTable() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedDept = filterDept.value;

  const filtered = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query);

    const matchesDept = selectedDept === 'All' || emp.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filtered.forEach(emp => {
    const tr = document.createElement('tr');
    const statusClass = emp.status === 'Active' ? 'status-active' : 'status-leave';

    const actionCellHtml = isAdminLoggedIn
      ? `
        <td>
          <div class="action-btns">
            <button class="icon-btn edit-btn" onclick="editEmployee(${emp.id})">Edit</button>
            <button class="icon-btn del-btn" onclick="deleteEmployee(${emp.id})">Delete</button>
          </div>
        </td>
      `
      : '';

    tr.innerHTML = `
      <td>
        <div class="emp-profile">
          <div class="avatar">${getInitials(emp.name)}</div>
          <div>
            <h4>${emp.name}</h4>
            <small>${emp.email}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="dept-tag">${emp.dept}</span>
        <span class="role-text">${emp.role}</span>
      </td>
      <td class="salary-cell">${formatINR(emp.salary)}</td>
      <td><span class="status-pill ${statusClass}">${emp.status}</span></td>
      ${actionCellHtml}
    `;

    tbody.appendChild(tr);
  });

  updateStats();
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!isAdminLoggedIn) {
    openModal('login');
    return;
  }

  const existingId = empIdInput.value;

  const empData = {
    id: existingId ? Number(existingId) : Date.now(),
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    dept: deptInput.value,
    role: roleInput.value.trim(),
    salary: Number(salaryInput.value),
    status: statusInput.value
  };

  if (existingId) {
    employees = employees.map(emp => (emp.id === Number(existingId) ? empData : emp));
    resetFormMode();
  } else {
    employees.unshift(empData);
  }

  saveEmployees();
  renderTable();
  form.reset();
});

function editEmployee(id) {
  if (!isAdminLoggedIn) return;
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  empIdInput.value = emp.id;
  nameInput.value = emp.name;
  emailInput.value = emp.email;
  deptInput.value = emp.dept;
  roleInput.value = emp.role;
  salaryInput.value = emp.salary;
  statusInput.value = emp.status;

  formHeading.textContent = 'Edit Employee';
  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.classList.remove('hidden');
}

function resetFormMode() {
  empIdInput.value = '';
  form.reset();
  formHeading.textContent = 'Add New Employee';
  submitBtn.textContent = '+ Add Employee';
  cancelEditBtn.classList.add('hidden');
}

cancelEditBtn.addEventListener('click', resetFormMode);

function deleteEmployee(id) {
  if (!isAdminLoggedIn) return;
  if (confirm('Remove this employee record?')) {
    employees = employees.filter(emp => emp.id !== id);
    if (Number(empIdInput.value) === id) resetFormMode();
    saveEmployees();
    renderTable();
  }
}

searchInput.addEventListener('input', renderTable);
filterDept.addEventListener('change', renderTable);

resetDemoBtn.addEventListener('click', () => {
  if (!isAdminLoggedIn) return;
  if (confirm('Restore default sample employees?')) {
    employees = [...defaultEmployees];
    saveEmployees();
    resetFormMode();
    renderTable();
  }
});

// Initial load
applyRolePOV();
renderTable();