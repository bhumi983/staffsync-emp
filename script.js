// --- Supabase Configuration ---
// Replace these with your actual Supabase project URL and anon/publishable key.
const SUPABASE_URL ='https://swbqtenrlakgauvuqpds.supabase.co';
const SUPABASE_ANON_KEY ='sb_publishable_BY2y_p5-3RJuPwux4ai7ZQ_T4sGcDPd';

const supabaseClient =
  window.supabase &&
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR-PROJECT-REF') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

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
const emptyStateText = document.getElementById('empty-state-text');
const resetDemoBtn = document.getElementById('reset-demo-btn');
const statusBanner = document.getElementById('status-banner');

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

const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const loginSubmitBtn = document.getElementById('login-submit-btn');

const openForgotBtn = document.getElementById('open-forgot-btn');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const forgotForm = document.getElementById('forgot-form');
const forgotEmailInput = document.getElementById('forgot-email');
const forgotError = document.getElementById('forgot-error');
const forgotSuccess = document.getElementById('forgot-success');
const sendResetBtn = document.getElementById('send-reset-btn');

const recoveryForm = document.getElementById('recovery-form');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const recoveryError = document.getElementById('recovery-error');
const updatePasswordBtn = document.getElementById('update-password-btn');

const defaultEmployees = [
  { id: 101, name: 'Rohan Verma', email: 'rohan.v@staffsync.in', dept: 'Engineering', role: 'Frontend Developer', salary: 55000, status: 'Active' },
  { id: 102, name: 'Priya Nair', email: 'priya.n@staffsync.in', dept: 'HR', role: 'Talent Acquisition Lead', salary: 48000, status: 'Active' },
  { id: 103, name: 'Kabir Mehta', email: 'kabir.m@staffsync.in', dept: 'Finance', role: 'Accounts Executive', salary: 42000, status: 'On Leave' },
  { id: 104, name: 'Sneha Kulkarni', email: 'sneha.k@staffsync.in', dept: 'Design', role: 'UI/UX Designer', salary: 50000, status: 'Active' }
];

let employees = [];
let isAdminLoggedIn = false;
let isLoadingEmployees = false;
let loadErrorMessage = '';
let bannerTimer = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showBanner(message, type = 'info') {
  if (!message || !statusBanner) return;
  statusBanner.textContent = message;
  statusBanner.className = `status-toast status-${type}`;
  statusBanner.classList.remove('hidden');

  if (bannerTimer) clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    statusBanner.classList.add('hidden');
  }, 6000);
}

function applyRolePOV() {
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
    resetFormMode();
  }
}

// --- Auth Modal Controls ---
function openModal(mode = 'login') {
  authModal.classList.remove('hidden');
  loginError.classList.add('hidden');
  forgotError.classList.add('hidden');
  forgotSuccess.classList.add('hidden');
  recoveryError.classList.add('hidden');

  if (mode === 'forgot') {
    showForgotView();
  } else if (mode === 'recovery') {
    showRecoveryView();
  } else {
    showLoginView();
  }
}

function closeModal() {
  authModal.classList.add('hidden');
  loginForm.reset();
  forgotForm.reset();
  recoveryForm.reset();
}

function showLoginView() {
  authTitle.textContent = 'Admin Sign In';
  authSubtitle.textContent = 'Sign in to manage employees, salaries, and records.';
  loginForm.classList.remove('hidden');
  forgotForm.classList.add('hidden');
  recoveryForm.classList.add('hidden');
  loginError.classList.add('hidden');
}

function showForgotView() {
  authTitle.textContent = 'Reset Admin Password';
  authSubtitle.textContent = 'We will email a password reset link to your registered admin address.';
  loginForm.classList.add('hidden');
  forgotForm.classList.remove('hidden');
  recoveryForm.classList.add('hidden');
  forgotError.classList.add('hidden');
  forgotSuccess.classList.add('hidden');
  forgotEmailInput.value = loginEmailInput.value.trim();
}

