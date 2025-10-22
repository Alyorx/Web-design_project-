
// User System module:
//  register, login, logout, getRole, helpers
const STORAGE_KEY_USERS = "cp_users_v1";
const STORAGE_KEY_CURRENT = "cp_current_user_v1";

// Load users from LocalStorage
let users = loadFromStorage(STORAGE_KEY_USERS);
if (!users || users.length === 0) {
  // Only add default user if storage is empty
  users = [
    { id: 1, name: "Jana", email: "jana@test.com", password: "1234", role: "student" }
  ];
  saveUsers(); // save immediately to storage
}

// Load current user
let currentUser = loadFromStorage(STORAGE_KEY_CURRENT) || null;

function saveUsers() {
  try { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users)); } catch (e) {/* ignore */ }
}
function saveCurrent() {
  try { localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser)); } catch (e) {/* ignore */ }
}
function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

// Simple validator
function _validateUserData(userData) {
  if (!userData) return "User data is required.";
  if (!userData.name) return "Name is required.";
  if (!userData.email) return "Email is required.";
  if (!userData.password) return "Password is required.";
  return null;
}

// Register a new user
export function register(userData) {
  const v = _validateUserData(userData);
  if (v) {
    console.log("%c❌ Register error: " + v, "color:red; font-weight:bold;");
    return { ok: false, error: v };
  }
  if (users.find(u => u.email === userData.email)) {
    console.log("%c❌ Register error: Email already exists", "color:red; font-weight:bold;");
    return { ok: false, error: "Email already exists" };
  }
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id, name: userData.name, email: userData.email, password: userData.password, role: userData.role || "student" };
  users.push(newUser);
  saveUsers();
  console.log(`%c✅ User registered: ${newUser.name} (${newUser.email})`, "color:green; font-weight:bold;");
  return { ok: true, user: newUser };
}

// Login
export function login(email, password) {
  if (!email || !password) { console.log("%c❌ Login error: Missing credentials", "color:red;"); return false; }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) { console.log("%c❌ Invalid credentials", "color:red;"); return false; }
  currentUser = { ...user };
  saveCurrent();
  console.log(`%c Logged in: ${user.name}`, "color:blue; font-weight:bold;");
  return true;
}

// Logout
export function logout() {
  if (!currentUser) { console.log("%c⚠ No user logged in", "color:gray;"); return; }
  console.log(`%c Logged out: ${currentUser.name}`, "color:orange;");
  currentUser = null;
  saveCurrent();
}

// Get role of current user
export function getRole() {
  return currentUser?.role || null;
}

// Get currently logged user
export function getCurrentUser() {
  return currentUser;
}

// Admin helper: list users (no auth in demo)
export function listUsers() {
  console.log("%c Users:", "color:blue; font-weight:bold;", users);
  return users;
}