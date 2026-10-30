// PavionBank front-end: landing page + validated multi-step account application.
// Registration endpoint is configurable so it can match the existing server.js.
const API_BASE = window.PAVION_API_BASE || '';
const REGISTER_ENDPOINT = window.PAVION_REGISTER_ENDPOINT || '/api/register';
const LOGIN_ENDPOINT = window.PAVION_LOGIN_ENDPOINT || '/api/login';

const menuToggle = document.getElementById('menuToggle');
const navDrawer = document.getElementById('navDrawer');
const navDrawerOverlay = document.getElementById('navDrawerOverlay');
function closeNavigationDrawer() {
  if (navDrawer) navDrawer.classList.remove('open');
  if (navDrawerOverlay) navDrawerOverlay.classList.remove('open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }
}
if (menuToggle && navDrawer) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation menu');
  menuToggle.setAttribute('role', 'button');
  menuToggle.setAttribute('tabindex', '0');
  const toggleNavigation = () => {
    const opened = !navDrawer.classList.contains('open');
    navDrawer.classList.toggle('open', opened);
    if (navDrawerOverlay) navDrawerOverlay.classList.toggle('open', opened);
    menuToggle.setAttribute('aria-expanded', String(opened));
    menuToggle.setAttribute('aria-label', opened ? 'Close navigation menu' : 'Open navigation menu');
  };
  menuToggle.addEventListener('click', toggleNavigation);
  menuToggle.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggleNavigation(); }
  });
}
if (navDrawerOverlay) navDrawerOverlay.addEventListener('click', closeNavigationDrawer);
document.addEventListener('click', event => {
  if (navDrawer?.classList.contains('open') && !navDrawer.contains(event.target) && !menuToggle?.contains(event.target)) closeNavigationDrawer();
});
function showSection(sectionId) {
  document.querySelectorAll('body > section').forEach(sec => sec.classList.remove('active-section'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active-section');
  closeNavigationDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function setMessage(element, text, kind = 'info') {
  if (!element) return;
  element.textContent = text;
  element.className = `form-message show ${kind}`;
}
function clearMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.className = 'form-message';
}
function field(id) { return document.getElementById(id); }

function validateStep(stepNumber) {
  const step = field(`formStep${stepNumber}`);
  if (!step) return true;
  for (const input of step.querySelectorAll('input, select')) {
    if (input.type === 'file') continue;
    if (!input.checkValidity()) {
      input.reportValidity();
      input.focus();
      return false;
    }
  }
  if (stepNumber === 1) {
    const email = field('email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setCustomValidity('Enter a valid email address, such as name@example.com.');
      email.reportValidity(); email.focus(); email.setCustomValidity('');
      return false;
    }
    if (field('password').value !== field('confirmPassword').value) {
      field('confirmPassword').setCustomValidity('Passwords do not match.');
      field('confirmPassword').reportValidity(); field('confirmPassword').focus();
      field('confirmPassword').setCustomValidity('');
      return false;
    }
  }
  return true;
}
function nextStep(stepNumber) {
  const current = [...document.querySelectorAll('.form-step')].find(el => el.classList.contains('active'));
  if (current) {
    const currentNumber = Number(current.id.replace('formStep', ''));
    if (stepNumber > currentNumber && !validateStep(currentNumber)) return;
  }
  for (let i = 1; i <= 4; i++) {
    field(`formStep${i}`)?.classList.toggle('active', i === stepNumber);
    field(`tabIndicator${i}`)?.classList.toggle('active', i <= stepNumber);
  }
  clearMessage(field('registrationMessage'));
}
document.querySelectorAll('[data-next-step]').forEach(button =>
  button.addEventListener('click', () => nextStep(Number(button.dataset.nextStep)))
);
function resetRegistration() {
  field('multiStepForm')?.reset();
  nextStep(1);
  clearMessage(field('registrationMessage'));
  const submit = field('submitRegistration');
  if (submit) { submit.disabled = false; submit.textContent = 'Submit & Finish'; }
}
function getRegistrationPayload() {
  return {
    name: field('fullName').value.trim(),
    email: field('email').value.trim().toLowerCase(),
    phone: field('phone').value.trim(),
    password: field('password').value,
    accountType: field('accType').value,
    employmentStatus: field('employment').value,
    monthlyIncome: field('income').value,
    address: field('address').value.trim(),
    city: field('city').value.trim(),
    state: field('state').value.trim(),
    country: field('country').value.trim(),
    idType: field('idType').value,
    idNumber: field('idNumber').value.trim(),
    profilePhoto: window.pavionSignupSelfie || ''
  };
}
const registrationForm = field('multiStepForm');
if (registrationForm) registrationForm.addEventListener('submit', async event => {
  event.preventDefault();
  clearMessage(field('registrationMessage'));
  if (!validateStep(3)) return;
  if (!window.pavionSignupSelfie) { setMessage(field('registrationMessage'), 'Please upload a clear selfie to use as your profile picture.', 'error'); field('signupSelfie')?.focus(); return; }
  const submit = field('submitRegistration');
  submit.disabled = true; submit.textContent = 'Submitting...';
  try {
    const response = await fetch(`${API_BASE}${REGISTER_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(getRegistrationPayload())
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || `Registration failed (${response.status}).`);
    setMessage(field('registrationMessage'), data.message || 'Application submitted successfully. Your account is awaiting review.', 'success');
    nextStep(4);
  } catch (error) {
    setMessage(field('registrationMessage'), error instanceof TypeError
      ? 'Could not connect to the server. Confirm that the backend is running and that the registration endpoint is correct.'
      : error.message, 'error');
  } finally {
    submit.disabled = false; submit.textContent = 'Submit & Finish';
  }
});
const signupSelfieInput = field('signupSelfie');
if (signupSelfieInput) signupSelfieInput.addEventListener('change', () => {
  const file = signupSelfieInput.files && signupSelfieInput.files[0];
  window.pavionSignupSelfie = '';
  const preview = field('signupSelfiePreview');
  if (!file) { if (preview) preview.hidden = true; return; }
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) { setMessage(field('registrationMessage'), 'Choose a JPG, PNG, or WebP selfie.', 'error'); signupSelfieInput.value=''; return; }
  if (file.size > 300*1024) { setMessage(field('registrationMessage'), 'Your selfie must be 300 KB or smaller.', 'error'); signupSelfieInput.value=''; return; }
  const reader = new FileReader();
  reader.onload = () => { window.pavionSignupSelfie = String(reader.result || ''); if (preview) { preview.src=window.pavionSignupSelfie; preview.hidden=false; } clearMessage(field('registrationMessage')); };
  reader.readAsDataURL(file);
});
const loginButton = field('loginButton');
if (loginButton) loginButton.addEventListener('click', async () => {
  const email = field('loginEmail').value.trim().toLowerCase();
  const password = field('loginPassword').value;
  clearMessage(field('loginMessage'));
  if (!email || !field('loginEmail').checkValidity() || !password) {
    setMessage(field('loginMessage'), 'Enter a valid email address and password.', 'error');
    return;
  }
  loginButton.disabled = true; loginButton.textContent = 'Signing in...';
  try {
    const response = await fetch(`${API_BASE}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 403 && data.code === 'ACCOUNT_DEACTIVATED') {
      localStorage.removeItem('pavionToken');
      localStorage.removeItem('pavionUser');
      showSection('accountDeactivatedSection');
      return;
    }
    if (!response.ok) throw new Error(data.message || data.error || `Login failed (${response.status}).`);
    if (!data.token || !data.user) throw new Error('The server login response is missing account/session details.');
    localStorage.setItem('pavionToken', data.token);
    localStorage.setItem('pavionUser', JSON.stringify(data.user));
    setMessage(field('loginMessage'), 'Login successful.', 'success');
    await openCustomerDashboard(data.user, data.transactions || []);
  } catch (error) {
    setMessage(field('loginMessage'), error instanceof TypeError
      ? 'Could not connect to the server. Confirm the backend and login endpoint.'
      : error.message, 'error');
  } finally {
    loginButton.disabled = false; loginButton.textContent = 'Login to Dashboard';
  }
});


// Customer dashboard UI. This is a front-end preview until connected to real account APIs.
function showDashboardTab(tabName) {
  document.querySelectorAll('.dash-panel').forEach(panel => panel.classList.toggle('active', panel.id === `dashTab-${tabName}`));
  document.querySelectorAll('[data-dash-tab]').forEach(button => button.classList.toggle('active', button.dataset.dashTab === tabName));
  const notice = field('dashboardNotice');
  if (notice) notice.classList.remove('show');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
function showDashboardNotice(message) {
  const notice = field('dashboardNotice');
  if (!notice) return;
  notice.textContent = message;
  notice.classList.add('show');
  window.setTimeout(() => notice.classList.remove('show'), 5000);
}
function openDashModal(id) { field(id)?.classList.add('open'); }
function closeDashModal(id) { field(id)?.classList.remove('open'); }
function setTransferType(type, button) {
  document.querySelectorAll('.transfer-toggle button').forEach(btn => btn.classList.toggle('active', btn === button));
  const fields = field('internationalFields');
  if (fields) {
    fields.hidden = type !== 'international';
    fields.querySelectorAll('input').forEach(input => input.required = type === 'international');
  }
}

function money(value) {
  const amount = Number(value) || 0;
  return '$' + amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}
function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'});
}
function apiHeaders() {
  const token = localStorage.getItem('pavionToken');
  return {'Content-Type':'application/json','Accept':'application/json', ...(token ? {'Authorization':'Bearer '+token} : {})};
}
async function apiRequest(path, options={}) {
  const response = await fetch(`${API_BASE}${path}`, {...options, headers:{...apiHeaders(), ...(options.headers||{})}});
  const data = await response.json().catch(()=>({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('pavionToken'); localStorage.removeItem('pavionUser');
    }
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  return data;
}
function applyDashboardUser(user) {
  const displayName = (user && (user.fullName || user.name || user.username)) || 'Customer';
  const email = (user && user.email) || '';
  const firstName = displayName.trim().split(/\s+/)[0] || 'Customer';
  ['dashWelcomeName','dashTopName','dashProfileName','profileNameInput'].forEach(id => {
    const el = field(id); if (el) el.value !== undefined && el.tagName === 'INPUT' ? el.value = displayName : el.textContent = id === 'dashTopName' ? firstName : displayName;
  });
  const emailLabel = field('dashProfileEmail'); if (emailLabel) emailLabel.textContent = email || 'Signed in customer';
  const emailInput = field('profileEmailInput'); if (emailInput) emailInput.value = email;
  const avatarText = firstName.charAt(0).toUpperCase();
  ['dashProfileAvatar','dashTopAvatar'].forEach(id => { const el=field(id); if(el){ el.textContent=user.profilePhoto?'':avatarText; el.style.backgroundImage=user.profilePhoto?`url(\"${user.profilePhoto}\")`:''; el.style.backgroundSize='cover'; el.style.backgroundPosition='center'; el.setAttribute('aria-label', user.profilePhoto?'Profile picture':'Profile picture placeholder'); } });
  const phoneInput=field('profilePhoneInput'); if(phoneInput) phoneInput.value=user.phone||'';
  const currentPinWrap=field('currentPinWrap'); if(currentPinWrap) currentPinWrap.style.display=user.hasTransferPin?'flex':'none';
  const cardHolder=field('dashCardHolder'); if(cardHolder) cardHolder.textContent=firstName.toUpperCase();
  const number = user && user.accountNumber ? String(user.accountNumber) : '';
  document.querySelectorAll('.account-info span').forEach(el => { if(number) el.textContent = '•••• ' + number.slice(-4) + ' · Primary'; });
  const status = document.querySelector('.dash-welcome-row .account-status');
  if (status) status.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + (user.status === 'approved' ? 'Approved account' : 'Demo account');
}
function renderTransactions(transactions=[]) {
  const recent = field('recentTransactionsBody'), history = field('historyTransactionsBody');
  const rows = transactions.map(tx => {
    const credit = tx.type === 'deposit';
    const amount = Number(tx.amount) || 0;
    const rawDesc = String(tx.description || (credit ? 'Deposit' : 'Transfer'));
    const desc = credit && (tx.admin || /admin.*deposit|deposit.*admin/i.test(rawDesc)) ? 'Trace made deposits' : rawDesc;
    const type = credit ? 'Credit' : 'Debit';
    const icon = credit ? 'fa-arrow-down' : 'fa-arrow-up';
    const statusLabel = credit ? 'Received' : 'Sent';
    const statusClass = credit ? 'received' : 'sent';
    return `<tr><td><span class="transaction-icon ${credit?'':'debit'}"><i class="fa-solid ${icon}"></i></span><span class="transaction-name">${escapeHtml(desc)}</span></td><td>${dateLabel(tx.createdAt)}</td><td>${type}</td><td><span class="status-pill ${statusClass}">${statusLabel}</span></td><td class="align-right ${credit?'amount-positive':'amount-negative'}">${credit?'+':'−'}${money(amount)}</td></tr>`;
  }).join('');
  const empty = '<tr><td colspan="5" class="empty-table">No transactions yet.</td></tr>';
  if (recent) recent.innerHTML = rows || empty;
  if (history) history.innerHTML = rows || empty;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function renderDashboardData(data) {
  const user = data.user || JSON.parse(localStorage.getItem('pavionUser') || '{}');
  if (data.user) localStorage.setItem('pavionUser', JSON.stringify(data.user));
  applyDashboardUser(user);
  const balance = money(user.balance);
  ['dashBalance','dashAccountBalance','accountsBalance'].forEach(id => { const el=field(id); if(el) el.textContent=balance; });
  const transactions = data.transactions || [];
  window.pavionTransactions = transactions;
  renderTransactions(transactions);
  // Derive current-month inflows/outflows from the server-provided transaction list.
  const now = new Date();
  const monthTx = transactions.filter(tx => { const d=new Date(tx.createdAt); return !Number.isNaN(d.getTime()) && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); });
  const inflow = monthTx.filter(tx=>tx.type==='deposit').reduce((sum,tx)=>sum+(Number(tx.amount)||0),0);
  const outflow = monthTx.filter(tx=>tx.type!=='deposit').reduce((sum,tx)=>sum+(Number(tx.amount)||0),0);
  const amounts = document.querySelectorAll('#dashTab-home .summary-card .summary-amount');
  if (amounts[1]) amounts[1].textContent=money(inflow);
  if (amounts[2]) amounts[2].textContent=money(outflow);
}
async function openCustomerDashboard(user, transactions=[]) {
  applyDashboardUser(user || {});
  showSection('dashboardSection');
  showDashboardTab('home');
  renderDashboardData({user, transactions});
  try {
    const live = await apiRequest('/api/me');
    renderDashboardData(live);
  } catch (error) {
    showDashboardNotice(error.message + ' Please sign in again if your session expired.');
  }
}
async function logoutDashboard() {
  try {
    if (localStorage.getItem('pavionToken')) await apiRequest('/api/logout', {method:'POST', body:'{}'});
  } catch (_) {}
  localStorage.removeItem('pavionToken');
  localStorage.removeItem('pavionUser');
  showSection('homeSection');
}
async function saveDemoProfile() {
  const name=field('profileNameInput')?.value.trim(), email=field('profileEmailInput')?.value.trim(), phone=field('profilePhoneInput')?.value.trim()||'';
  if(!name||!email){showDashboardNotice('Enter your name and email address.');return;}
  try{const data=await apiRequest('/api/profile',{method:'POST',body:JSON.stringify({name,email,phone,profilePhoto:window.pavionPendingPhoto||''})});window.pavionPendingPhoto='';renderDashboardData(data);showDashboardNotice(data.message||'Profile saved.');}
  catch(error){showDashboardNotice(error.message);}
}
async function saveTransferPin(){
  const pin=field('newTransferPin')?.value||'', confirm=field('confirmTransferPin')?.value||'', currentPin=field('currentTransferPin')?.value||'';
  if(!/^\d{4}$/.test(pin)){showDashboardNotice('Choose a PIN containing exactly 4 digits.');return;}
  if(pin!==confirm){showDashboardNotice('The new PINs do not match.');return;}
  try{const data=await apiRequest('/api/transfer-pin',{method:'POST',body:JSON.stringify({pin,currentPin})});['newTransferPin','confirmTransferPin','currentTransferPin'].forEach(id=>{if(field(id))field(id).value='';});const user=JSON.parse(localStorage.getItem('pavionUser')||'{}');user.hasTransferPin=true;localStorage.setItem('pavionUser',JSON.stringify(user));applyDashboardUser(user);showDashboardNotice(data.message);}
  catch(error){showDashboardNotice(error.message);}
}
const profilePhotoInput=field('profilePhotoInput');
if(profilePhotoInput) profilePhotoInput.addEventListener('change',()=>{const file=profilePhotoInput.files&&profilePhotoInput.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){showDashboardNotice('Choose a JPG, PNG, or WebP image.');profilePhotoInput.value='';return;}if(file.size>300*1024){showDashboardNotice('Choose an image smaller than 300 KB.');profilePhotoInput.value='';return;}const reader=new FileReader();reader.onload=()=>{window.pavionPendingPhoto=String(reader.result||'');const avatar=field('dashProfileAvatar');if(avatar){avatar.textContent='';avatar.style.backgroundImage=`url(\"${window.pavionPendingPhoto}\")`;avatar.style.backgroundSize='cover';avatar.style.backgroundPosition='center';}showDashboardNotice('Picture selected. Tap Save profile to keep it.');};reader.readAsDataURL(file);});

function filterDemoTransactions() {
  const type = field('historyType')?.value || 'all';
  const transactions = window.pavionTransactions || [];
  const filtered = type === 'all' ? transactions : transactions.filter(tx => type === 'credit' ? tx.type === 'deposit' : tx.type !== 'deposit');
  renderTransactions(filtered);
}
document.querySelectorAll('.dash-modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', event => { if (event.target === backdrop) backdrop.classList.remove('open'); });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') document.querySelectorAll('.dash-modal-backdrop.open').forEach(modal => modal.classList.remove('open'));
});
const sendMoneyDemoForm = field('sendMoneyDemoForm');
let pendingDemoTransfer = null;
if (sendMoneyDemoForm) sendMoneyDemoForm.addEventListener('submit', event => {
  event.preventDefault();
  const recipient = field('transferRecipientName')?.value.trim();
  const accountNumber = field('transferAccountNumber')?.value.trim();
  const amount = Number(field('transferAmount')?.value);
  if (!recipient || !accountNumber || !Number.isFinite(amount) || amount <= 0) {
    showDashboardNotice('Enter recipient details and a valid transfer amount.'); return;
  }
  pendingDemoTransfer = {recipient: recipient + ' (' + accountNumber + ')', amount};
  const pinField = field('confirmTransferPinInput'); if (pinField) pinField.value='';
  const error = field('pinConfirmError'); if (error) error.textContent='';
  field('pinConfirmModal')?.classList.add('open');
  setTimeout(() => pinField?.focus(), 80);
});
function closePinConfirmation() { field('pinConfirmModal')?.classList.remove('open'); pendingDemoTransfer=null; }
const pinConfirmForm = field('pinConfirmForm');
if (pinConfirmForm) pinConfirmForm.addEventListener('submit', async event => {
  event.preventDefault();
  const pin = field('confirmTransferPinInput')?.value || '';
  const errorBox = field('pinConfirmError');
  if (!/^\d{4}$/.test(pin)) { if(errorBox) errorBox.textContent='Enter exactly 4 digits.'; return; }
  if (!pendingDemoTransfer) { closePinConfirmation(); return; }
  const button = pinConfirmForm.querySelector('button[type="submit"]');
  button.disabled=true; button.textContent='Verifying...';
  try {
    const data = await apiRequest('/api/transfer', {method:'POST', body:JSON.stringify({...pendingDemoTransfer, pin})});
    renderDashboardData(data);
    closePinConfirmation(); closeDashModal('sendModal');
    showDashboardNotice('Demo transfer recorded. No real money was sent.');
    sendMoneyDemoForm.reset();
    const localButton = document.querySelector('.transfer-toggle button');
    if (localButton) setTransferType('local', localButton);
  } catch(error) {
    if(errorBox) errorBox.textContent = error.message === 'Insufficient demo balance.' ? 'Insufficient demo balance. Contact an administrator to request a demo deposit.' : error.message;
  } finally { button.disabled=false; button.textContent='Confirm Transfer'; }
});
const pinBackdrop = field('pinConfirmModal');
if (pinBackdrop) pinBackdrop.addEventListener('click', event => { if(event.target===pinBackdrop) closePinConfirmation(); });