function showRecoveryView() {
  authTitle.textContent = 'Set New Password';
  authSubtitle.textContent = 'Enter a new password for your admin account.';
  loginForm.classList.add('hidden');
  forgotForm.classList.add('hidden');
  recoveryForm.classList.remove('hidden');
  recoveryError.classList.add('hidden');
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
}

openLoginBtn.addEventListener('click', () => openModal('login'));
bannerLoginBtn.addEventListener('click', () => openModal('login'));
closeModalBtn.addEventListener('click', closeModal);
openForgotBtn.addEventListener('click', () => openModal('forgot'));
backToLoginBtn.addEventListener('click', () => openModal('login'));

authModal.addEventListener('click', (e) => {
  if (e.target === authModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Login Handler via Supabase Auth
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  loginError.classList.add('hidden');

  if (!supabaseClient) {
    loginError.textContent = 'Supabase is not configured yet. Add your project URL and anon key in script.js.';
    loginError.classList.remove('hidden');
    return;
  }

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  loginSubmitBtn.disabled = true;
  loginSubmitBtn.textContent = 'Signing in...';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  loginSubmitBtn.disabled = false;
  loginSubmitBtn.textContent = 'Sign In as Admin';

  if (error) {
    loginError.textContent = error.message || 'Invalid admin email or password.';
    loginError.classList.remove('hidden');
    return;
  }

  closeModal();
  showBanner('Signed in as Admin.', 'success');
});

// Forgot Password Handler via Supabase Auth
forgotForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  forgotError.classList.add('hidden');
  forgotSuccess.classList.add('hidden');

  if (!supabaseClient) {
    forgotError.textContent = 'Supabase is not configured yet. Add your project URL and anon key in script.js.';
    forgotError.classList.remove('hidden');
    return;
  }

  const email = forgotEmailInput.value.trim();
  if (!email) {
    forgotError.textContent = 'Please enter your registered admin email.';
    forgotError.classList.remove('hidden');
    return;
  }

  sendResetBtn.disabled = true;
  sendResetBtn.textContent = 'Sending link...';

  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });

  sendResetBtn.disabled = false;
  sendResetBtn.textContent = 'Send Reset Link';

  if (error) {
    forgotError.textContent = error.message || 'Could not send password reset email.';
    forgotError.classList.remove('hidden');
    return;
  }

  forgotSuccess.textContent = 'Password reset link sent. Check your inbox and spam folder.';
  forgotSuccess.classList.remove('hidden');
});

// Recovery Password Update Handler
recoveryForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  recoveryError.classList.add('hidden');

  if (!supabaseClient) return;

  const pass1 = newPasswordInput.value;
  const pass2 = confirmPasswordInput.value;

  if (pass1.length < 6) {
    recoveryError.textContent = 'Password must be at least 6 characters long.';
    recoveryError.classList.remove('hidden');
    return;
  }

  if (pass1 !== pass2) {
    recoveryError.textContent = 'Passwords do not match.';
    recoveryError.classList.remove('hidden');
    return;
  }

  updatePasswordBtn.disabled = true;
  updatePasswordBtn.textContent = 'Updating...';

  const { error } = await supabaseClient.auth.updateUser({ password: pass1 });

  updatePasswordBtn.disabled = false;
  updatePasswordBtn.textContent = 'Update Password';

  if (error) {
    recoveryError.textContent = error.message || 'Failed to update password.';
    recoveryError.classList.remove('hidden');
    return;
  }

  closeModal();
  showBanner('Password updated successfully.', 'success');
});

logoutBtn.addEventListener('click', async () => {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    showBanner('Error signing out: ' + error.message, 'error');
  } else {
    showBanner('Signed out to Viewer Mode.', 'info');
  }
});

// --- Employee & Directory Logic ---
function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'EM';
}

function formatINR(num) {
  return '₹' + Number(num || 0).toLocaleString('en-IN');
}

function updateStats() {
  const total = employees.length;
  const active = employees.filter(e => e.status === 'Active').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;
  const payroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);

  statTotal.textContent = total;
  statActive.textContent = active;
  statLeave.textContent = onLeave;
  statPayroll.textContent = formatINR(payroll);
}

async function fetchEmployees() {
  loadErrorMessage = '';

  if (!supabaseClient) {
    employees = [...defaultEmployees];
    renderTable();
    showBanner('Running in offline preview mode. Configure Supabase URL & Anon Key in script.js.', 'info');
    return;
  }

  isLoadingEmployees = true;
  renderTable();

  try {
    const { data, error } = await supabaseClient
      .from('employees')
      .select('id, name, email, dept, role, salary, status, created_at')
      .order('id', { ascending: false });

    isLoadingEmployees = false;

    if (error) {
      console.error('Supabase fetchEmployees error:', error);
      loadErrorMessage = `Database error: ${error.message}. Run sql.sql in Supabase SQL Editor and verify your project URL/key.`;
      showBanner(loadErrorMessage, 'error');
      renderTable();
      return;
    }

    employees = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    isLoadingEmployees = false;
    console.error('Unexpected fetchEmployees error:', err);
    loadErrorMessage = 'Network or configuration error connecting to Supabase. Check browser console (F12).';
    showBanner(loadErrorMessage, 'error');
    renderTable();
  }
}

function renderTable() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedDept = filterDept.value;

  const filtered = employees.filter(emp => {
    const matchesSearch =
      String(emp.name || '').toLowerCase().includes(query) ||
      String(emp.role || '').toLowerCase().includes(query) ||
      String(emp.email || '').toLowerCase().includes(query);

    const matchesDept = selectedDept === 'All' || emp.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  tbody.innerHTML = '';

  if (isLoadingEmployees) {
    emptyStateText.textContent = 'Loading employee directory...';
    emptyState.classList.remove('hidden');
    updateStats();
    return;
  }

  if (loadErrorMessage) {
    emptyStateText.textContent = loadErrorMessage;
    emptyState.classList.remove('hidden');
    updateStats();
    return;
  }

  if (filtered.length === 0) {
    emptyStateText.textContent =
      employees.length === 0
        ? 'No employee records in database yet. Sign in as Admin to add employees or run the seed SQL.'
        : 'No matching employees found.';
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filtered.forEach(emp => {
    const tr = document.createElement('tr');
    const statusClass = emp.status === 'Active' ? 'status-active' : 'status-leave';
    const safeId = Number(emp.id);

    const actionCellHtml = isAdminLoggedIn
      ? `
        <td>
          <div class="action-btns">
            <button type="button" class="icon-btn edit-btn" data-action="edit" data-id="${safeId}">Edit</button>
            <button type="button" class="icon-btn del-btn" data-action="delete" data-id="${safeId}">Delete</button>
          </div>
        </td>
      `
      : '';

    tr.innerHTML = `
      <td>
        <div class="emp-profile">
          <div class="avatar">${escapeHtml(getInitials(emp.name))}</div>
          <div>
            <h4>${escapeHtml(emp.name)}</h4>
            <small>${escapeHtml(emp.email)}</small>
          </div>
        </div>
      </td>
      <td>
        <span class="dept-tag">${escapeHtml(emp.dept)}</span>
        <span class="role-text">${escapeHtml(emp.role)}</span>
      </td>
      <td class="salary-cell">${formatINR(emp.salary)}</td>
      <td><span class="status-pill ${statusClass}">${escapeHtml(emp.status)}</span></td>
      ${actionCellHtml}
    `;

    tbody.appendChild(tr);
  });

  updateStats();
}

tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || !isAdminLoggedIn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'edit') {
    editEmployee(id);
  } else if (action === 'delete') {
    deleteEmployee(id);
  }
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!isAdminLoggedIn) {
    openModal('login');
    return;
  }

  const existingId = empIdInput.value ? Number(empIdInput.value) : null;
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    dept: deptInput.value,
    role: roleInput.value.trim(),
    salary: Number(salaryInput.value),
    status: statusInput.value
  };

  submitBtn.disabled = true;
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = existingId ? 'Saving...' : 'Adding...';

  if (!supabaseClient) {
    if (existingId) {
      employees = employees.map(emp => (emp.id === existingId ? { ...emp, ...payload } : emp));
      resetFormMode();
      showBanner('Employee updated (preview mode).', 'success');
    } else {
      employees.unshift({ id: Date.now(), ...payload });
      form.reset();
      showBanner('Employee added (preview mode).', 'success');
    }
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
    renderTable();
    return;
  }

  if (existingId) {
    const { data, error } = await supabaseClient
      .from('employees')
      .update(payload)
      .eq('id', existingId)
      .select()
      .single();

    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

    if (error) {
      showBanner('Failed to update employee: ' + error.message, 'error');
      return;
    }

    employees = employees.map(emp => (emp.id === existingId ? data : emp));
    resetFormMode();
    renderTable();
    showBanner('Employee record updated.', 'success');
  } else {
    const { data, error } = await supabaseClient
      .from('employees')
      .insert(payload)
      .select()
      .single();

    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;

    if (error) {
      showBanner('Failed to add employee: ' + error.message, 'error');
      return;
    }

    employees.unshift(data);
    form.reset();
    renderTable();
    showBanner('New employee added.', 'success');
  }
});

function editEmployee(id) {
  if (!isAdminLoggedIn) return;
  const emp = employees.find(e => Number(e.id) === id);
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
  nameInput.focus();
}

function resetFormMode() {
  empIdInput.value = '';
  form.reset();
  formHeading.textContent = 'Add New Employee';
  submitBtn.textContent = '+ Add Employee';
  cancelEditBtn.classList.add('hidden');
}

cancelEditBtn.addEventListener('click', resetFormMode);

async function deleteEmployee(id) {
  if (!isAdminLoggedIn) return;
  if (!confirm('Remove this employee record?')) return;

  if (!supabaseClient) {
    employees = employees.filter(emp => Number(emp.id) !== id);
    if (Number(empIdInput.value) === id) resetFormMode();
    renderTable();
    showBanner('Employee removed (preview mode).', 'success');
    return;
  }

  const { error } = await supabaseClient
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    showBanner('Failed to delete employee: ' + error.message, 'error');
    return;
  }

  employees = employees.filter(emp => Number(emp.id) !== id);
  if (Number(empIdInput.value) === id) resetFormMode();
  renderTable();
  showBanner('Employee record deleted.', 'success');
}

searchInput.addEventListener('input', renderTable);
filterDept.addEventListener('change', renderTable);

resetDemoBtn.addEventListener('click', async () => {
  if (!isAdminLoggedIn) return;
  if (!confirm('Restore default sample employees in the database?')) return;

  if (!supabaseClient) {
    employees = [...defaultEmployees];
    resetFormMode();
    renderTable();
    showBanner('Sample data restored (preview mode).', 'success');
    return;
  }

  const { error: deleteError } = await supabaseClient
    .from('employees')
    .delete()
    .neq('id', 0);

  if (deleteError) {
    showBanner('Failed to clear current records: ' + deleteError.message, 'error');
    return;
  }

  const seedRows = defaultEmployees.map(({ name, email, dept, role, salary, status }) => ({
    name,
    email,
    dept,
    role,
    salary,
    status
  }));

  const { error: insertError } = await supabaseClient
    .from('employees')
    .insert(seedRows);

  if (insertError) {
    showBanner('Failed to insert sample data: ' + insertError.message, 'error');
    return;
  }

  resetFormMode();
  await fetchEmployees();
  showBanner('Default sample employees restored.', 'success');
});

// --- Initialization & Auth Listener ---
async function initApp() {
  applyRolePOV();
  await fetchEmployees();

  if (!supabaseClient) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  isAdminLoggedIn = Boolean(session);
  applyRolePOV();
  renderTable();

  supabaseClient.auth.onAuthStateChange((event, currentSession) => {
    isAdminLoggedIn = Boolean(currentSession);
    applyRolePOV();
    renderTable();

    if (event === 'PASSWORD_RECOVERY') {
      openModal('recovery');
    }
  });
}

initApp();